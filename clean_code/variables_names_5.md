

1. `let contactName = agent.contact ? agent.contact._text || "" : "";` ->  
    `const contactName = agent.contact ? agent.contact._text || "" : "";`  
    // инициализация переменной смещена к месту использования, способ инициализации
    изменен на константу.


2. let orderData - const orderData = {}  
    // сместил инициализацию переменной к месту ее объявления


3. let location = ... - const location - ...  
    let oldContact = ... - const oldContact...  
    // изменил способ объявления более 10 переменных на константы  


4. const xmlPath = "/static/xml/templates/" + templateName + "/default.xml";  
    // объявление и инициализация переменной перенесены ближе к месту использования


5. let url;   
   ...   
   url = data.pattern.replace("%PAGE%", i); ->   
   let url = data.pattern.replace("%PAGE%", i);  
    // объявление и инициализация переиспользуемой в цикле переменной перенесена вовнутрь цикла


6. var defaultNumber, matches;  
   ... код   
    defaultNumber = autonumbers[doctype];  
    matches = defaultNumber.match(/[0-9]+/g); ->  
    const matches = defaultNumber.match(/[0-9]+/g);  
    let defaultNumber = autonumbers[doctype];  
    // объявление и инициализация переменных делаются сразу и смещены ближе к месту использования


7. let points = [], showPopup = true; ->  
   const points = [];  
   let showPopup = true  
   // изменен способ инициализации, инициализация смещена ближе к месту использования переменных


8. let isEditable = doc.sender.user && currentUserId === doc.sender.user.ati_id;  
    isEditable = isEditable && doc.sender.status === DRAFT; ->  
    const isEditable = doc.sender.user && currentUserId === doc.sender.user.ati_id && doc.sender.status === DRAFT  
    // изменен способ объявления переменной на константу, убрано переопределение


9. let result;  
    ... код  
    result = await CredentialsApiService.getCredentials(
        certId,
        this.currentUser.id
      ); ->  
    
   const credentials = await CredentialsApiService.getCredentials(
        certId,
        this.currentUser.id
      )  
    // переименовал переменную, изменил переменную на константу, совместил объявление переменной и инициализацию


10. let errorText = "";  
    if (axios.isAxiosError(error)) {  
      errorText = error.response?.data.reason || text || SERVER_ERROR;  
      NotificationManager.error(errorText);    
    } ->   
    if (axios.isAxiosError(error)) {  
      const errorText = error.response?.data.reason || text || SERVER_ERROR || "";  
      NotificationManager.error(errorText);   
    }  
    // переменная изменена на константу, объявление смещено ближе к месту использования


11. let firm = null;  
    if (atiId) {  
      firm = await this.getFirm(atiId);  
    } ->   
    const firm = atiId ? await this.getFirm(atiId) : null  
    // переменная изменена на константу, объявление совмещено с инициализацией


12. let currency = currency ? currency._text.trim() : RUB_CURRENCY;  
    if (currency) setCurrency(currency); ->  
    setCurrency(currency ? currency._text.trim() : RUB_CURRENCY)  
    // убрал переменную


13. let formattedSections = [];  
    if (section instanceof Array) {  
      formattedSections = section;  
    } else {  
      formattedSections = [section];  
    } ->  
    const sections = section instanceof Array ? section : [section];  
    // переменная изменена на константу, изменено имя, объявление и инициализация совмещены


14. let formatedPara = [];  
      if (section.para instanceof Array) {  
        formatedPara = section.para;  
      } else {   
        formatedPara = [section.para];  
      }  
      let paraCounter = formatedPara.length; ->  
    
    const parametersQuantity = section.para instanceof Array? section.para.length : 1;   
    // переменная изменена на константу, убрана лишняя переменная, объявление совмещено с инициализацией


15. const contentNodes = findDOMNode(contentEl); ->  
    // перенес объявление и инициализацию переменной более чем на 30 строк кода, к месту первого использования

    

