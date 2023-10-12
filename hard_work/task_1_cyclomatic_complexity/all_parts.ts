// Метод 1
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

// Цикломатическая сложность основного метода снижена в 5 раз до 4
// Использованные приемы:
//   - Избавление от if/else
//   - В JS нет полиморфизма, поэтому я создавал новые функции с разными именами, если исходная делала слишком много


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




// Метод 2


// Было. Сложность handleChannelStatusForNewProtocol - 28
class VoiceInteractionOld {
    private handleChannelStatusForNewProtocol(
        msg: WsVoiceChannelStatusMsgPayload,
        interaction: VoiceInteraction,
        currentUserId: number
    ): Observable<Action> {
        const directionCallType = this.voiceInteractionService.getCallTypeByDirection(msg.direction);
        const interactionCallType = VoiceInteractionService.getCallType(interaction);
        const actions: Action[] = [];

        if (interaction != null && msg.context.contactSessionId !== interaction.newProtocolCallInfo.contactSessionId) {
            actions.push(VoiceInteractionsActions.removeInteraction({ uuid: interaction.uuid }));
            interaction = null;
        }

        if (interaction == null) {
            if (STARTING_STATUSES.indexOf(this.voiceInteractionService.getInternalCallStatus(msg.status, null)) === -1) {
                return EMPTY;
            }

            interaction = getDefaultNewProtocolInteraction();

            interaction.callType =
                msg.context['activityContactType'] != null
                    ? VoiceInteractionService.getCallTypeByActivityType(msg.context['activityContactType'])
                    : directionCallType;

            actions.push(
                VoiceInteractionsActions.newInteraction({ interaction, conferenceStatus: msg }),
                LoggerActions.logMetric({ metric: FrontMetric.callAssigned() })
            );
            this.logger.logInfo(LogTag.VOICE_INTERACTION, 'New interaction:', { conferenceId: LODASH.get(msg, 'context.conferenceId') });
        } else {
            interaction = LODASH.cloneDeep(interaction);
            interaction.callType = interactionCallType || directionCallType;
        }

        Object.assign<VoiceInteraction, Partial<VoiceInteraction>>(interaction, {
            newProtocolCallInfo: {
                ...interaction.newProtocolCallInfo,
                conferenceId: LODASH.get(msg, 'context.conferenceId'),
                contactSessionId: LODASH.get(msg, 'context.contactSessionId'),
            },
        });

        if (msg.context['paymentInfo']) {
            this.logger.logInfo(LogTag.VOICE_INTERACTION, 'Payment package present', msg.context['paymentInfo']);

            Object.assign<VoiceInteraction, Partial<VoiceInteraction>>(interaction, {
                paymentInfo: {
                    paymentAvailable: LODASH.get(msg, 'context.paymentInfo.paymentAvailable'),
                    paymentMultiple: LODASH.get(msg, 'context.paymentInfo.paymentMultiple'),
                },
            });

            if (interaction.paymentInfo.paymentAvailable) {
                actions.push(PaymentActions.loadPaymentStatus({ conferenceId: interaction.newProtocolCallInfo.conferenceId }));
            }
        }

        if (msg.context['helperQueue'] != null) {
            this.updateHelperQueue(msg, interaction);
        }

        if (msg.context['client']) {
            this.logger.logInfo(LogTag.VOICE_INTERACTION, 'Client package present', msg.context['client']);
            this.patchContact('context.client', msg, interaction);
        }

        if (LODASH.get(msg, 'context.type', null) === 'External') {
            this.updateExternalHelper(msg, interaction);
        } else {
            this.patchContact('context.contact', msg, interaction);
        }

        const agentId = LODASH.get(msg, 'context.agent.id', null);
        if (agentId != null) {
            if (agentId !== currentUserId) {
                this.updateHelper(msg, interaction);
            } else {
                this.updateSelf(msg, interaction);
                this.updateSelfStatus(msg, interaction);
            }
        }

        if (
            msg.context['client'] == null &&
            msg.context['agent'] == null &&
            msg.context['contact'] == null &&
            LODASH.get(msg, 'context.queue.state', null) == null
        ) {
            this.updateSelfStatus(msg, interaction);
        }

        if (msg.context['activityContactType'] != null) {
            const activityContactType = msg.context['activityContactType'] as ActivityContactType;
            const activityCallType = VoiceInteractionService.getCallTypeByActivityType(activityContactType);

            Object.assign<NewProtocolCallInfo, Partial<NewProtocolCallInfo>>(interaction.newProtocolCallInfo, {
                ...interaction.newProtocolCallInfo,
                transferContext: {
                    ...(interaction.newProtocolCallInfo.transferContext ?? ({} as TransferContext)),
                    activityContactType,
                    callTypeChangedByTransfer: activityCallType !== directionCallType,
                },
            });

            if (msg.context['queue'] != null) {
                Object.assign<NewProtocolCallInfo, Partial<NewProtocolCallInfo>>(interaction.newProtocolCallInfo, {
                    ...interaction.newProtocolCallInfo,
                    transferContext: {
                        ...(interaction.newProtocolCallInfo.transferContext ?? ({} as TransferContext)),
                        queue: LODASH.get(msg, 'context.queue', null),
                    },
                });

                Object.assign<InboundCallInfo, Partial<InboundCallInfo>>(interaction.inboundCallInfo, {
                    ...interaction.inboundCallInfo,
                    variables: LODASH.get(msg, 'context.variables', {}),
                });
            }

            if (
                msg.context['campaign'] != null &&
                [ConferenceProgressStatusWs.CALL_OFFERED, ConferenceProgressStatusWs.TRANSFER_OFFERED].includes(msg.status) &&
                activityCallType === CallType.OUTBOUND_CAMPAIGN
            ) {
                const campaign: { contactId: number; campaignId: number; campContactId: number } = msg.context['campaign'];

                Object.assign<OutboundCampaignCallInfo, Partial<OutboundCampaignCallInfo>>(interaction.outboundCampaignCallInfo, {
                    ...interaction.outboundCampaignCallInfo,
                    campaignId: campaign.campaignId,
                    contactCampaignId: campaign.campContactId,
                    contactId: campaign.contactId,
                });

                actions.push(
                    CampaignsActions.loadCampaignOnIncomingTransfer({
                        uuid: interaction.uuid,
                        campaignId: campaign.campaignId,
                    })
                );
            }
        }

        if (msg.status === ConferenceProgressStatusWs.TRANSFER_OFFERED) {
            const transferPayload = (msg as unknown as TransferOfferedWs).context;
            Object.assign<NewProtocolCallInfo, Partial<NewProtocolCallInfo>>(interaction.newProtocolCallInfo, {
                ...interaction.newProtocolCallInfo,
                conferenceType: ConferenceType.HELPER,
                transferContext: {
                    ...interaction.newProtocolCallInfo.transferContext,
                    warmTransfer: true,
                },
                recording: transferPayload.recordState?.recording ?? false,
            });

            this.updateNativeStatus(interaction, ConferenceProgressStatusWs.TRANSFER_OFFERED);
            actions.push(
                VoiceInteractionsActions.transferOfferedEvent({
                    payload: msg as unknown as TransferOfferedWs,
                })
            );
        } else if (
            msg.status === ConferenceProgressStatusWs.NEW_MASTER &&
            interaction.newProtocolCallInfo.conferenceType === ConferenceType.HELPER
        ) {
            const masterAgentId = LODASH.get(msg, 'context.agent.id', null);

            if (masterAgentId === currentUserId) {
                interaction.newProtocolCallInfo.conferenceType = ConferenceType.SINGLE;

                if (interaction.paymentInfo.paymentAvailable) {
                    actions.push(PaymentActions.loadPaymentStatus({ conferenceId: interaction.newProtocolCallInfo.conferenceId }));
                }
            } else {
                interaction.newProtocolCallInfo.conferenceType = ConferenceType.HELPER;
            }
        }

        if (msg.status === ConferenceProgressStatusWs.DIALING && msg.context.agent?.id === currentUserId) {
            const { id, login, profile, groups } = msg.context.agent;
            this.updateCallScriptOnDialing(interaction, msg.context.callScript);
            actions.push(
                CrmDataBridgeActions.updateCrmDataBridgeAgentOnDialing({
                    agent: { id, login, profile, groups },
                    interaction,
                })
            );
        }

        if (msg.status === ConferenceProgressStatusWs.FINISHED && msg.context.agent) {
            if (msg.context.reason === CallEndReason.TRANSFER_CONFIRM) {
                if (msg.context.agent.id !== currentUserId && interaction.callType === CallType.OUTBOUND_CAMPAIGN) {
                    actions.push(VoiceInteractionsActions.loadOutboundCampaignCallInfo({ uuid: interaction.uuid }));
                }

                actions.push(VoiceInteractionsActions.callFinishedByTransferConfirm());
            }

            if (msg.context.agent?.id === currentUserId && interaction.newProtocolCallInfo.conferenceType !== ConferenceType.HELPER) {
                actions.push(CrmDataBridgeActions.updateCrmDataBridgeCallEndReason({ callEndReason: msg.context.reason }));
            }
        }

        if (
            msg.status === ConferenceProgressStatusWs.FINISHED &&
            VoiceInteractionNewProtocolHandlingEffects.CONTACT_FINISHED_CALLS_FAILURES.includes(msg.context.reason)
        ) {
            this.isOriginationNotificationsV2Enabled$.pipe(take(1)).subscribe((enabled) => {
                if (enabled) {
                    return;
                }
                this.uiNotifications.addError(
                    this.translate.instant(CALLS_FINISHED_TRANSLATIONS[msg.context.reason].description),
                    this.translate.instant(CALLS_FINISHED_TRANSLATIONS[msg.context.reason].title),
                    ERROR_DISPLAY_TIMEOUT
                );
            });
        }

        if (
            msg.status === ConferenceProgressStatusWs.FINISHED &&
            msg.context.reason === CallEndReason.CALL_FINISHED &&
            msg.context.agent &&
            msg.context.agent.id !== currentUserId &&
            msg.context.agent.state.isMaster
        ) {
            this.uiNotifications.addWarning('agentInterface.transfers.warmTransfer.agentDisconnected', undefined, undefined, {
                agentLogin: msg.context.agent.login,
            });
        }

        if (interaction.callStatus === null) {
            actions.push(VoiceInteractionsActions.removeInteraction({ uuid: interaction.uuid }));
        } else {
            /**
             * We do unshift vs push, to keep the queue of previous actions in order
             * Otherwise, we will lose all the updates that the code above made
             */
            actions.unshift(VoiceInteractionsActions.updateInteraction({ uuid: interaction.uuid, interaction, conferenceStatus: msg }));
        }

        return of(...actions);
    }
}


