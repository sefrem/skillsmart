

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


class VoiceInteractionHandler {

    private checkIfInteractionFromPrevEvent(interaction: VoiceInteraction, contactSessionId: string, actions: Action[]): VoiceInteraction {
        if (interaction != null && contactSessionId !== interaction.newProtocolCallInfo.contactSessionId) {
            actions.push(VoiceInteractionsActions.removeInteraction({uuid: interaction.uuid}));
            interaction = null;
        }
        return interaction;
    }

    private updateEmptyInteraction({
                                       interaction,
                                       msg,
                                       actions,
                                       directionCallType,
                                   }: {
        interaction: VoiceInteraction;
        msg: WsVoiceChannelStatusMsgPayload;
        actions: Action[];
        directionCallType: CallType;
    }): VoiceInteraction {
        interaction = getDefaultNewProtocolInteraction();
        interaction.callType = VoiceInteractionService.getCallTypeByActivityType(msg.context['activityContactType']) ?? directionCallType;

        actions.push(
            VoiceInteractionsActions.newInteraction({interaction, conferenceStatus: msg}),
            LoggerActions.logMetric({metric: FrontMetric.callAssigned()})
        );
        this.logger.logInfo(LogTag.VOICE_INTERACTION, 'New interaction:', {conferenceId: LODASH.get(msg, 'context.conferenceId')});
        return interaction;
    }

    private updateInteraction(interaction: VoiceInteraction, interactionCallType, directionCallType): VoiceInteraction {
        interaction = LODASH.cloneDeep(interaction);
        interaction.callType = interactionCallType || directionCallType;

        return interaction;
    }

    private updateInteractionWIthConferenceId(interaction: VoiceInteraction, msg: WsVoiceChannelStatusMsgPayload): VoiceInteraction {
        return {
            ...interaction,
            newProtocolCallInfo: {
                ...interaction.newProtocolCallInfo,
                conferenceId: LODASH.get(msg, 'context.conferenceId'),
                contactSessionId: LODASH.get(msg, 'context.contactSessionId'),
            },
        };
    }

