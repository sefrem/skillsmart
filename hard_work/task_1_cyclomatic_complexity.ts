// Было. Сложность getOutboundCampaignCallInfo - 20

const outboundInfo = getOutboundCampaignCallInfo(snap);

function getOutboundCampaignCallInfo(snap: VoiceAgentStateSnapshot): CallTypeSpecificInfo<OutboundCampaignCallInfo> {
    const confTypes = [
        ConferenceStatusConferenceType.OUTBOUND,
        ConferenceStatusConferenceType.OUTBOUND_PREDICTIVE,
        ConferenceStatusConferenceType.OUTBOUND_PROGRESSIVE_AMD,
    ];

    if (!confTypes.includes(snap.conferenceStatus.conferenceType)) {
        return undefined;
    }

    if (snap.outboundCallInfo == null) {
        throw new Error('Invalid restored state, outboundCallInfo is null');
    }

    const outbound = snap.outboundCallInfo;
    const hasContact = outbound.contactInfo != null;
    const hasPreview = outbound.previewInfo != null;
    const previewStart = moment.unix(snap.timestamp);
    const previewLeft = hasPreview ? outbound.previewInfo.previewDurationSeconds - outbound.previewInfo.previewPassedTimeSeconds : 0;

    let phone: string;

    if (hasPreview && hasContact) {
        if (outbound.contactInfo.currentPhoneColumn) {
            phone = outbound.contactInfo.customData[outbound.contactInfo.currentPhoneColumn];
        } else if (Object.keys(outbound.contactInfo.customData).length > 0) {
            phone = outbound.contactInfo.customData[Object.keys(outbound.contactInfo.customData)[0]];
        } else {
            phone = '-';
        }
    } else {
        phone = getPhoneValue(snap.conferenceStatus.contact);
    }

    const callInfo: OutboundCampaignCallInfo = {
        contactId: hasContact ? outbound.contactInfo.id : null,
        contactCampaignId: hasContact ? outbound.contactInfo.campContactId : null,
        campaignId: outbound.campaignId,
        campaignName: outbound.campaignName,
        dialingMode: outbound.campaignMode,

        dataStatus: LoadingStatus.NONE,

        previewWrapupEnabled: hasPreview ? outbound.previewInfo.allowWrapupInPreview : false,
        previewLimitedDuration: hasPreview ? outbound.previewInfo.previewLimited : false,
        previewMaxDurationSeconds: hasPreview ? outbound.previewInfo.previewDurationSeconds : 0,
        previewDurationCountDownStartsAt: hasPreview ? previewStart.toDate() : null,
        previewDurationCountDownEndsAt: hasPreview ? previewStart.clone().add(previewLeft, 's').toDate() : null,
        previewPassedTimeSeconds: hasPreview ? outbound.previewInfo.previewPassedTimeSeconds : 0,

        lastCallRetryDate: hasContact ? DateTimeUtils.parseDateValueToMoment(outbound.contactInfo.retryDate)?.toDate() ?? null : null,
        lastCallDate: hasContact ? DateTimeUtils.parseDateValueToMoment(outbound.contactInfo.lastCallTime)?.toDate() ?? null : null,
        lastCallTries: hasContact ? outbound.contactInfo.triesNumber : null,
        lastCallWrapupId: hasContact ? outbound.contactInfo.lastWrapupId : null,

        phoneDisplayedToContact: hasContact ? outbound.contactInfo.phoneDisplayedToContact : null,
    };

    return {
        callInfo: callInfo,
        contactPhone: phone,
    };
}

// Цикломатическая сложность основного метода снижена в 5 раз.
// Использованные приемы:
//   - Избавление от if/else
//   - В JS нет полиморфизма, поэтому я создавал новые функции с разными именами, если исходная делала слишком много

// getOutboundInfo - 5
// getOutboundCampaignCallInfoWithPreview - 1
// getOutboundCampaignCallInfo - 1
// constructCallInfoWithoutContact - 1
// constructCallInfoWithContact - 1
// getContactPhone - 2
// checkIfCanRestore - 1