// Стало. Цикломатическая сложность основного метода снижена в 9 раз до 3
// Использованные методы:
//      - Избавление от if/else, цепочек вложенных if
//      - Методы явно возвращают значения (убран тип void)
//      - Убрано мутирование данных, добавлена иммутабельность

// Выводы.
// Это метод - один из самых проблемных во всем нашем фронтенде и точно с наибольшей цикломатической сложностью.
// Огромное количество времени мы пытались найти и чинить в нем баги.
// Логика спонтанно писалась много лет разными разработчиками, никакой документации нет, как он должен работать никто не знает.
// Все это осложняется тем, что баги случайно возникают в зависимости от последовательности сообщений в веб-сокетах, и это практически
// не воспроизвести локально, приходится дебажить вслепую, смотря на логи клиента.
// Конкретно этот метод занимается обработкой и обновлением интеракции (состояния текущей сессии клиента) в зависимости от полученных
// сообщений по веб-сокетам, и пушит нужные события в очередь исполнения.
// В данном случае я предпринял попытку представить как можно было бы его отрефакторить. В первую очередь я убрал вложенный условные цепочки,
// также сделал используемый объект interaction иммутабельным, потому что у нас бывали баги из-за того, что он меняется после того, как был положен в очередь
// для обработки.
// Получилось единообразнее и полегче для понимания в общем что здесь происходит, но все равно недостаточно,
// тут хочется какую-то стейт-машину, которая в зависимости от полученного сообщения будет
// переводит одно состояние в следующее и на это запускаться какие-то сайд-эффекты (пополняться очередь, например).



