

// ПРИМЕР 1

// В случае, если криптопро сервис успешно проинициализирован и если у пользователя есть сертификаты,
// для всех ЭДО юзеров пользователя ищем сертификаты и документы, ожидающие подписания. Затем для
// документов генерируем извещения о получении, подписываем их при помощи сертификата и отправляем.
// Проверять новые документы нужно каждые 3 минуты.
// На начало подписи, а также на успех и ошибки в процессе должны посылаться уведомления.


//Before

const signTokugawaReceipts = (certs: CertificateInfo[]): void => {
  if (window.receiptsInterval) return;

  window.receiptsInterval = setInterval(() => {
    const receipts = new ReceiptsHandler(
      () =>
        NotificationsManager.loading(
          "Автоматически подписываем извещение о получении документа"
        ),
      (reason: string) => NotificationsManager.success(reason),
      (reason: string) => NotificationsManager.error(reason),
      () => clearInterval(window.receiptsInterval)
    );
    receipts.startProcess(certs);
  }, 3 * 60 * 1000); // каждые три минуты
};

class ReceiptsHandler extends BaseHandler {
  constructor(onStart, onSuccess, onError, onStop) {
    super(onStart, onSuccess, onError, onStop);
  }

  handleReceipt = (id, edoId, cert, userId) => {
    const signerData = this.buildSignerData(cert.parsed);
    this.tokugawa.generateReceipt(
      id,
      signerData,
      {
        success: (result) => {
          CryptoproService.cryptopro
            .signData(result.base64, cert.raw)
            .then((sign) => {
              setTimeout(
                () => this.saveToMessage(result, sign, edoId, userId),
                3000
              );
            })
            .fail((e) => {
              this.onError(
                "Не удалось подписать извещение о получении документа"
              );
            });
        },
        error: () => {
          this.onError(
            "Не удалось сгенерировать извещение о получении документа"
          );
        },
      },
      userId
    );
  };

  getAwaitingConfirmDocuments = async (user) => {
    return await this.tokugawa.getAwaitingConfirm(user.id);
  };

  startProcess = async (certs) => {
    let edoUsers;
    if (CryptoproService.cryptopro.state.success) {
      if (!certs) {
        return;
      }

      try {
        edoUsers = await this.tokugawa.getUsers();
      } catch {
        this.onError("Не удалось получить информацию об участнике ЭДО");
        return;
      }

      if (edoUsers.length === 0) {
        this.onStop();
        return;
      }
      for (let user of edoUsers) {
        let docsToSign = await this.getAwaitingConfirmDocuments(user);
        if (docsToSign.length === 0) {
          continue;
        }

        let certForSign = CryptoproService.cryptopro.getCertificateByINN(
          user.inn,
          certs
        );

        if (!certForSign) {
          this.onError(
            `${
              user.full_name && fixQuot(user.full_name) + ": "
            }Не удалось найти подходящий для подписи сертификат ЭП`
          );
          continue;
        }
        this.onStart();

        for (let doc of docsToSign) {
          this.handleReceipt(doc.id, doc.edo_id, certForSign, user.id);
        }
      }
    }
  };
}

class BaseHandler {
  constructor(onStart, onSuccess, onError, onStop) {
    this.tokugawa = new Tokugawa(window.location.origin);
    this.onStart = onStart;
    this.onSuccess = onSuccess;
    this.onError = onError;
    this.onStop = onStop;
  }

  saveToMessage = (receipt, sign, edoId, userId) => {
    const formData = new FormData();
    let encodedDoc = iconv.encode(receipt.raw, "cp1251");
    let doc = new Blob(
      [encodedDoc],
      {
        type: "application/xml;charset=windows-1251",
      },
      "file.xml"
    );
    formData.append("document", doc);
    formData.append("sign", sign);

    this.tokugawa.saveToMessage(
      edoId,
      formData,
      {
        success: () => {
          this.onSuccess("Служебный документ успешно отправлен.");
        },
        error: (data) => {
          if (data?.detail?.code === "certificate_inconsistent_data") {
            this.onError(
              "Данный сертификат ЭП не подходит. Чтобы подписать документ, выберите другой сертификат из списка"
            );
          } else {
            this.onError(
              "Ошибка при отправке служебного документа. Попробуйте обновить страницу."
            );
          }
        },
      },
      userId
    );
  };