const outboundInfo = checkIfCanRestore(snap.conferenceStatus.conferenceType) ? getOutboundInfo({
    outboundCallInfo: snap.outboundCallInfo,
    timestamp: snap.timestamp,
    contact: snap.conferenceStatus.contact
}) : undefined;

function getOutboundInfo({
                             outboundCallInfo,
                             timestamp,
                             contact,
                         }: {
    outboundCallInfo: OutboundCallInfo;
    timestamp: number;
    contact: ContactParticipantState;
}): CallTypeSpecificInfo<OutboundCampaignCallInfo> {
    if (outboundCallInfo == null) {
        throw new Error('Invalid restored state, outboundCallInfo is null');
    }

    const {contactInfo, previewInfo, campaignId, campaignName, campaignMode} = outboundCallInfo;
    const hasContact = contactInfo != null;

    return {
        callInfo: {
            campaignId,
            campaignName,
            dialingMode: campaignMode,
            dataStatus: LoadingStatus.NONE,
            ...(previewInfo != null ? getOutboundCampaignCallInfoWithPreview(outboundCallInfo, timestamp) : getOutboundCampaignCallInfo()),
            ...(hasContact ? constructCallInfoWithContact(outboundCallInfo) : constructCallInfoWithoutContact()),
        },
        contactPhone: hasContact ? getContactPhone(outboundCallInfo.contactInfo) : getPhoneValue(contact),
    };
}

function checkIfCanRestore(conferenceType: ConferenceStatusConferenceType) {
    const confTypes = [
        ConferenceStatusConferenceType.OUTBOUND,
        ConferenceStatusConferenceType.OUTBOUND_PREDICTIVE,
        ConferenceStatusConferenceType.OUTBOUND_PROGRESSIVE_AMD,
    ];

    return confTypes.includes(conferenceType);
}

function getContactPhone(contactInfo: OutboundContactInfo) {
    let phone = contactInfo.customData?.[contactInfo.currentPhoneColumn] || '-';

    if (Object.keys(contactInfo.customData).length > 0) {
        phone = contactInfo.customData[Object.keys(contactInfo.customData)[0]];
    }

    return phone;
}

function constructCallInfoWithContact(outbound: OutboundCallInfo) {
    return {
        contactId: outbound.contactInfo.id,
        contactCampaignId: outbound.contactInfo.campContactId,
        lastCallRetryDate: DateTimeUtils.parseDateValueToMoment(outbound.contactInfo.retryDate)?.toDate() ?? null,
        lastCallDate: DateTimeUtils.parseDateValueToMoment(outbound.contactInfo.lastCallTime)?.toDate() ?? null,
        lastCallTries: outbound.contactInfo.triesNumber,
        lastCallWrapupId: outbound.contactInfo.lastWrapupId,
        phoneDisplayedToContact: outbound.contactInfo.phoneDisplayedToContact,
    };
}

function constructCallInfoWithoutContact() {
    return {
        contactId: null,
        contactCampaignId: null,
        lastCallRetryDate: null,
        lastCallDate: null,
        lastCallTries: null,
        lastCallWrapupId: null,
        phoneDisplayedToContact: null,
    };
}

function getOutboundCampaignCallInfoWithPreview(outbound: OutboundCallInfo, timestamp: number) {
    const previewStart = moment.unix(timestamp);
    const previewLeft = outbound.previewInfo.previewDurationSeconds - outbound.previewInfo.previewPassedTimeSeconds;

    return {
        previewWrapupEnabled: outbound.previewInfo.allowWrapupInPreview,
        previewLimitedDuration: outbound.previewInfo.previewLimited,
        previewMaxDurationSeconds: outbound.previewInfo.previewDurationSeconds,
        previewDurationCountDownStartsAt: previewStart.toDate(),
        previewDurationCountDownEndsAt: previewStart.clone().add(previewLeft, 's').toDate(),
        previewPassedTimeSeconds: outbound.previewInfo.previewPassedTimeSeconds,
    };
}

function getOutboundCampaignCallInfo() {
    return {
        previewWrapupEnabled: false,
        previewLimitedDuration: false,
        previewMaxDurationSeconds: 0,
        previewDurationCountDownStartsAt: null,
        previewDurationCountDownEndsAt: null,
        previewPassedTimeSeconds: 0,
    };
}