class VoiceInteractionHandler {

    private handleChannelStatusForNewProtocol(
        msg: WsVoiceChannelStatusMsgPayload,
        interaction: VoiceInteraction,
        currentUserId: number
    ): Observable<Action> {
        const directionCallType = this.voiceInteractionService.getCallTypeByDirection(msg.direction);
        const interactionCallType = VoiceInteractionService.getCallType(interaction);
        let actions: Action[] = [];

        this.handleContactFininishedCallFailure(msg);
        this.handleTransferDisconnectedDuringTransfer(msg, currentUserId);

        [interaction, actions] = this.checkIfInteractionFromPrevEvent(interaction, msg.context.contactSessionId, actions);

        if (interaction == null && STARTING_STATUSES.indexOf(this.voiceInteractionService.getInternalCallStatus(msg.status, null)) === -1) {
            return EMPTY;
        }

        [interaction, actions] =
            interaction == null
                ? this.updateEmptyInteraction({ interaction, msg, prevActions: actions, directionCallType })
                : this.updateInteraction(interaction, interactionCallType, directionCallType);
        interaction = this.updateInteractionWithConferenceId(interaction, msg);
        [interaction, actions] = this.handlePaymentMessage(msg, interaction, actions);
        interaction = this.updateHelperQueue(msg, interaction);
        interaction = this.patchContact('context.client', msg, interaction);
        interaction = this.updateExternalHelper(msg, interaction);
        interaction = this.updateNewProtocolCallInfo(msg, interaction, currentUserId);
        interaction = this.checkIfPureConferenceState(msg, interaction);
        interaction = this.updateInteractionIfActivityContactTypeExists(msg, interaction, directionCallType);
        interaction = this.updateInteractionIfQueueExists(msg, interaction);
        [interaction, actions] = this.updateInteractionIfCampaignExists(msg, interaction, actions);
        [interaction, actions] = this.handleReceiveWarmTransfer(msg, interaction, actions);
        [interaction, actions] = this.handleNewConference({ msg, interaction, prevActions: actions, currentUserId });
        [interaction, actions] = this.handleConferenceDialing({ msg, interaction, prevActions: actions, currentUserId });
        [interaction, actions] = this.handleConferenceFinished({ msg, interaction, prevActions: actions, currentUserId });
        actions = this.updActionsIfCallStatusExists(msg, interaction, actions);
        actions = this.updActionsIfEmptyCallStatus(interaction, actions);

        return of(...actions);
    }

    private checkIfInteractionFromPrevEvent(
        interaction: VoiceInteraction,
        contactSessionId: string,
        prevActions: Action[]
    ): [VoiceInteraction, Action[]] {
        const actions = [...prevActions];
        interaction = LODASH.cloneDeep(interaction);

        if (interaction != null && contactSessionId !== interaction.newProtocolCallInfo.contactSessionId) {
            actions.push(VoiceInteractionsActions.removeInteraction({ uuid: interaction.uuid }));
            interaction = null;
        }
        return [interaction, actions];
    }

    private updateEmptyInteraction({
                                       interaction,
                                       msg,
                                       prevActions,
                                       directionCallType,
                                   }: {
        interaction: VoiceInteraction;
        msg: WsVoiceChannelStatusMsgPayload;
        prevActions: Action[];
        directionCallType: CallType;
    }): [VoiceInteraction, Action[]] {
        const actions = [...prevActions];
        interaction = getDefaultNewProtocolInteraction();
        interaction.callType = VoiceInteractionService.getCallTypeByActivityType(msg.context['activityContactType']) ?? directionCallType;

        actions.push(
            VoiceInteractionsActions.newInteraction({ interaction, conferenceStatus: msg }),
            LoggerActions.logMetric({ metric: FrontMetric.callAssigned() })
        );
        this.logger.logInfo(LogTag.VOICE_INTERACTION, 'New interaction:', { conferenceId: LODASH.get(msg, 'context.conferenceId') });
        return [interaction, actions];
    }

    private updateInteraction(interaction: VoiceInteraction, interactionCallType, directionCallType): [VoiceInteraction, Action[]] {
        interaction = LODASH.cloneDeep(interaction);
        interaction.callType = interactionCallType || directionCallType;

        return [interaction, []];
    }

    private updateInteractionWithConferenceId(interaction: VoiceInteraction, msg: WsVoiceChannelStatusMsgPayload): VoiceInteraction {
        return {
            ...interaction,
            newProtocolCallInfo: {
                ...interaction.newProtocolCallInfo,
                conferenceId: LODASH.get(msg, 'context.conferenceId'),
                contactSessionId: LODASH.get(msg, 'context.contactSessionId'),
            },
        };
    }

