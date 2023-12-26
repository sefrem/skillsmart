


Код после
        
    class CorrectionRequestXmlParser(ReceiptXmlParser):
    
        ...some code here...
    
        type = TypeSchema.correction_request
    
        @property
        def document_type(self) -> str:
            return "DP_UVUTOCH"
        
        def accept(self, visitor: Visitor, raw_document):
            return visitor.visitCorrectionRequestXmlParser(self, raw_document)


    class ReceiptXmlParser(BaseXmlParser):
    
        ...some code here...

        type = TypeSchema.receipt
    
        @property
        def document_type(self) -> str:
            return "DP_IZVPOL"
    
        def accept(self, visitor: Visitor, raw_document):
            return visitor.visitReceiptXmlParser(self, raw_document)


    class BaseXmlParser(ABC):
        
        ...some code here...

        @abstractmethod
        def accept(self, visitor: Visitor, raw_document: dict):
            pass

        ...more code...

        def prepare_data(self) -> Tuple[str, dict]:
            """
            Подготовить данные для записи в бд.
            """
            try:
                data_dict = self._get_dict_from_file()
                root_data_dict = data_dict[self.root]
                self._set_file_name(root_data_dict)
                self._set_fields_by_xpath(root_data_dict)
                self._set_type(root_data_dict)
                document_id, prepared_data = self.accept(ParsersPostProcessVisitor(), root_data_dict)
                self._set_document_roaming_direction(prepared_data)
    
                return document_id, prepared_data
    
            except (IndexError, TypeError, ExpatError):
                raise XmlValidationError


Код Visitor
    
    class Visitor(ABC):

        @abstractmethod
        def visitReceiptXmlParser(self, element: ReceiptXmlParser, raw_document: dict):
            pass
    
        @abstractmethod
        def visitCorrectionRequestXmlParser(self, element: CorrectionRequestXmlParser, raw_document: dict):
            pass


    class ParsersPostProcessVisitor(Visitor):
        def visitReceiptXmlParser(self, element: ReceiptXmlParser, raw_document: dict):
        raw_document["parent_document_id"] = element._get_by_xpath(
        element.parent_document_id_xpath
        )
        raw_document["sender_info"] = element._get_sender_info()
        raw_document["receiver_info"] = element._get_receiver_info()
    
            return element._get_file_id(raw_document), raw_document
    
        def visitCorrectionRequestXmlParser(self, element: CorrectionRequestXmlParser, raw_document: dict):
            try:
                raw_document["Документ"]["date"] = element._get_by_xpath(element.date_xpath)
                raw_document["Документ"]["time"] = element._get_by_xpath(element.time_xpath)
            except XmlValidationError:
                raw_document["Документ"]["datetime"] = element._get_by_xpath(
                    element.datetime_xpath
                )
    
            return element._get_file_id(raw_document), raw_document


Код до:

    class CorrectionRequestXmlParser(ReceiptXmlParser):
    
        ...some code here...
    
        type = TypeSchema.correction_request
    
        @property
        def document_type(self) -> str:
            return "DP_UVUTOCH"
        
        def _post_process(self, raw_document: dict):
            """
            Пост-обработка словаря, полученного из XML.
    
            :param raw_document:
            """
            raw_document["parent_document_id"] = self._get_by_xpath(
                self.parent_document_id_xpath
            )
            raw_document["sender_info"] = self._get_sender_info()
            raw_document["receiver_info"] = self._get_receiver_info()
    
            return self._get_file_id(raw_document), raw_document


    class ReceiptXmlParser(BaseXmlParser):
    
        ...some code here...

        type = TypeSchema.receipt
    
        @property
        def document_type(self) -> str:
            return "DP_IZVPOL"
    
        def _post_process(self, raw_document: dict):
            """
            Пост-обработка словаря, полученного из XML.
    
            :param raw_document:
            """
            try:
                raw_document["Документ"]["date"] = self._get_by_xpath(self.date_xpath)
                raw_document["Документ"]["time"] = self._get_by_xpath(self.time_xpath)
            except XmlValidationError:
                # TODO: положить значение в поле date и time. Мы больше не храним datetime.
                raw_document["Документ"]["datetime"] = self._get_by_xpath(
                    self.datetime_xpath
                )
    
            return self._get_file_id(raw_document), raw_document



        class BaseXmlParser(ABC):

            def prepare_data(self) -> Tuple[str, dict]:
            """
            Подготовить данные для записи в бд.
            """
            try:
                data_dict = self._get_dict_from_file()
                root_data_dict = data_dict[self.root]
                self._set_file_name(root_data_dict)
                self._set_fields_by_xpath(root_data_dict)
                self._set_type(root_data_dict)
                document_id, prepared_data = self._post_process(root_data_dict)
                self._set_document_roaming_direction(prepared_data)
    
                return document_id, prepared_data
    
            except (IndexError, TypeError, ExpatError):
                raise XmlValidationError