  buildSignerData = (cert) => {
    let givenName = cert.g.split(" "),
      surname = cert.sn,
      patronymic;

    if (givenName.length > 1) {
      patronymic = givenName[1];
    }
    return {
      signer: {
        position: cert.t || "сотрудник",
        first_name: givenName[0],
        last_name: surname,
        patronymic: patronymic,
      },
    };
  };
}

// After
// Нотификации по работе апи вынесены в апи сервис, сюда добавлять не стал.
// В новом коде нет наследования, есть один основной метод, посмотрев на который, можно уловить всю логику класса.
// Получилось на 20 строк короче
// Все заняло 6 часов

const receipts = new ReceiptsHandler();

const signTokugawaReceipts = (certs) => {
  receipts.handleReceipts(certs);
};


class ReceiptsHandler {
  intervalId = null;

  constructor() {
    this.edoApi = new Tokugawa(window.location.origin);
  }

  handleReceipts = (certs) => {
    if (this.intervalId || !CryptoproService.cryptopro.state.success || !certs) {
      return;
    }

    this.intervalId = setInterval(() => {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }

      this.generateSignAndSendReceipts(certs);
    }, 3 * 60 * 1000);
  };


  generateSignAndSendReceipts = async (certs) => {
    const docsToSignGroupedByUsers = await this.getDocsToSignGroupedByUsers();

    docsToSignGroupedByUsers.forEach(({ status, value: { user, docsToSign } }) => {
      if (status !== "fulfilled" || !docsToSign.length) return;

      const certificate = this.getUserCertificate(user, certs);
      if (!certificate) {
        return;
      }

      docsToSign.forEach(async doc => {
        const signerData = this.buildSignerData(certificate.parsed);
        const receipt = await this.edoApi.generateReceipt(doc.id, signerData, user.id);
        const signedReceipt = await this.signDocument(receipt.base64, certificate.raw);

        await this.saveToMessage(receipt, signedReceipt, doc.edo_id, user.id);
      });
    });
  };


  getDocsToSignGroupedByUsers = async () => {
    const edoUsers = await this.edoApi.getUsers();

    if (edoUsers.length === 0) {
      clearInterval(this.intervalId);
      return [];
    }

    return await Promise.allSettled(edoUsers.map(async (edoUser) =>
      ({
        user: edoUser,
        docs: await this.edoApi.getAwaitingConfirm(edoUser.id)
      })));
  };


  getUserCertificate = (user, certs) => {
    const certificate = CryptoproService.cryptopro.getCertificateByINN(
      user.inn,
      certs
    );

    if (!certificate) {
      NotificationsManager.error(
        `${user.full_name && fixQuot(user.full_name) + ": "} 
          Не удалось найти подходящий для подписи сертификат ЭП`
      );
      return null
    }

    return certificate
  }


  signDocument = async (document, certificate) => {
    try {
      NotificationsManager.loading(
        "Автоматически подписываем извещение о получении документа"
      );
      return await CryptoproService.cryptopro.signData(document, certificate);
    } catch {
      NotificationsManager.error(
        "Не удалось подписать извещение о получении документа"
      );
    }
  };

  saveToMessage = async (receipt, sign, edoId, userId) => {
    const data = this.prepareMessage(receipt, sign);

    return await this.edoApi.saveToMessage(edoId, data, userId);
  };


  prepareMessage(receipt, sign) {
    const formData = new FormData();
    let encodedDoc = iconv.encode(receipt.raw, "cp1251");
    let doc = new Blob(
      [encodedDoc],
      {
        type: "application/xml;charset=windows-1251"
      },
      "file.xml"
    );
    formData.append("document", doc);
    formData.append("sign", sign);

    return formData;
  }


  buildSignerData = (cert) => {
    let givenName = cert.g.split(" "),
      surname = cert.sn,
      patronymic;

    if (givenName.length > 1) {
      patronymic = givenName[1];
    }
    return {
      signer: {
        position: cert.t || "сотрудник",
        first_name: givenName[0],
        last_name: surname,
        patronymic: patronymic
      }
    };
  };
}