    private handlePaymentMessage(
        msg: WsVoiceChannelStatusMsgPayload,
        interaction: VoiceInteraction,
        prevActions: Action[]
    ): [VoiceInteraction, Action[]] {
        const paymentAvailable = LODASH.get(msg, 'context.paymentInfo.paymentAvailable');
        const actions = [...prevActions];
        interaction = LODASH.cloneDeep(interaction);

        if (msg.context['paymentInfo']) {
            this.logger.logInfo(LogTag.VOICE_INTERACTION, 'Payment package present', msg.context['paymentInfo']);

            interaction.paymentInfo = {
                paymentAvailable,
                paymentMultiple: LODASH.get(msg, 'context.paymentInfo.paymentMultiple'),
            };
        }

        if (msg.context['paymentInfo'] && paymentAvailable) {
            actions.push(PaymentActions.loadPaymentStatus({ conferenceId: interaction.newProtocolCallInfo.conferenceId }));
        }
        return [interaction, actions];
    }

    private updateNewProtocolCallInfo(msg: WsVoiceChannelStatusMsgPayload, interaction: VoiceInteraction, currentUserId: number): VoiceInteraction {
        const agentId = LODASH.get(msg, 'context.agent.id', null);
        return agentId === currentUserId ? this.updateSelf(msg, interaction) : this.updateHelper(msg, interaction);
    }

    private updateInteractionIfActivityContactTypeExists(
        msg: WsVoiceChannelStatusMsgPayload,
        interaction: VoiceInteraction,
        directionCallType: CallType
    ): VoiceInteraction {
        interaction = LODASH.cloneDeep(interaction);
        if (msg.context['activityContactType'] != null) {
            const activityContactType = msg.context['activityContactType'] as ActivityContactType;
            const activityCallType = VoiceInteractionService.getCallTypeByActivityType(activityContactType);

            interaction.newProtocolCallInfo = {
                ...interaction.newProtocolCallInfo,
                transferContext: {
                    ...(interaction.newProtocolCallInfo.transferContext ?? ({} as TransferContext)),
                    activityContactType,
                    callTypeChangedByTransfer: activityCallType !== directionCallType,
                },
            };
        }

        return interaction;
    }

    private updateInteractionIfQueueExists(msg: WsVoiceChannelStatusMsgPayload, interaction: VoiceInteraction): VoiceInteraction {
        interaction = LODASH.cloneDeep(interaction);

        if (msg.context['activityContactType'] != null && msg.context['queue'] != null) {
            interaction.newProtocolCallInfo = {
                ...interaction.newProtocolCallInfo,
                transferContext: {
                    ...(interaction.newProtocolCallInfo.transferContext ?? ({} as TransferContext)),
                    queue: LODASH.get(msg, 'context.queue', null),
                },
            };

            interaction.inboundCallInfo = {
                ...interaction.inboundCallInfo,
                variables: LODASH.get(msg, 'context.variables', {}),
            };
        }

        return interaction;
    }

    private updateInteractionIfCampaignExists(
        msg: WsVoiceChannelStatusMsgPayload,
        interaction: VoiceInteraction,
        prevActions: Action[]
    ): [VoiceInteraction, Action[]] {
        const activityCallType = VoiceInteractionService.getCallTypeByActivityType(msg.context['activityContactType']);
        const actions = [...prevActions];
        interaction = LODASH.cloneDeep(interaction);

        if (
            msg.context['activityContactType'] != null &&
            msg.context['campaign'] != null &&
            [ConferenceProgressStatusWs.CALL_OFFERED, ConferenceProgressStatusWs.TRANSFER_OFFERED].includes(msg.status) &&
            activityCallType === CallType.OUTBOUND_CAMPAIGN
        ) {
            const campaign: { contactId: number; campaignId: number; campContactId: number } = msg.context['campaign'];

            interaction.outboundCampaignCallInfo = {
                ...interaction.outboundCampaignCallInfo,
                campaignId: campaign.campaignId,
                contactCampaignId: campaign.campContactId,
                contactId: campaign.contactId,
            };

            actions.push(
                CampaignsActions.loadCampaignOnIncomingTransfer({
                    uuid: interaction.uuid,
                    campaignId: campaign.campaignId,
                })
            );
        }

        return [interaction, actions];
    }

    private checkIfPureConferenceState(msg: WsVoiceChannelStatusMsgPayload, interaction: VoiceInteraction): VoiceInteraction {
        if (
            msg.context['client'] == null &&
            msg.context['agent'] == null &&
            msg.context['contact'] == null &&
            LODASH.get(msg, 'context.queue.state', null) == null
        ) {
            return this.checkSelfErrors(msg, interaction);
        }
    }

    private handleReceiveWarmTransfer(
        msg: WsVoiceChannelStatusMsgPayload,
        interaction: VoiceInteraction,
        prevActions: Action[]
    ): [VoiceInteraction, Action[]] {
        const actions = [...prevActions];
        interaction = LODASH.cloneDeep(interaction);

        if (msg.status !== ConferenceProgressStatusWs.TRANSFER_OFFERED) {
            return [interaction, actions];
        }
        const transferPayload = (msg as unknown as TransferOfferedWs).context;
        // Transfer offered has information about conference master and client

        interaction.newProtocolCallInfo = {
            ...interaction.newProtocolCallInfo,
            conferenceType: ConferenceType.HELPER,
            transferContext: {
                ...interaction.newProtocolCallInfo.transferContext,
                warmTransfer: true,
            },
            recording: transferPayload.recordState?.recording ?? false,
        };

        interaction = this.updateNativeStatus(interaction, ConferenceProgressStatusWs.TRANSFER_OFFERED);
        actions.push(
            VoiceInteractionsActions.transferOfferedEvent({
                payload: msg as unknown as TransferOfferedWs,
            })
        );

        return [interaction, actions];
    }

