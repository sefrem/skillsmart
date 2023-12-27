
Отчет
    Нашел в рабочем проекте код, в котором в классах, отвечающих за парсинг xml разного типа, при
наследовании переопределяются методы пост-процессинга, т.е. просто каких-либо действий, которые нужно сделать после
парсинга.
    Стандартно использовал паттерн Visitor - создал абстрактный класс с методами, умеющими работать с разными классами
парсеров. В родительском методе парсеров добавил абстрактный метод accept, работающий с общим интерфейсом visitor, а
в каждом классе парсеров - вызов соответствующего метода Visitor. В базовый класс парсеров добавил абстрактный метод accept.
Далее вызываю его self.accept(self.parsersPostProcessVisitor, root_data_dict), просто передавай класс-имплементацию Visitor,
какие методы вызывать каждый конкретный класс знает самостоятельно.
    Какие плюсы я вижу у получившегося кода - в одном месте собраны все меоды пост-процессинга у различных парсеров, возможно
какие-то из них повторяются, и мы сможем уменьшить количество кода. Кроме того, в каждом классе у нас теперь есть метод,
через который можно добавлять любое поведение в класс, которому внутри класса не совсем место. Возмозжно, оно будет нарушать
Single Responsibility Principle. А так - мы всегда можем создавть новый класс, унаследованный от Visitor, и добавть туда любое
новое поведение.
    Какие минусы - нарушается инкапсуляция. Во-первых, сам класс парсеров знает про методы внутри класса Visitor. А во-вторых,
методы конкретного класса Visitor вызывают внутренние методы класса парсеров, которые зачастую являются protected. А создание
соответствующих приватным публичных методов может существенно увеличить количество кода классов парсеров.
    Общий вывод.
    Возможно, данный случай не очень показательный, и исходный код можно было оставить как есть, в конце концов какая-то
пост-обработка после парсинга - вполне ожидаемое поведение, которое вполне вписывается в текущую логику класса. Но в остальном, елси например
мы хотим сразу при проектировании сделать класс, закрытый для изменений, но открытый для модификаций (Open/Closed principle),
можно заложить в него возможность добавления Посетителя и быть уверенным, что класс со временем не обрастет не подходящими
его цели методами или методами, нужными для какого-то конкретного случая. Эти кейсы хорошо покрываются Посетителем.

Код после

    class CorrectionRequestXmlParser(ReceiptXmlParser):

#         ...some code here...

        type = TypeSchema.correction_request

        @property
        def document_type(self) -> str:
            return "DP_UVUTOCH"

        def accept(self, visitor: Visitor, raw_document):
            return visitor.visitCorrectionRequestXmlParser(self, raw_document)


    class ReceiptXmlParser(BaseXmlParser):

#         ...some code here...

        type = TypeSchema.receipt

        @property
        def document_type(self) -> str:
            return "DP_IZVPOL"

        def accept(self, visitor: Visitor, raw_document):
            return visitor.visitReceiptXmlParser(self, raw_document)


    class BaseXmlParser(ABC):

#         ...some code here...

        self.parsersPostProcessVisitor = ParsersPostProcessVisitor()

        @abstractmethod
        def accept(self, visitor: Visitor, raw_document: dict):
            pass

#         ...more code...

        def prepare_data(self) -> Tuple[str, dict]:
            try:
                data_dict = self._get_dict_from_file()
                root_data_dict = data_dict[self.root]
                self._set_file_name(root_data_dict)
                self._set_fields_by_xpath(root_data_dict)
                self._set_type(root_data_dict)
                document_id, prepared_data = self.accept(self.parsersPostProcessVisitor, root_data_dict)
                self._set_document_roaming_direction(prepared_data)

                return document_id, prepared_data

            except (IndexError, TypeError, ExpatError):
                raise XmlValidationError


# Код Visitor

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


# Код до:

    class CorrectionRequestXmlParser(ReceiptXmlParser):

#         ...some code here...

        type = TypeSchema.correction_request

        @property
        def document_type(self) -> str:
            return "DP_UVUTOCH"

        def _post_process(self, raw_document: dict):
            raw_document["parent_document_id"] = self._get_by_xpath(
                self.parent_document_id_xpath
            )
            raw_document["sender_info"] = self._get_sender_info()
            raw_document["receiver_info"] = self._get_receiver_info()

            return self._get_file_id(raw_document), raw_document


    class ReceiptXmlParser(BaseXmlParser):

#         ...some code here...

        type = TypeSchema.receipt

        @property
        def document_type(self) -> str:
            return "DP_IZVPOL"

        def _post_process(self, raw_document: dict):
            try:
                raw_document["Документ"]["date"] = self._get_by_xpath(self.date_xpath)
                raw_document["Документ"]["time"] = self._get_by_xpath(self.time_xpath)
            except XmlValidationError:
                raw_document["Документ"]["datetime"] = self._get_by_xpath(
                    self.datetime_xpath
                )

            return self._get_file_id(raw_document), raw_document



    class BaseXmlParser(ABC):

        def prepare_data(self) -> Tuple[str, dict]:
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