// ПРИМЕР 2


type ConfirmSendParams = {
  hideConfirmation?: boolean;
  withdrawMoney?: boolean;
};

// Класс, который отвечает за подпись и отправку загруженного пользователем документа. Документ может быть 2 типов - УПД и
// обычный документ (любой другой). Мы автоматически определяем тип документа, подписываем его при помощи сертификата пользователя.
// Пользователь или выбирает сертификат из выпадающего списка или мы сами берем первый из сертификатов пользователя.
// Перед подписью мы проверяем достаточно ли у пользователя средств на счете для подписи. Если до - подписываем документ. Если нет -
// показываем уведомление о необходимости пополнить счет. Если средств достаточно и пользователь при предыдущих подписях не
// ставил галочку "Не показывать уведомление" показываем уведомление о стоимости подписи. После подтверждения пользователя отправляем документ.
// Иначе сразу отправляем документ. Также можно отправить не УПД документ без подписи.

class SendDocumentStore {
  rootStore: RootStore;
  currentCert: CertificateInfo = {} as CertificateInfo;
  currentUser: EdoUser | null = null;
  currentDocId = "";
  showBuyAtis = false;
  isLoading = false;
  showConfirmPayment = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  get requestObject(): CreateDocReq {
    const result = {} as Indexable<CreateDocReq>;
    const keys = Object.keys(this.rootStore.uploadStore.fields);
    keys.forEach((key) => {
      const field = (this.rootStore.uploadStore.fields as Index)[key];
      if (field.value) {
        result[field.requestField || key] = field.value;
      }
    });

    return result;
  }


  getFormData = (): FormData => {
    const formData = new FormData();
    const file = this.rootStore.uploadStore.getUploadedFile();
    if (file) {
      formData.append("file_upload", file.data);
    }

    return formData;
  };

  handleSign = async (
    cert?: CertificateInfo
  ): Promise<AxiosResponse<MessagesResponse> | void> => {
    this.getCurrentCert();
    if (cert) {
      runInAction(() => {
        this.currentCert = cert;
      });
    }
    const isValid = this.validate();
    if (isValid) {
      try {
        await this.attachFile();

        return await this.handleAtisWriteoff();
      } catch (error) {
        this.handleResponseError(error);
      }
    }
  };

  handleSignUpd = async (
    cert?: CertificateInfo
  ): Promise<AxiosResponse<MessagesResponse> | void> => {
    this.setCurrentUser(cert);

    return await this.handleAtisWriteoff();
  };

  getCurrentCert = (): void => {
    this.currentCert = this.rootStore.certificatesStore.certificatesList[0];
  };

  getCertUser = (cert: CertificateInfo): EdoUser | undefined => {
    return this.rootStore.edoStore.users.filter(
      (user) => user.inn === cert.inn
    )[0];
  };

  setCurrentUser = (cert?: CertificateInfo): EdoUser | undefined => {
    this.getCurrentCert();
    if (cert) {
      runInAction(() => {
        this.currentCert = cert;
      });
    }

    const currentUser = this.getCertUser(this.currentCert);

    if (!currentUser) {
      NotificationManager.error(CERTIFICATE_COMPLY_ERROR);
      return;
    }

    runInAction(() => {
      this.currentUser = currentUser;
    });

    return currentUser;
  };

