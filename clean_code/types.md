
1. `let isEditable =
      doc.sender.user && currentUserId === doc.sender.user.ati_id;`    
    `isEditable = isEditable && doc.sender.status === DRAFT` ->  
    `const isCurrentUserSender = currentUserId === doc.sender.user.ati_id`    
    `const isDraftDocument = doc.sender.status === DRAFT`    
    `const isEditable = doc.sender.user && isCurrentUserSender && isDraftDocument`  
    // разбил условие на логические переменные


2. GMT+3 - DEFAULT_TIMEZONE  
    // создана константа с тайм-зоной по умолчанию


3. `if (
          partInfo.method._text?.startsWith("б/н НДС ") &&
          !Object.values(payments[baseCurrencyKey]).includes(
            partInfo.method._text
          )` ->   
    `const isWithoutVAT = partInfo.method._text?.startsWith("б/н НДС ")`  
    `const isAvailablePaymentMethod = Object.values(payments[baseCurrencyKey]).includes(
            partInfo.method._text
          )`  
    `if(isWithoutVAT && !isAvailablePaymentMethod)...`   
    // добавил логические переменные


4. `if (
          signInfo[role] != null &&
          agent_id == signInfo[role].account_id &&
          agent.signed_by
        )` ->   
    `const isDocSignedBySenderOrReceiver = signInfo[role] != null`  
    `const isAgentSigned = agent.signed_by`  
    `const isAgentSenderOrReceiver = agent.ati_id == signInfo[role].account_id`  
    `const isDocSignedWithCert = isDocSignedBySenderOrReceiver && isAgentSigned && isAgentSenderOrReceiver`  
    // добавил логические переменные


5. Укажите получателя - ENTER_RECEIVER  
    // вынес часто используемую строку в константы


6. `if ( /^ON_[0-9a-zA-Z_-]{20,200}/.test(match.params.documentId))` ->  
    `const isUPDDocument = /^ON_[0-9a-zA-Z_-]{20,200}/.test(match.params.documentId)`  
    `if (isUPDDocument)...`
    // вынес сложное условие в логическую переменную


7. `if ((receiver && receiver.signed_by) || (sender && sender.signed_by))` ->   
    `const isSignedBySender = sender && sender.signed_by`  
    `const isSignedByReceiver = receiver && receiver.signed_by`  
    `if (isSignedBySender || isSignedByReceiver)...`  
    // добавил логические переменные


8. -180 - TIMEZONE_DIFF_IN_MINUTES  
    // создал константу с разницей между таймзонами в минутах


9. `if (organization.contactPersons && organization.contactPersons.length === 1)` ->   
    `const ifOrganizationHasOneContact = organization.contactPersons && organization.contactPersons.length === 1`  
    `if (ifOrganizationHasOneContact)...`  
    // добавил логическую переменную, объяснил magic number


10. certificate_inconsistent_data - INCONSISTENT_CERTIFICATE_DATA_ERROR  
    // вынес ошибку в константу


11. 3000 - TIMEOUT_BEFORE_SENDING_RECEIPT_MS  
    // вынес magic number в константу


12. 60 - MAX_PERSONAL_DATA_INPUT_LENGTH  
    // вынес максимальную длину для инпутов персональных данных пользователя (имя, фамилию, отчество)
    в константу