    private handleNewConference({
                                    msg,
                                    interaction,
                                    prevActions,
                                    currentUserId,
                                }: {
        msg: WsVoiceChannelStatusMsgPayload;
        interaction: VoiceInteraction;
        prevActions: Action[];
        currentUserId: number;
    }): [VoiceInteraction, Action[]] {
        const actions = [...prevActions];
        interaction = LODASH.cloneDeep(interaction);

        if (msg.status !== ConferenceProgressStatusWs.NEW_MASTER || interaction.newProtocolCallInfo.conferenceType !== ConferenceType.HELPER) {
            return [interaction, actions];
        }
        const masterAgentId = LODASH.get(msg, 'context.agent.id', null);
        interaction.newProtocolCallInfo.conferenceType = masterAgentId === currentUserId ? ConferenceType.SINGLE : ConferenceType.HELPER;

        // if we got transfered a call with payment, get the last state updated initial agent
        if (masterAgentId === currentUserId && interaction.paymentInfo.paymentAvailable) {
            actions.push(PaymentActions.loadPaymentStatus({ conferenceId: interaction.newProtocolCallInfo.conferenceId }));
        }

        return [interaction, actions];
    }

    private handleConferenceDialing({
                                        msg,
                                        interaction,
                                        prevActions,
                                        currentUserId,
                                    }: {
        msg: WsVoiceChannelStatusMsgPayload;
        interaction: VoiceInteraction;
        prevActions: Action[];
        currentUserId: number;
    }): [VoiceInteraction, Action[]] {
        const actions = [...prevActions];
        interaction = LODASH.cloneDeep(interaction);

        if (msg.status !== ConferenceProgressStatusWs.DIALING || msg.context.agent?.id !== currentUserId) {
            return [interaction, actions];
        }

        const { id, login, profile, groups } = msg.context.agent;
        interaction = this.updateCallScriptOnDialing(interaction, msg.context.callScript);
        actions.push(
            CrmDataBridgeActions.updateCrmDataBridgeAgentOnDialing({
                agent: { id, login, profile, groups },
                interaction,
            })
        );
        return [interaction, actions];
    }

    private handleConferenceFinished({
                                         msg,
                                         interaction,
                                         prevActions,
                                         currentUserId,
                                     }: {
        msg: WsVoiceChannelStatusMsgPayload;
        interaction: VoiceInteraction;
        prevActions: Action[];
        currentUserId: number;
    }): [VoiceInteraction, Action[]] {
        const actions = [...prevActions];
        interaction = LODASH.cloneDeep(interaction);

        if (msg.status !== ConferenceProgressStatusWs.FINISHED || !msg.context.agent) {
            return [interaction, actions];
        }
        if (msg.context.reason === CallEndReason.TRANSFER_CONFIRM) {
            actions.push(VoiceInteractionsActions.callFinishedByTransferConfirm());
        }
        if (
            msg.context.reason === CallEndReason.TRANSFER_CONFIRM &&
            msg.context.agent.id !== currentUserId &&
            interaction.callType === CallType.OUTBOUND_CAMPAIGN
        ) {
            actions.push(VoiceInteractionsActions.loadOutboundCampaignCallInfo({ uuid: interaction.uuid }));
        }

        if (msg.context.agent?.id === currentUserId && interaction.newProtocolCallInfo.conferenceType !== ConferenceType.HELPER) {
            actions.push(CrmDataBridgeActions.updateCrmDataBridgeCallEndReason({ callEndReason: msg.context.reason }));
        }

        return [interaction, actions];
    }

    private handleContactFininishedCallFailure(msg: WsVoiceChannelStatusMsgPayload): void {
        if (
            msg.status !== ConferenceProgressStatusWs.FINISHED ||
            !VoiceInteractionNewProtocolHandlingEffects.CONTACT_FINISHED_CALLS_FAILURES.includes(msg.context.reason)
        ) {
            return;
        }
        this.isOriginationNotificationsV2Enabled$.pipe(take(1)).subscribe((enabled) => {
            if (enabled) {
                return;
            }
            this.uiNotifications.addError(
                this.translate.instant(CALLS_FINISHED_TRANSLATIONS[msg.context.reason].description),
                this.translate.instant(CALLS_FINISHED_TRANSLATIONS[msg.context.reason].title),
                ERROR_DISPLAY_TIMEOUT
            );
        });
    }

    private handleTransferDisconnectedDuringTransfer(msg: WsVoiceChannelStatusMsgPayload, currentUserId): void {
        if (
            msg.status === ConferenceProgressStatusWs.FINISHED &&
            msg.context.reason === CallEndReason.CALL_FINISHED &&
            msg.context.agent &&
            msg.context.agent.id !== currentUserId &&
            msg.context.agent.state.isMaster
        ) {
            this.uiNotifications.addWarning('agentInterface.transfers.warmTransfer.agentDisconnected', undefined, undefined, {
                agentLogin: msg.context.agent.login,
            });
        }
    }

    private updActionsIfEmptyCallStatus(interaction: VoiceInteraction, prevActions: Action[]): Action[] {
        const actions = [...prevActions];
        if (interaction.callStatus == null) {
            actions.push(VoiceInteractionsActions.removeInteraction({ uuid: interaction.uuid }));
        }
        return actions;
    }

    private updActionsIfCallStatusExists(
        msg: WsVoiceChannelStatusMsgPayload,
        interaction: VoiceInteraction,
        prevActions: Action[]
    ): Action[] {
        const actions = [...prevActions];
        if (interaction.callStatus !== null) {
            actions.push(
                VoiceInteractionsActions.updateInteraction({
                    uuid: interaction.uuid,
                    interaction: LODASH.cloneDeep(interaction),
                    conferenceStatus: msg,
                })
            );
        }
        return actions;
    }