  handleResponseError = (error: unknown, text?: string): void => {
    this.setLoading(false);
    let errorText = "";
    if (axios.isAxiosError(error)) {
      errorText = error.response?.data.reason || text || SERVER_ERROR;
      NotificationManager.error(errorText);
    }
  };

  attachFile = async (): Promise<void> => {
    this.setLoading(true);
    try {
      const createResponse = await DocumentsApiService.createDoc(
        this.requestObject
      );
      runInAction(() => {
        this.currentDocId = createResponse.data.result;
      });
      await DocumentsApiService.createAttachment(
        this.currentDocId,
        this.getFormData()
      );
    } catch (error) {
      this.handleResponseError(error, DOCUMENT_SAVE_ERROR);
      throw new Error();
    }
  };

  writeOffAndSend = (hideConfirmation: boolean): void => {
    this.rootStore.uploadStore.isUpdUploaded
      ? this.confirmSendUpd({ hideConfirmation, withdrawMoney: true })
      : this.confirmSend({ hideConfirmation, withdrawMoney: true });
  };

  handleAtisWriteoff =
    async (): Promise<AxiosResponse<MessagesResponse> | void> => {
      const { isBillingEnabled, billing } = this.rootStore.configStore;

      const hideConfirmPaymentLS = localStorage.get(
        hidePaymentConfirmationParam
      );
      if (isBillingEnabled) {
        const balanceRes = await BalanceApiService.getBalance();
        if (balanceRes.data.result < Number(billing.signPrice)) {
          this.setBuyAtis(true);
          this.setLoading(false);
        } else if (!hideConfirmPaymentLS) {
          this.setConfirmPayment(true);
          this.setLoading(false);
        } else {
          return this.rootStore.uploadStore.isUpdUploaded
            ? await this.confirmSendUpd({ withdrawMoney: true })
            : await this.confirmSend({ withdrawMoney: true });
        }
      } else {
        return this.rootStore.uploadStore.isUpdUploaded
          ? await this.confirmSendUpd()
          : await this.confirmSend();
      }
    };

  confirmSend = async ({
                         hideConfirmation,
                         withdrawMoney
                       }: ConfirmSendParams = {}): Promise<void> => {
    const { billing } = this.rootStore.configStore;
    try {
      this.setLoading(true);
      const res = await DocumentsApiService.exportDoc(this.currentDocId);
      const base64 = res.data.result;
      const sign = await this.cryptoProSign(base64);
      if (sign) {
        await DocumentsApiService.sendDoc(
          this.currentDocId,
          this.rootStore.uploadStore.getRecipientId()
        );
        await DocumentsApiService.signDoc(this.currentDocId, { sign });
        this.setLoading(false);
        if (hideConfirmation) {
          localStorage.set(hidePaymentConfirmationParam, 1);
        }
        NotificationManager.success(DOCUMENT_SIGN_SUCCESS);
        if (withdrawMoney) {
          NotificationManager.success(`Списано ${billing.signPrice} атисов`);
        }
        this.postSend();
      }
    } catch (error) {
      this.handleResponseError(error);
    }
  };


  confirmSendUpd = async ({
                            hideConfirmation,
                            withdrawMoney,
                          }: ConfirmSendParams = {}): Promise<AxiosResponse<MessagesResponse> | void> => {
    try {
      const { billing } = this.rootStore.configStore;
      const data = await this.rootStore.uploadStore.prepareFormData();
      const response =
        this.currentUser &&
        (await DocumentsApiService.sendUpd(this.currentUser.id, data));
      if (response?.data.ok) {
        NotificationManager.success(DOCUMENT_SEND_SUCCESS);
        if (hideConfirmation) {
          localStorage.set(hidePaymentConfirmationParam, 1);
        }
        if (withdrawMoney) {
          NotificationManager.success(`Списано ${billing.signPrice} атисов`);
        }
        this.rootStore.sidebarStore.closePopup();
        this.reset();
        return response;
      }
    } catch (error: unknown) {
      if (isFastApiError(error) && isMessagesResponse(error.response?.data)) {
        if (error.response.data.detail?.code === "xml_validation_error") {
          NotificationManager.error(this.getUpdValidationError());
        } else {
          error.response?.data.detail &&
          NotificationManager.error(error.response.data.detail.description);
        }
      } else {
        this.handleResponseError(error, CONNECTION_ERROR);
      }
    }
  };

