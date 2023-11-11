

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