    private updateHelperQueue(msg: VoiceChannelStatus, interaction: VoiceInteraction): VoiceInteraction {
        interaction = LODASH.cloneDeep(interaction);
        if (msg.context['helperQueue'] === null) {
            return interaction;
        }
        const queue = LODASH.get(msg, 'context.helperQueue', {});
        const queueState = LODASH.get(queue, 'state.state', null);
        const newState: ConferenceProgressStatusWs = queueState ?? msg.status;

        // Update conference buddy
        if (interaction.newProtocolCallInfo.conferenceType === ConferenceType.SINGLE) {
            interaction.newProtocolCallInfo.conferenceType = ConferenceType.MASTER_PREPARATION;
        }

        interaction.newProtocolCallInfo = {
            ...interaction.newProtocolCallInfo,
            conferenceAgent: {
                ...interaction.newProtocolCallInfo.conferenceAgent,
                state: newState,
                stateTimestamp:
                    newState === interaction.newProtocolCallInfo.conferenceAgent.state
                        ? interaction.newProtocolCallInfo.conferenceAgent.stateTimestamp
                        : new Date(),
                queueName: queue['name'],
            },
        };

        const statusEnded = [ConferenceProgressStatusWs.FINISHED, ConferenceProgressStatusWs.ORIGINATE_ERROR];
        if (statusEnded.indexOf(interaction.newProtocolCallInfo.conferenceAgent.state) !== -1) {
            interaction.newProtocolCallInfo.conferenceType = ConferenceType.SINGLE;
        }

        return interaction;
    }

    private patchContact(pathPrefix: string, msg: VoiceChannelStatus, interaction: VoiceInteraction): VoiceInteraction {
        interaction = LODASH.cloneDeep(interaction);
        if (!msg.context['client']) {
            return interaction;
        }

        this.logger.logInfo(LogTag.VOICE_INTERACTION, 'Client package present', msg.context['client']);

        interaction.phone = LODASH.get(msg, pathPrefix + '.phone', interaction.phone);

        interaction.newProtocolCallInfo.transferType = LODASH.get(
            msg,
            pathPrefix + '.state.transferState',
            interaction.newProtocolCallInfo.transferType
        );

        interaction.newProtocolCallInfo = {
            ...interaction.newProtocolCallInfo,
            client: {
                ...interaction.newProtocolCallInfo.client,
                legId: LODASH.get(msg, pathPrefix + '.legId', interaction.newProtocolCallInfo.client.legId),
                phone: LODASH.get(msg, pathPrefix + '.phone', interaction.newProtocolCallInfo.client.phone),
                state: LODASH.get(msg, pathPrefix + '.state.state', interaction.newProtocolCallInfo.client.state),
                onHold:
                    LODASH.get(msg, pathPrefix + '.state.state', interaction.newProtocolCallInfo.client.state) === ConferenceProgressStatusWs.HOLD,
                muted: LODASH.get(msg, pathPrefix + '.state.muted', interaction.newProtocolCallInfo.client.muted),
            },
        };

        return interaction;
    }

    private updateExternalHelper(msg: VoiceChannelStatus, interaction: VoiceInteraction): VoiceInteraction {
        interaction = LODASH.cloneDeep(interaction);
        if (LODASH.get(msg, 'context.type', null) !== 'External') {
            return this.patchContact('context.contact', msg, interaction);
        }
        if (interaction.newProtocolCallInfo.conferenceType === ConferenceType.SINGLE) {
            interaction.newProtocolCallInfo.conferenceType = ConferenceType.MASTER_PREPARATION;
        }

        const newState = LODASH.get(msg, 'context.contact.state.state', interaction.newProtocolCallInfo.conferenceAgent.state);

        interaction.newProtocolCallInfo = {
            ...interaction.newProtocolCallInfo,

            conferenceAgent: {
                ...interaction.newProtocolCallInfo.conferenceAgent,
                legId: LODASH.get(msg, 'context.contact.legId', interaction.newProtocolCallInfo.conferenceAgent.legId),
                phone: LODASH.get(msg, 'context.contact.phone', interaction.newProtocolCallInfo.conferenceAgent.phone),
                state: newState as ConferenceProgressStatusWs,
                stateTimestamp:
                    newState === interaction.newProtocolCallInfo.conferenceAgent.state
                        ? interaction.newProtocolCallInfo.conferenceAgent.stateTimestamp
                        : new Date(),
                onHold:
                    LODASH.get(msg, 'context.contact.state.state', interaction.newProtocolCallInfo.conferenceAgent.state) ===
                    ConferenceProgressStatusWs.HOLD,
                muted: LODASH.get(msg, 'context.contact.state.muted', interaction.newProtocolCallInfo.conferenceAgent.muted),

                id: null,
                login: null,
                firstName: null,
                lastName: null,
            },
        };

        const statusEnded = [ConferenceProgressStatusWs.FINISHED, ConferenceProgressStatusWs.ORIGINATE_ERROR];
        if (statusEnded.indexOf(interaction.newProtocolCallInfo.conferenceAgent.state) !== -1) {
            interaction.newProtocolCallInfo.conferenceType = ConferenceType.SINGLE;
        }

        return interaction;
    }
}

// Метод 3



// Было. Цикломатическая сложность handleInteractionRestore - 16