    private handlePaymentMessage(msg: WsVoiceChannelStatusMsgPayload, interaction: VoiceInteraction, actions: Action[]): VoiceInteraction {
        if (msg.context['paymentInfo']) {
            this.logger.logInfo(LogTag.VOICE_INTERACTION, 'Payment package present', msg.context['paymentInfo']);
            const paymentAvailable = LODASH.get(msg, 'context.paymentInfo.paymentAvailable');

            interaction = {
                ...interaction,
                paymentInfo: {
                    paymentAvailable,
                    paymentMultiple: LODASH.get(msg, 'context.paymentInfo.paymentMultiple'),
                },
            };
        }

        if (msg.context['paymentInfo'] && paymentAvailable) {
            actions.push(PaymentActions.loadPaymentStatus({ conferenceId: interaction.newProtocolCallInfo.conferenceId }));
        }
        return interaction;
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

    private updateInteractionIfCampaignExists(msg: WsVoiceChannelStatusMsgPayload, interaction: VoiceInteraction, actions: Action[]): VoiceInteraction {
        const activityCallType = VoiceInteractionService.getCallTypeByActivityType(msg.context['activityContactType']);

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

        return interaction;
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

    private handleReceiveWarmTransfer(msg: WsVoiceChannelStatusMsgPayload, interaction: VoiceInteraction, actions: Action[]): VoiceInteraction {
        if (msg.status !== ConferenceProgressStatusWs.TRANSFER_OFFERED) {
            return interaction;
        }
        const transferPayload = (msg as unknown as TransferOfferedWs).context;
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

        return interaction;
    }

    private handleNewConference({
                                    msg,
                                    interaction,
                                    actions,
                                    currentUserId,
                                }: {
        msg: WsVoiceChannelStatusMsgPayload;
        interaction: VoiceInteraction;
        actions: Action[];
        currentUserId: number;
    }): VoiceInteraction {
        if (msg.status !== ConferenceProgressStatusWs.NEW_MASTER || interaction.newProtocolCallInfo.conferenceType !== ConferenceType.HELPER) {
            return interaction;
        }
        const masterAgentId = LODASH.get(msg, 'context.agent.id', null);
        interaction.newProtocolCallInfo.conferenceType = masterAgentId === currentUserId ? ConferenceType.SINGLE : ConferenceType.HELPER;

        if (masterAgentId === currentUserId && interaction.paymentInfo.paymentAvailable) {
            actions.push(PaymentActions.loadPaymentStatus({conferenceId: interaction.newProtocolCallInfo.conferenceId}));
        }

        return interaction;
    }

    private handleConferenceDialing({
                                        msg,
                                        interaction,
                                        actions,
                                        currentUserId,
                                    }: {
        msg: WsVoiceChannelStatusMsgPayload;
        interaction: VoiceInteraction;
        actions: Action[];
        currentUserId: number;
    }): VoiceInteraction {
        if (msg.status !== ConferenceProgressStatusWs.DIALING || msg.context.agent?.id !== currentUserId) {
            return interaction;
        }
        const {id, login, profile, groups} = msg.context.agent;
        interaction = this.updateCallScriptOnDialing(interaction, msg.context.callScript);
        actions.push(
            CrmDataBridgeActions.updateCrmDataBridgeAgentOnDialing({
                agent: {id, login, profile, groups},
                interaction,
            })
        );
        return interaction;
    }

    private handleConferenceFinished({
                                         msg,
                                         interaction,
                                         actions,
                                         currentUserId,
                                     }: {
        msg: WsVoiceChannelStatusMsgPayload;
        interaction: VoiceInteraction;
        actions: Action[];
        currentUserId: number;
    }): VoiceInteraction {
        if (msg.status !== ConferenceProgressStatusWs.FINISHED || !msg.context.agent) {
            return interaction;
        }
        if (msg.context.reason === CallEndReason.TRANSFER_CONFIRM) {
            actions.push(VoiceInteractionsActions.callFinishedByTransferConfirm());
        }
        if (
            msg.context.reason === CallEndReason.TRANSFER_CONFIRM &&
            msg.context.agent.id !== currentUserId &&
            interaction.callType === CallType.OUTBOUND_CAMPAIGN
        ) {
            actions.push(VoiceInteractionsActions.loadOutboundCampaignCallInfo({uuid: interaction.uuid}));
        }

        if (msg.context.agent?.id === currentUserId && interaction.newProtocolCallInfo.conferenceType !== ConferenceType.HELPER) {
            actions.push(CrmDataBridgeActions.updateCrmDataBridgeCallEndReason({callEndReason: msg.context.reason}));
        }

        return interaction;
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

    private updActionsIfEmptyCallStatus(interaction: VoiceInteraction, actions: Action[]): void {
        if (interaction.callStatus == null) {
            actions.push(VoiceInteractionsActions.removeInteraction({uuid: interaction.uuid}));
        }
    }

    private updActionsIfCallStatusExists(msg: WsVoiceChannelStatusMsgPayload, interaction: VoiceInteraction, actions: Action[]): void {
        if (interaction.callStatus !== null) {
            actions.push(
                VoiceInteractionsActions.updateInteraction({
                    uuid: interaction.uuid,
                    interaction,
                    conferenceStatus: msg,
                })
            );
        }
    }

    private updateHelperQueue(msg: VoiceChannelStatus, interaction: VoiceInteraction): VoiceInteraction {
        if (msg.context['helperQueue'] === null) {
            return interaction;
        }
        const queue = LODASH.get(msg, 'context.helperQueue', {});
        const queueState = LODASH.get(queue, 'state.state', null);
        const newState: ConferenceProgressStatusWs = queueState ?? msg.status;

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

    private handleChannelStatusForNewProtocol(
        msg: WsVoiceChannelStatusMsgPayload,
        interaction: VoiceInteraction,
        currentUserId: number
    ): Observable<Action> {
        const directionCallType = this.voiceInteractionService.getCallTypeByDirection(msg.direction);
        const interactionCallType = VoiceInteractionService.getCallType(interaction);
        const actions: Action[] = [];

        this.updActionsIfCallStatusExists(msg, interaction, actions);
        this.handleContactFininishedCallFailure(msg);
        this.handleTransferDisconnectedDuringTransfer(msg, currentUserId);

        interaction = this.ifInteractionFromPrevEvent(interaction, msg.context.contactSessionId, actions);

        if (interaction == null && STARTING_STATUSES.indexOf(this.voiceInteractionService.getInternalCallStatus(msg.status, null)) === -1) {
            return EMPTY;
        }

        interaction =
            interaction == null
                ? this.updateEmptyInteraction({interaction, msg, actions, directionCallType})
                : this.updateInteraction(interaction, interactionCallType, directionCallType);
        interaction = this.updateInteractionWIthConferenceId(interaction, msg);
        interaction = this.handlePaymentMessage(msg, interaction, actions);
        interaction = this.updateHelperQueue(msg, interaction);
        interaction = this.patchContact('context.client', msg, interaction);
        interaction = this.updateExternalHelper(msg, interaction);
        interaction = this.updateNewProtocolCallInfo(msg, interaction, currentUserId);
        interaction = this.checkIfPureConferenceState(msg, interaction);
        interaction = this.updateInteractionIfActivityContactTypeExists(msg, interaction, directionCallType);
        interaction = this.updateInteractionIfQueueExists(msg, interaction);
        interaction = this.updateInteractionIfCampaignExists(msg, interaction, actions);
        interaction = this.handleReceiveWarmTransfer(msg, interaction, actions);
        interaction = this.handleNewConference({msg, interaction, actions, currentUserId});
        interaction = this.handleConferenceDialing({msg, interaction, actions, currentUserId});
        interaction = this.handleConferenceFinished({msg, interaction, actions, currentUserId});

        this.updActionsIfEmptyCallStatus(interaction, actions);

        return of(...actions);
    }
}