  handleSend = async (): Promise<void> => {
    const isValid = this.validate();
    if (isValid) {
      try {
        await this.attachFile();
        await DocumentsApiService.sendDoc(
          this.currentDocId,
          this.rootStore.uploadStore.getRecipientId()
        );
        this.setLoading(false);
        NotificationManager.success(DOCUMENT_SEND_SUCCESS);
        this.postSend();
      } catch (error) {
        this.handleResponseError(error);
        throw new Error();
      }
    }
  };

  validate = (): boolean => {
    const fields = Object.values(this.rootStore.uploadStore.fields);
    fields.forEach((field: StringField) => {
      if (field.setTouched) {
        field.setTouched(true);
      }
    });

    this.rootStore.uploadStore.file.setTouched(true);

    return (
      fields.every((field: StringField) => {
        return (!field.error && field.required) || !field.required;
      }) && !this.rootStore.uploadStore.file.error
    );
  };

  cryptoProSign = async (base64: string): Promise<string | void> => {
    try {
      return await this.rootStore.certificatesStore.signData(
        base64,
        this.currentCert
      );
    } catch (error) {
      let pluginError = "";

      const typedError = error as Error;
      if (error) {
        pluginError = typedError.message;
      } else if (typeof error === "string") {
        pluginError = error;
      }

      NotificationManager.error(
        `${SIGNATURE_CHECK_ERROR}${pluginError ? ` (${pluginError})` : ""}`
      );
      throw new Error();
    }
  };

  postSend = (): void => {
    this.rootStore.sidebarStore.closePopup();
    this.rootStore.uploadStore.reset();
  };

  reset = () => {
    this.currentDocId = "";
    this.rootStore.uploadStore.reset()
  }

  setLoading = (value: boolean): void => {
    this.isLoading = value;
  };

  setBuyAtis = (value: boolean): void => {
    this.showBuyAtis = value;
  };

  setConfirmPayment = (value: boolean): void => {
    this.showConfirmPayment = value;
  };

  getUpdValidationError = (): string => {
    return `Загруженный файл не соответствует государственному стандарту формата документов «${this.rootStore.uploadStore.getCurrentUpdName()}»`;
  };

}

function isFastApiError(value: unknown): value is FastApiError {
  return (value as FastApiError)?.response?.data !== undefined;
}

function isMessagesResponse(value: unknown): value is MessagesResponse {
  return (value as MessagesResponse)?.detail !== undefined;
}

export default SendDocumentStore


//After
// Все заняло 7-8 часов
// Получилось сделать код более упорядоченным, можно посмотреть на основные методы, которые будут вызываться
// из UI и понять, что и в какой последовательности будет происходить. Новый код примерно на 10% короче (около 40 строк).
// Тяжело в кодовой базе найти кусок кода, для которого можно описать его логический дизайн. Немало времени занял поиск
// подходящего кода.

class SendDocumentStore {
  uploadStore: UploadStore;
  certificatesStore: CertificatesStore;
  configStore: ConfigStore;
  edoStore: EdoStore;
  sidebarStore: SidebarStore;
  currentDocId = "";
  showBuyAtis = false;
  isLoading = false;
  showConfirmPayment = false;

  constructor(uploadStore: UploadStore,
              certificatesStore: CertificatesStore,
              configStore: ConfigStore,
              edoStore: EdoStore,
              sidebarStore: SidebarStore) {
    this.uploadStore = uploadStore;
    this.certificatesStore = certificatesStore;
    this.configStore = configStore;
    this.edoStore = edoStore;
    this.sidebarStore = sidebarStore;
  }

