

//1
//before
getLogIdentifiers(): any {
    const diaboloCallId =
        this.crmDataBridge && this.crmDataBridge.diaboloCallId
            ? this.crmDataBridge.diaboloCallId
            : localStorage.getItem(DblLocalStorageKeys.CRM_CALL_DATA) != null
                ? JSON.parse(localStorage.getItem(DblLocalStorageKeys.CRM_CALL_DATA)).diaboloCallId
                : null;

    return {
        callId: diaboloCallId,
    };
}

//after
getLogIdentifiers1(): {callId: number | null} {
    return {
        callId: this.crmDataBridge?.diaboloCallId || this.getDiaboloCallId()
    }
}

getDiaboloCallId(): number | null {
    try {
        const crmCallData = localStorage.getItem(DblLocalStorageKeys.CRM_CALL_DATA);
        return crmCallData && JSON.parse(crmCallData)?.diaboloCallId
    } catch {
        return null
    }
}


//2
//before
document_id = xmltodict.parse(BytesIO(some_document_xml.encode("windows-1251")))["Файл"]["@ИдФайл"]

//after
document_in_bytes = BytesIO(some_document_xml.encode("windows-1251"))
try:
    parsed_doc = xmltodict.parse(document_in_bytes)
except ParseError:
    raise ParseError()
document_id = parsed_doc["Файл"]["@ИдФайл"]


//3
//before
event = json.dumps({"event_type": event_type, "body": json.loads(payload.json())})

//after
body_obj = json.loads(payload.json())
event_obj = {"event_type": event_type, "body": body_obj}
event_obj_str = json.dumps(event_obj)

//4
//before
list = list(set([os.path.dirname(x) for x in archive.namelist()]))

//after
dir_names = [os.path.dirname(x) for x in archive.namelist()]
unique_dir_names_list = list(set(dir_names))

//5
//before
const shouldUpdate = dataBridge?.interactionUuid &&
    [CallType.INBOUND, CallType.OUTBOUND_FREE].includes(dataBridge.callType) &&
    dataBridge.conferenceStatus === CrmConferenceStatus.CALL_STARTED &&
    conferenceState?.conferenceType === ConferenceType.SINGLE

//after
const isInteraction = dataBridge?.interactionUuid;
const isValidCallType = [CallType.INBOUND, CallType.OUTBOUND_FREE].includes(dataBridge.callType);
const hasCallStarted = dataBridge.conferenceStatus === CrmConferenceStatus.CALL_STARTED;
const isSingleConference = conferenceState?.conferenceType === ConferenceType.SINGLE
const shouldUpdate = isInteraction && isValidCallType && hasCallStarted && isSingleConference