class OriginalInteractionRestore {
    private handleInteractionRestore([action, oldInteraction, requiredWrapupsOnly]): Action[] {
        const actions: Action[] = [];

        try {
            const interaction = this.getInteractionFromSnapshot(action.data);

            if (interaction) {
                actions.push(
                    VoiceInteractionsActions.newInteraction({
                        interaction,
                        conferenceStatus: null,
                    })
                );

                if (interaction.callType === CallType.OUTBOUND_CAMPAIGN) {
                    if (interaction.outboundCampaignCallInfo.contactId != null) {
                        actions.push(VoiceInteractionsActions.loadOutboundCampaignCallInfo({uuid: interaction.uuid}));
                    }

                    const countDownEnd = interaction.outboundCampaignCallInfo.previewDurationCountDownEndsAt;
                    if (countDownEnd != null && interaction.callStatus === CallStatus.PREVIEW) {
                        actions.push(
                            VoiceInteractionsActions.startCallPreviewCountdown({
                                previewDurationStart: interaction.outboundCampaignCallInfo.previewDurationCountDownStartsAt,
                                previewDurationEnd: countDownEnd,
                                legId: interaction.newProtocolCallInfo.agent.legId,
                            })
                        );
                    }
                }
                if (interaction.newProtocolCallInfo.transferContext) {
                    if (
                        interaction.newProtocolCallInfo.transferContext.callScript.id &&
                        interaction.newProtocolCallInfo.transferContext.contactId
                    ) {
                        actions.push(
                            VoiceInteractionsActions.newTransferContactCallScript({
                                callScript: interaction.newProtocolCallInfo.transferContext.callScript,
                                contactId: interaction.newProtocolCallInfo.transferContext.contactId,
                                activityType: interaction.newProtocolCallInfo.transferContext.activityContactType,
                            })
                        );
                    }
                } else {
                    if (
                        interaction.callType === CallType.OUTBOUND_FREE &&
                        interaction.outboundFreeCallInfo?.callScriptId &&
                        interaction.outboundFreeCallInfo.freeCallContactId
                    ) {
                        actions.push(
                            VoiceInteractionsActions.newFreecallContact({
                                callScriptId: interaction.outboundFreeCallInfo.callScriptId,
                                manualOutboundContactId: interaction.outboundFreeCallInfo.freeCallContactId,
                            })
                        );
                    } else if (
                        interaction.callType === CallType.INBOUND &&
                        interaction.inboundCallInfo?.callScriptId &&
                        interaction.inboundCallInfo.activityContactId
                    ) {
                        actions.push(
                            VoiceInteractionsActions.newInboundContact({
                                callScriptId: interaction.inboundCallInfo.callScriptId,
                                activityContactId: interaction.inboundCallInfo.activityContactId,
                            })
                        );
                    }
                }

                const rvi = action.data.routingVisualInfo;
                if (rvi) {
                    if (rvi.openPagePlace === 'popup') {
                        window.open(
                            rvi.url,
                            rvi.url,
                            'resizable=1, scrollbars=1' +
                            ',height=' +
                            rvi.popupHeight +
                            ',width=' +
                            rvi.popupWidth +
                            ',left=' +
                            rvi.popupLeft +
                            ',top=' +
                            rvi.popupTop
                        );
                    } else {
                        actions.push(VoiceInteractionsActions.displayWebPageInIframeWsEvent({url: rvi.url}));
                    }
                }

                if (action.data.ucvUrl) {
                    actions.push(VoiceInteractionsActions.updateCallUcv({
                        uuid: interaction.uuid,
                        ucvUrl: action.data.ucvUrl
                    }));
                }

                if (action.data.recordingUrl) {
                    actions.push(VoiceInteractionsActions.newRecordStarted({recordUrl: action.data.recordingUrl}));
                }

                if (action.data.paymentInfo && action.data.paymentInfo.paymentAvailable) {
                    actions.push(PaymentActions.loadPaymentStatus({conferenceId: interaction.newProtocolCallInfo.conferenceId}));
                }

                if (interaction.newProtocolCallInfo.wrapupFolderId && requiredWrapupsOnly) {
                    actions.push(WrapupsActions.loadRequiredWrapups({folderId: interaction.newProtocolCallInfo.wrapupFolderId}));
                }

                actions.push(VoiceInteractionsActions.afterRestoreVoiceStateSuccess({interaction}));
            } else if (oldInteraction != null) {
                actions.push(VoiceInteractionsActions.removeInteraction({uuid: oldInteraction.uuid}));
            }

            actions.push(CrmDataBridgeActions.updateCrmDataBridgeOnRestoreState({interaction, snapshot: action.data}));
        } catch (e) {
            this.logger.logError(LogTag.VOICE_INTERACTION, 'Failed to restore voice state', e);
        }

        return of(...actions);
    }
}

// Стало. Цикломатическая сложность основного метода снижена в 5 раз до 3
// Использованные методы:
//      - Избавление от if/else, цепочек вложенных if
//      - Методы явно возвращают значения (убран тип void)
//      - Добавлена иммутабельность
// Выводы.
// Этот метод похож на предыдущий, только он попроще, здесь не мутируется интеракция, а просто наполняется очередь экшенов.
// Я также добавил иммутабельность очереди, чтобы сделать функции более изолированными друг от друга.
// Это тоже я вижу как возможный первый шаг рефакторинга, дальше хотел бы сделать это как-то более декларативно,
// возможно здесь подошел бы какой-то паттерн матчинг, т.е. если бы вариант состояние, при котором нужно добавить
// экшен в очередь матчилось с текущим, экшен бы добавлялся. В идеале вообще уйти от добавлений экшена по совокупности условий
class RefactoredInteractionRestore {
    private handleInteractionRestore([action, oldInteraction, requiredWrapupsOnly]): Action[] {
        let actions: Action[] = [];

        try {
            const interaction = this.getInteractionFromSnapshot(action.data);

            if (!interaction) {
                return of(...actions);
            }

            if (!interaction && oldInteraction != null) {
                actions.push(VoiceInteractionsActions.removeInteraction({uuid: oldInteraction.uuid}));
                actions.push(
                    CrmDataBridgeActions.updateCrmDataBridgeOnRestoreState({
                        interaction,
                        snapshot: action.data,
                    })
                );
                return of(...actions);
            }

            actions.push(
                VoiceInteractionsActions.newInteraction({
                    interaction: LODASH.cloneDeep(interaction),
                    conferenceStatus: null,
                })
            );

            actions = this.updateActionsIfOutboundCampaign(interaction, actions);
            actions = this.updateActionsIfIsTransfer(interaction, actions);
            actions = this.updateActionsIfOutboundFreeCall(interaction, actions);
            actions = this.updateInteractionIfInboundCall(interaction, actions);
            actions = this.updActionsIfShouldOpenIframe(action.data.routingVisualInfo, actions);
            actions = this.checkActionAndUpdateActions(interaction, action, actions);
            actions = this.updateActionsIfWrapupsRequired(interaction, actions, requiredWrapupsOnly);
            actions.push(VoiceInteractionsActions.afterRestoreVoiceStateSuccess({interaction: LODASH.cloneDeep(interaction)}));
            actions.push(
                CrmDataBridgeActions.updateCrmDataBridgeOnRestoreState({
                    interaction: LODASH.cloneDeep(interaction),
                    snapshot: action.data,
                })
            );

            this.openPopupIfRoutingVisualInfo(action.data.routingVisualInfo);

        } catch (e) {
            this.logger.logError(LogTag.VOICE_INTERACTION, 'Failed to restore voice state', e);
        }

        return of(...actions);
    }

