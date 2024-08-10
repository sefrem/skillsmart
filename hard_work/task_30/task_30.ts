
// Пример 1.
// Метод не начинает звонок, если номер не валиден, однако по имени метода это никак не понять.
// Можно переименовать метод или вынести проверку номера на валидность в место вызова.

// Было
function startClickToCallNumber(phone: string): void {
    if (!LODASH.isString(phone) || LODASH.isEmpty(phone)) {
    return;
}

this.crmDataBridgeAndConference$.subscribe(([dataBridge, confState]) => {
    if (this.canStartNewCall(dataBridge)) {
        this.onStartClickToCall(phone);
    } else if (this.canStartTransfer(dataBridge, confState)) {
        this.onStartTransferToNumber(phone);
    }
});
}

// Стало
function isPhoneNumberValid(phoneNumber: any): boolean {
    return !LODASH.isString(phone) || LODASH.isEmpty(phone)
}

function startClickToCallNumber(phone: string): void {
    this.crmDataBridgeAndConference$.subscribe(([dataBridge, confState]) => {
        if (this.canStartNewCall(dataBridge)) {
            this.onStartClickToCall(phone);
        } else if (this.canStartTransfer(dataBridge, confState)) {
            this.onStartTransferToNumber(phone);
        }
    });
}

if (isPhoneNumberValid(phoneNumber)) {
    startClickToCallNumber(phoneNumber)
}

