3.1

1. SendToRoamingBus - RoamingQueue  
    // класс взаимодействия с очередью роуминга
2. SendValidationDocumentToRoamingBus - ValidationMessageRoamingQueue  
    // класс, который занимается генерацией и отправкой сообщения о валидации в очередь роуминга
3. StorageCheck - StorageStatus  
    // класс, проверяющий состояние базы данных
4. CertificatesManager - CertificatesActions  
    // класс действий с сертификатами
5. SignCheck - SignValidation  
    // класс проверки подписи (валидации)

3.2

1. postSend - resetAll  
    // метод сброса всех данных после отправки сообщения
2. fetchDocs - getDocuments  
    // метод, делающий апи запрос на получение документов
3. fetchCounters - getDocumentsCounters  
    // метод получения счетчиков документов
4. ensure_users_exist - check_user_exists
    // метод, проверяющий существование пользователя (в остальном коде принято начинать именование таких методов с check_)
5. ensure_user_match_certificate - check_user_matches_certificate
    // метод, проверяющий, что выбранный для подписи сертификат соответствует текущему пользователю
6. ensure_document_doesnt_exists - check_document_exists
    // метод, проверяющий есть ли уже в базе переданный документ
7. try_create_signature - sign_document  
    // метод, подписывающий переданным сертификатом переданный документ

    