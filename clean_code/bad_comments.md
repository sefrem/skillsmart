
Я комментариев не пишу, поэтому поредактировал чужие комментарии.

1. Слишком много информации.    
     // Many browsers will do all sorts of weird things if they encounter an empty `href`
            // tag (which is invalid HTML). Some will attempt to load the current page. Some will
            // attempt to load the page"s parent directory. These problems can cause
            // `react-to-print` to stop  without any error being thrown. To avoid such problems we
            // simply do not attempt to load these links.  ->  
        // Не загружаем пустые href, чтобы избежать непредсказуемого поведения браузеров


2. Избыточные комментарии.  
   // node.attributes has NamedNodeMap type that not Array and can be iterated only via direct [i] access ->  
    Комментарий удален


3. Закомментированный код.  
    // console.log(withQuery(
    //     url,
    //     data
    // )); ->  
    Комментарий удален


4. Избыточные комментарии.  
    // инн сертификата совпадает с инн пользователя и дефолтная проверка ->  
    Комментарий удален


5. Шум.  
    // Format name ->   
    Комментарий удален

   
6. Шум.  
    // Format passport ->   
    Комментарий удален


7. Шум.  
    // Document validation
  if (!this.validateDocument()) {
    return;
  } ->  
    Комментарий удален


8. Недостоверные комментарии.  
    // in case we fail by sign we need to show this text
        let callerSuccessMsg = DOCUMENT_SUCCESS_APPROVED_TEXT; ->   
    Комментарий удален


9. Недостоверные комментарии.  
    // in case we fail by sign we need to show this text
           let callerSuccessMsg = DOCUMENT_SENT_TEXT; ->  
    Комментарий удален


10. Шум.  
    // Internal functions ->  
    Комментарий удален


11. Закомментированный код.  
    // TODO: Uncomment EDO buttons!  
    Здесь 11 строк кода  
    // TODO: Uncomment EDO buttons! ->  
    Комментарий удален


12. Избыточные комментарии.  
    //Для уведомления об отказе от исполнения необходимо узнать владеет ли данный пользователь документом ->  
    Комментарий удален.


13. Избыточные комментарии.  
    // import default document
    import defaultDocument from "./data/default.json"; ->  
    Комментарий удален 


14. Недостоверные комментарии. Шум.  
    // TODO: Move "NotificationsManager" to helpers (utils) !!!  
    // TODO: Move "NotificationsManager" to common components !!!  ->  
    Комментарии удалены


15. Неочевидный комментарий.  
    // Create document by template? ->  
    Комментарий удален