    private updateActionsIfOutboundCampaign(interaction: VoiceInteraction, prevActions: Action[]): Action[] {
        const actions = [...prevActions];
        if (interaction.callType !== CallType.OUTBOUND_CAMPAIGN) {
            return;
        }
        if (interaction.outboundCampaignCallInfo.contactId != null) {
            actions.push(VoiceInteractionsActions.loadOutboundCampaignCallInfo({uuid: interaction.uuid}));
        }

        const countDownEnd = interaction.outboundCampaignCallInfo.previewDurationCountDownEndsAt;
        if (countDownEnd != null && interaction.callStatus === CallStatus.PREVIEW) {
            actions.push(
                VoiceInteractionsActions.startCallPreviewCountdown({
                    previewDurationStart: interaction.outboundCampaignCallInfo.previewDurationCountDownStartsAt,
                    previewDurationEnd: countDownEnd,
                    legId: interaction.newProtocolCallInfo.agent.legId,
                })
            );
        }
        return actions;
    }

    private updateActionsIfIsTransfer(interaction: VoiceInteraction, prevActions: Action[]): Action[] {
        const actions = [...prevActions];

        if (
            interaction.newProtocolCallInfo.transferContext &&
            interaction.newProtocolCallInfo.transferContext.callScript.id &&
            interaction.newProtocolCallInfo.transferContext.contactId
        ) {
            actions.push(
                VoiceInteractionsActions.newTransferContactCallScript({
                    callScript: interaction.newProtocolCallInfo.transferContext.callScript,
                    contactId: interaction.newProtocolCallInfo.transferContext.contactId,
                    activityType: interaction.newProtocolCallInfo.transferContext.activityContactType,
                })
            );
        }
        return actions;
    }

    private updateActionsIfOutboundFreeCall(interaction: VoiceInteraction, prevActions: Action[]): Action[] {
        const actions = [...prevActions];

        if (
            !interaction.newProtocolCallInfo.transferContext &&
            interaction.callType === CallType.OUTBOUND_FREE &&
            interaction.outboundFreeCallInfo?.callScriptId &&
            interaction.outboundFreeCallInfo.freeCallContactId
        ) {
            actions.push(
                VoiceInteractionsActions.newFreecallContact({
                    callScriptId: interaction.outboundFreeCallInfo.callScriptId,
                    manualOutboundContactId: interaction.outboundFreeCallInfo.freeCallContactId,
                })
            );
        }

        return actions;
    }

    private updateInteractionIfInboundCall(interaction: VoiceInteraction, prevActions: Action[]): Action[] {
        const actions = [...prevActions];

        if (
            interaction.callType === CallType.INBOUND &&
            interaction.inboundCallInfo?.callScriptId &&
            interaction.inboundCallInfo.activityContactId
        ) {
            actions.push(
                VoiceInteractionsActions.newInboundContact({
                    callScriptId: interaction.inboundCallInfo.callScriptId,
                    activityContactId: interaction.inboundCallInfo.activityContactId,
                })
            );
        }

        return actions;
    }

    private openPopupIfRoutingVisualInfo(rvi: RoutingVisualInfo) {
        if (rvi && rvi.openPagePlace === 'popup') {
            window.open(
                rvi.url,
                rvi.url,
                'resizable=1, scrollbars=1' +
                ',height=' +
                rvi.popupHeight +
                ',width=' +
                rvi.popupWidth +
                ',left=' +
                rvi.popupLeft +
                ',top=' +
                rvi.popupTop
            );
        }
    }

    private updActionsIfShouldOpenIframe(rvi: RoutingVisualInfo, prevActions: Action[]): Action[] {
        const actions = [...prevActions];
        if (rvi && rvi.openPagePlace !== 'popup') {
            actions.push(VoiceInteractionsActions.displayWebPageInIframeWsEvent({url: rvi.url}));
        }
        return actions;
    }

    private checkActionAndUpdateActions(interaction: VoiceInteraction, action, prevActions: Action[]): Action[] {
        const actions = [...prevActions];
        if (action.data.ucvUrl) {
            actions.push(VoiceInteractionsActions.updateCallUcv({uuid: interaction.uuid, ucvUrl: action.data.ucvUrl}));
        }
        if (action.data.recordingUrl) {
            actions.push(VoiceInteractionsActions.newRecordStarted({recordUrl: action.data.recordingUrl}));
        }

        if (action.data.paymentInfo && action.data.paymentInfo.paymentAvailable) {
            actions.push(PaymentActions.loadPaymentStatus({conferenceId: interaction.newProtocolCallInfo.conferenceId}));
        }
        return actions;
    }

    private updateActionsIfWrapupsRequired(interaction: VoiceInteraction, prevActions: Action[], requiredWrapupsOnly: boolean): Action[] {
        const actions = [...prevActions];
        if (interaction.newProtocolCallInfo.wrapupFolderId && requiredWrapupsOnly) {
            actions.push(WrapupsActions.loadRequiredWrapups({folderId: interaction.newProtocolCallInfo.wrapupFolderId}));
        }
        return actions;
    }

}