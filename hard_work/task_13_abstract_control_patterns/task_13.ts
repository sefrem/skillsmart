// Было.
// В методе последовательность действий - проверить предусловия, если они удовлетворяют нужным условиям, сделать
// апи-запрос, если данные из апи-запроса удовлетворяют нужным условиям, сделать нужные действия. В данном случае действие -
// вызов метода инициализации конкретного сертификата.

getCredentials = async (certId: string): Promise<void> => {
  if (this.certificates[certId].isDataLoaded) return;
  if (!this.currentUser) return;
  if (!this.currentUser.id) return;

  let result;

  try {
    result = await CredentialsApiService.getCredentials(
      certId,
      this.currentUser.id
    );
  } catch (e) {
    console.error(e);
  }

  if (!result) return;
  if (!result.data) return;
  if (result.status === 404) return;

  this.credentialsBody = result.data;

  this.certificates[certId].initData(result.data);
};

// После.
// Можно более явно показать этапы алгоритма, что может послужить основой для других подобных методов.


initCertWithCredentials = async (certId: string): Promise<void> => {
  if (!this.isPreConditionsValid(certId)) return;

  const response = await this.fetchData(certId, this.currentUser.id);

  this.doPostCondition(certId, response);
};

isPreConditionsValid = (certId: string): boolean => {
  return !this.certificates[certId].isDataLoaded && !!this.currentUser?.id
}

fetchData = async (certId: string, currentUserId: string): Promise<CredentialsResponse | null> => {
  let result;

  try {
    result = await CredentialsApiService.getCredentials(
      certId,
      currentUserId
    );
  } catch (e) {
    console.error(e);
  }

  return result?.data || null
};

doPostCondition = (certId: string, credentials: CredentialsResponse | null) => {
  if (credentials) {
    this.certificates[certId].initData(credentials);
  }
}




// Было.
// 2 метода с почти идентичной последовательностью действий.

revoke = async (doc, reason) => {
  let currentUser;
  if (window.cryptopro.state.success) {
    const certs = await getCertificates();
    if (!certs) {
      return;
    }

    const users = await this._getUsers();
    if (!users) {
      return;
    }

    for (let user of users) {
      if (this._checkUserCanSignDoc(user, doc)) {
        currentUser = user;
        break;
      }
    }
    if (!currentUser) {
      this.onError("Не удалось найти подходящего пользователя для подписи.");
      return;
    }
    const certForSign = getCertificateByInn(currentUser.inn, certs);
    if (!certForSign) {
      this.onError(
        `${fixQuot(
          currentUser.full_name
        )}: Не удалось найти подходящий для подписи сертификат ЭП`
      );
      return;
    }
    this.onStart();
    this.handleRevoke(doc.id, currentUser.id, certForSign, reason);
  }
};

correct = async (doc, reason) => {
  let currentUser;
  if (window.cryptopro.state.success) {
    const certs = await getCertificates();
    if (!certs) {
      return;
    }

    if (certs.length === 0) {
      this.onStop();
      return;
    }

    const users = await this._getUsers();
    if (!users) {
      return;
    }
    for (let user of users) {
      if (this._checkUserCanSignDoc(user, doc)) {
        currentUser = user;
        break;
      }
    }
    if (!currentUser) {
      this.onError("Не удалось найти подходящего пользователя для подписи.");
      return;
    }

    const certForSign = getCertificateByInn(currentUser.inn, certs);
    if (!certForSign) {
      this.onError(
        `${fixQuot(
          currentUser.full_name
        )}: Не удалось найти подходящий для подписи сертификат ЭП`
      );
      return;
    }

    this.onStart();
    this.handleCorrect(doc.id, currentUser.id, certForSign, reason);
  }
};

// Стало.
// Сделан один универсальный метод с более четкими логическими этапами.

handleCertificateAction = async ({ actionType, doc, reason }) => {
  if (!window.cryptopro.state.success) return;

  const certs = await getCertificates();
  if (!certs) return

  if (actionType === 'correction' && certs.length === 0) {
    this.onStop();
    return;
  }

  const currentUser = this.getCurrentUser(doc);
  if (!currentUser) return;

  const certForSign = this.getCertificateForSign(currentUser, certs);
  if (!certForSign) return;

  this.onStart();
  this.handleCorrect(doc.id, currentUser.id, certForSign, reason);
}

getCurrentUser = async (doc) => {
  let currentUser = null;
  const users = await this._getUsers();
  if (!users) {
    return;
  }
  for (let user of users) {
    if (this._checkUserCanSignDoc(user, doc)) {
      currentUser = user;
      break;
    }
  }
  if (!currentUser) {
    this.onError("Не удалось найти подходящего пользователя для подписи.");
  }
  return currentUser;
}

getCertificateForSign = async (currentUser, certs) => {
  const certForSign = getCertificateByInn(currentUser.inn, certs);
  if (!certForSign) {
    this.onError(
      `${fixQuot(
        currentUser.full_name
      )}: Не удалось найти подходящий для подписи сертификат ЭП`
    );
    return;
  }
  return certForSign
}