  get requestObject(): CreateDocReq {
    const result = {} as Indexable<CreateDocReq>;
    const keys = Object.keys(this.uploadStore.fields);
    keys.forEach((key) => {
      const field = (this.uploadStore.fields as Index)[key];
      if (field.value) {
        result[field.requestField || key] = field.value;
      }
    });

    return result;
  }

  handleDocumentSignAndSend = async (cert?: CertificateInfo): Promise<void> => {
    const currentCert = cert ? cert : this.certificatesStore.cert;

    if (!this.uploadStore.isUpdUploaded) {
      await this.createAttachement();
    }

    const isEnoughFunds = await this.checkBilling();
    const hideConfirmPaymentLS = localStorage.get(
      hidePaymentConfirmationParam
    );

    if (isEnoughFunds && !hideConfirmPaymentLS) {
      this.setConfirmPayment(true);
      this.setLoading(false);
    }

    if (isEnoughFunds && hideConfirmPaymentLS) {
      await this.genericDocumentSend({
        certificate: currentCert,
        documentSendFn: this.uploadStore.isUpdUploaded
          ? await this.confirmSendUpd
          : await this.confirmSend,
        withdrawMoney: true
      });
    }

    if (isEnoughFunds) {
      await this.genericDocumentSend({
        certificate: currentCert,
        documentSendFn: this.uploadStore.isUpdUploaded
          ? await this.confirmSendUpd
          : await this.confirmSend
      });

    }
    if (!isEnoughFunds) {
      this.setBuyAtis(true);
      this.setLoading(false);
    }
  };

  handleSend = async (): Promise<void> => {
    if (await this.createAttachement()) {
      await DocumentsApiService.sendDoc(
        this.currentDocId,
        this.uploadStore.getRecipientId()
      );
      NotificationManager.success(DOCUMENT_SEND_SUCCESS);
      this.reset();
    }
  };

  writeOffAndSend = async (hideConfirmation: boolean): Promise<void> => {
    await this.genericDocumentSend({
      certificate: this.certificatesStore.cert,
      documentSendFn: this.uploadStore.isUpdUploaded
        ? await this.confirmSendUpd
        : await this.confirmSend,
      withdrawMoney: true,
      hideConfirmation
    });
  };

  genericDocumentSend = async ({
                                 withdrawMoney,
                                 hideConfirmation,
                                 certificate,
                                 documentSendFn
                               }: GenericDocumentSendParams): Promise<void> => {
    try {
      this.setLoading(true);
      const response = await documentSendFn(certificate);

      if (response?.data.ok) {
        if (hideConfirmation) {
          localStorage.set(hidePaymentConfirmationParam, 1);
        }
        NotificationManager.success(DOCUMENT_SIGN_SUCCESS);
        if (withdrawMoney) {
          NotificationManager.success(`Списано ${this.configStore.billing.signPrice} атисов`);
        }
        this.reset();
      }
    } catch (error: unknown) {
      if (isFastApiError(error) && isMessagesResponse(error.response?.data)) {
        if (error.response.data.detail?.code === "xml_validation_error") {
          NotificationManager.error(this.getUpdValidationError());
        } else {
          error.response?.data.detail &&
          NotificationManager.error(error.response.data.detail.description);
        }
      } else {
        this.handleResponseError(error, CONNECTION_ERROR);
      }
    } finally {
      this.setLoading(false);
    }
  };

  confirmSend = async (cert: CertificateInfo): Promise<AxiosResponse<MessagesResponse> | null> => {
    const res = await DocumentsApiService.exportDoc(this.currentDocId);
    const base64 = res.data.result;
    const sign = await this.cryptoProSign(base64, cert);
    if (sign) {
      await DocumentsApiService.sendDoc(
        this.currentDocId,
        this.uploadStore.getRecipientId()
      );
      return await DocumentsApiService.signDoc(this.currentDocId, { sign });
    }
    return null;
  };

