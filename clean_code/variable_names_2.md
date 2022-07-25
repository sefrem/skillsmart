

6.1

    data - xmlSignFormData
    // в переменной - form data c xml-документом и его подписью
    
    commonParams - commonMessageParams
    // общие для всех сообщений параметры, используемые при создании нового сообщения

    confirmation - operatorConfirmation
    // подтверждение оператора

    total - totalNumberOfDocuments
    // общее количество найденных документов

    documentId - operatorDeliveredDocumentConfirmationId
    // id документа-подтверждения оператора о доставке

6.2
    
    validators_factory
    // фабрика, создающий валидатор для каждого вида документа

    apiService
    // сервис для работы с апи-слоем приложения

    userModel
    // модель данных пользователя

    documentsEventBus
    // шина, куда кладутся все сообщения, связанные с документами (создание, изменение, обновление)

6.3

    receiverName
    // имя получателя

    docNumber
    // номер документа

    createdUser
    // созданный пользователь

6.4
    
    timeout - textUpdateTimeout
    // таймаут обновления текста 

    url - mailboxUrl
    // url апи запроса получения сообщений

    data - signerData
    // данные подписанта

    text - documentStatusString
    // строка информации о текущем статусе документа

    ids - accountIds
    // список id пользователей данного аккаунта