  confirmSendUpd = async (cert: CertificateInfo): Promise<AxiosResponse<MessagesResponse> | null> => {
    const updXmlString = this.uploadStore.updXmlString;
    const sign = await this.cryptoProSign(updXmlString, cert);
    const data = await this.uploadStore.prepareFormData();
    if (sign) {
      data.append("sign", sign);
    }
    const currentUser = this.getCertUser(cert);
    if (!currentUser) {
      NotificationManager.error(CERTIFICATE_COMPLY_ERROR);
      return null;
    }

    return await DocumentsApiService.sendUpd(currentUser.id, data);
  };

  checkBilling = async (): Promise<boolean> => {
    const { isBillingEnabled, billing } = this.configStore;
    if (!isBillingEnabled) {
      return true;
    }
    const userBalance = await BalanceApiService.getBalance();

    return userBalance.data.result >= Number(billing.signPrice);
  };

  createAttachement = async (): Promise<boolean> => {
    if (this.uploadStore.isFormValid) {
      try {
        await this.attachFile();
        return true;
      } catch (error) {
        this.handleResponseError(error);
      }
    }
    return false;
  };

  getFormData = (): FormData => {
    const formData = new FormData();
    const file = this.uploadStore.getUploadedFile();
    if (file) {
      formData.append("file_upload", file.data);
    }

    return formData;
  };

  getCertUser = (cert: CertificateInfo | undefined): EdoUser | undefined => {
    return this.edoStore.users.filter(
      (user) => user.inn === cert?.inn
    )[0];
  };

  attachFile = async (): Promise<AxiosResponse<CommonDocResponse>> => {
    this.setLoading(true);
    try {
      const createResponse = await DocumentsApiService.createDoc(
        this.requestObject
      );
      runInAction(() => {
        this.currentDocId = createResponse.data.result;
      });
      return await DocumentsApiService.createAttachment(
        this.currentDocId,
        this.getFormData()
      );
    } catch (error) {
      this.handleResponseError(error, DOCUMENT_SAVE_ERROR);
      throw new Error();
    } finally {
      this.setLoading(false);
    }
  };

  cryptoProSign = async (base64: string, cert: CertificateInfo): Promise<string | void> => {
    try {
      return await this.certificatesStore.signData(
        base64,
        cert
      );
    } catch (error) {
      let pluginError = "";

      if (error) {
        pluginError = error.message;
      } else if (typeof error === "string") {
        pluginError = error;
      }

      NotificationManager.error(
        `${SIGNATURE_CHECK_ERROR}${pluginError ? ` (${pluginError})` : ""}`
      );
      throw new Error();
    }
  };

  handleResponseError = (error: unknown, text?: string): void => {
    let errorText = "";
    if (axios.isAxiosError(error)) {
      errorText = error.response?.data.reason || text || SERVER_ERROR;
      NotificationManager.error(errorText);
    }
  };

  reset = (): void => {
    this.sidebarStore.closePopup();
    this.currentDocId = "";
    this.uploadStore.reset();
  };

  setLoading = (value: boolean): void => {
    this.isLoading = value;
  };

  setBuyAtis = (value: boolean): void => {
    this.showBuyAtis = value;
  };

  setConfirmPayment = (value: boolean): void => {
    this.showConfirmPayment = value;
  };

  getUpdValidationError = (): string => {
    return `Загруженный файл не соответствует государственному стандарту формата документов «${this.uploadStore.getCurrentUpdName()}»`;
  };

}

function isFastApiError(value: unknown): value is FastApiError {
  return (value as FastApiError)?.response?.data !== undefined;
}

function isMessagesResponse(value: unknown): value is MessagesResponse {
  return (value as MessagesResponse)?.detail !== undefined;
}

export default SendDocumentStore;