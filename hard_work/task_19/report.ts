

// 1. Призрачное состояние

    // 1.

        onToggleItem(node: TreeNode): void {
            (node.children || []).forEach((subNode) => {
                subNode.data.toggled = node.data.toggled;
            });
            if (node.parent) {
                let allFalse = true,
                    allTrue = true;
                node.parent.children.forEach((item) => {
                    allFalse = allFalse && !item.data.toggled;
                    allTrue = allTrue && item.data.toggled;
                });
                node.parent.data.toggled = allTrue;
            }
            this.sendUpdatedSelection();
        }


    // 2.

        getParentId(route: ActivatedRoute): string {
            let currentSnapshot = route.snapshot;
            let id;
            while (currentSnapshot && !id) {
                id = currentSnapshot.params.id;
                currentSnapshot = currentSnapshot.parent;
            }
            return id;
        }

    // 3.

        private updateMatchingQueues(): void {
            this.matchingQueues = {};

            this.channelInfos.forEach((ci) => (ci.canEnable = {}));

            const unassign = this.channelInfos.reduce((acc, ch) => {
                acc[ch.channel] = [];
                return acc;
            }, {});
            const assign = this.channelInfos.reduce((acc, ch) => {
                acc[ch.channel] = [];
                return acc;
            }, {});

            this.queues = LODASH.uniqBy(
                []
                    .concat(
                        ...this.channelInfos.map((channel) =>
                            channel.skillCombinationsControl.value
                                .map((item) => {
                                    const name = this.getQueueName(item);
                                    return {
                                        icon: channel.icon,
                                        label: name,
                                        value: <QueueInfo>{
                                            name: name,
                                            channel: channel.channel,
                                        },
                                    };
                                })
                                .sort((l, r) => l?.label.localeCompare(r?.label)),
                        ),
                    )
                    .filter((item) => item.label?.length > 0),
                (item) => `${item.channel}@${item.label}`,
            );

            this.queueFilter = (this.queueFilter ?? []).filter((queue) =>
                LODASH.some(
                    this.queues.map((q) => q.value),
                    queue,
                ),
            );

            this.availableUsers.forEach((user) => {
                this.channelInfos.map((info) => {
                    const userSkills = this.userGetSkillsByChannel(user, info.channel);
                    const skills: ActivitySkillsCombination[] = info.skillCombinationsControl.value;

                    if (userSkills) {
                        skills
                            .filter((queue) => this.defaultActivity || queue?.skillIds?.length > 0)
                            .forEach((queue) => {
                                const name = this.getQueueName(queue);
                                if (LODASH.intersection(queue.skillIds, userSkills).length === queue.skillIds.length) {
                                    info.canEnable[user.id] = true;
                                    this.matchingQueues[user.id] = {
                                        ...this.matchingQueues?.[user.id],
                                        [info.channel]: [...(this.matchingQueues?.[user.id]?.[info.channel] ?? []), name],
                                    };
                                }
                            });
                    }

                    if (!info.canEnable[user.id] && info.currentState[user.id]) {
                        unassign[info.channel].push(user.id);
                    } else if (info.canEnable[user.id] && !info.currentState[user.id] && info.manuallyEnabled.has(user.id)) {
                        assign[info.channel].push(user.id);
                    }
                });
            });

            this.channelInfos.map((info) => {
                let ids = info.userIdControl.value;
                if (!ids) {
                    return;
                }
                ids = [...new Set(ids.filter((id) => !unassign[info.channel].includes(id)).concat(assign[info.channel]))];
                info.userIdControl.setValue(ids);
            });
        }

// 2. Неточности
// Если я правильно понял, что именно относить к неточностям, то вот хороший пример.

// У нас в проектах активно используются фича-тогглы (т.е. новый функцинал скрывается за флагом и становится доступным пользователям не
// сразу, как код попадет в мастер, а когда будет включен тоггл). Но из-за того, что они очень долго живут (на фронте сейчас их 68, на бэке - более 100),
// у нашей системы - огромное количество инвариантов, которые никогда не тестировались друг с другом. Т.е. для фронтенда это - 2 в 68 степени. Какие-то должны быть включены
// в комбинации с другими. Например, для новой версии записей звонков, фича тогглы:
// v1-disabled - выключает первую версию записей
// v2-enabled - включает вторую версию записей на фронте
// use_v2_recordings - включается вторую версию на бэке
// Для перехода на вторую версию все они долждны быть включены. Если, например, параллельно останутся работать обе версии,
// на фронт будет приходить в 2 раза больше событий о записи и работе с ней, что потенциально может что-то сломать (я и сам
// с этим столкнулся, не зная, что работают обе версии, писал код, думая, что так и должно быть. Когда узнал, что один тоггл надо
// отключить, смог сделать свой код проще).
// Тогда как спецификация этого поведения я бы написал:

// USE_V2_RECORDINGS = 'usev2recordings',
// Данный фича тоггл включит 2-ю версию записей звонков на бэкенде. Для полного перехода на вторую версию нужно также
// включить фронтовые фича-тогглы "v2_recordings_enabled" и "v1_recordings_disable". Основное отличие между версиями
// с точки зрения фронта состоит в том, что теперь нам не будет приходить событие newRecord, будет только событие recordState.
// В него будет добавлено поле recordUrl.

// Может быть, я не до конца понял примеры таких "сужающих" неточностей, но больше я примеров не нашел. Обычно будто наоборот - неточности чрезмерно
// "расширяют" код, не сужают его.

// 3. Интерфейс сложнее реализации

    // 1. Метод, обновляющий интеракцию в зависимости от приходящих сообщений. Очень большой и сложный, явно требует подробной
    // специйикации. Здесь бы помогли более точные типы данных, потому что сейчас тут используется один тип WsVoiceChannelStatusMsgPayload,
    // объединяющий в себе все возможные сообщения, поэтому и сам метод получается тиаким излишне сложным - нужно уметь обработать любые сообщения.
    // Если создать отдельный тип для каждого сообщения, можно выделить их обработчики в отдельные функции, что существенно упростит данный метод.

private handleChannelStatusForNewProtocol(
    msg: WsVoiceChannelStatusMsgPayload,
    interaction: VoiceInteraction,
    currentUserId: number,
): Observable<Action> {
    if (!msg.context.agentLegId) {
    this.logger.logError(LogTag.VOICE_INTERACTION, "`msg.context` doesn't contain `agentLegId`");
}

    const directionCallType = this.voiceInteractionService.getCallTypeByDirection(msg.direction);
    const interactionCallType = VoiceInteractionService.getCallType(interaction);
    const actions: Action[] = [];

    // Check for next interaction event
    if (interaction != null && msg.context.contactSessionId !== interaction.newProtocolCallInfo.contactSessionId) {
        actions.push(VoiceInteractionsActions.removeInteraction({ uuid: interaction.uuid, agentLegId: msg.context.agentLegId }));
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
            VoiceInteractionsActions.newInteraction({ interaction, conferenceStatus: msg, agentLegId: msg.context.agentLegId }),
            LoggerActions.logMetric({ metric: FrontMetric.callAssigned() }),
        );
        this.logger.logInfo(LogTag.VOICE_INTERACTION, 'New interaction:', { conferenceId: LODASH.get(msg, 'context.conferenceId') });
    } else {
        interaction = LODASH.cloneDeep(interaction);
        interaction.callType = interactionCallType || directionCallType;
    }

    // Assign conf id
    Object.assign<VoiceInteraction, Partial<VoiceInteraction>>(interaction, {
        newProtocolCallInfo: {
            ...interaction.newProtocolCallInfo,
            conferenceId: LODASH.get(msg, 'context.conferenceId'),
            contactSessionId: LODASH.get(msg, 'context.contactSessionId'),
        },
    });

    // Payment
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

    // Queue
    if (msg.context['helperQueue'] != null) {
        this.updateHelperQueue(msg, interaction);
    }

    // Client
    if (msg.context['client']) {
        this.logger.logInfo(LogTag.VOICE_INTERACTION, 'Client package present', msg.context['client']);
        this.patchContact('context.client', msg, interaction);
    }

    // Contact
    if (LODASH.get(msg, 'context.type', null) === 'External') {
        this.updateExternalHelper(msg, interaction);
    } else {
        this.patchContact('context.contact', msg, interaction);
    }

    // Agent or helper agent
    const agentId = LODASH.get(msg, 'context.agent.id', null);
    if (agentId != null) {
        if (agentId !== currentUserId) {
            this.updateHelper(msg, interaction);
        } else {
            this.updateSelf(msg, interaction);
        }
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

        // Queue
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

        // Campaign
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
                }),
            );
        }
    }

    // Receiving warm transfer
    if (msg.status === ConferenceProgressStatusWs.TRANSFER_OFFERED) {
        const transferPayload = (msg as unknown as TransferOfferedWs).context;
        // Transfer offered has information about conference master and client
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
            }),
        );
    } else if (
        msg.status === ConferenceProgressStatusWs.NEW_MASTER &&
        interaction.newProtocolCallInfo.conferenceType === ConferenceType.HELPER
    ) {
        const masterAgentId = LODASH.get(msg, 'context.agent.id', null);

        if (masterAgentId === currentUserId) {
            interaction.newProtocolCallInfo.conferenceType = ConferenceType.SINGLE;

            // if we got transfered a call with payment, get the last state updated initial agent
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
            }),
        );
    }

    if (interaction.callStatus === null) {
        actions.push(VoiceInteractionsActions.removeInteraction({ uuid: interaction.uuid, agentLegId: msg.context.agentLegId }));
    } else {
        /**
         * We do unshift vs push, to keep the queue of previous actions in order
         * Otherwise, we will lose all the updates that the code above made
         */
        actions.unshift(
            VoiceInteractionsActions.updateInteraction({
                uuid: interaction.uuid,
                interaction,
                conferenceStatus: msg,
                agentLegId: msg.context.agentLegId,
            }),
        );
    }

    return of(...actions);
}

    // 2. Более подходящие типы данных по крайнем мере для сообщения и типа конференции помогли бы сделать интерфейс функции более наглядным.
private handleConferenceFinishNotification(
    msg: WsVoiceChannelFinishMsgPayload,
    conferenceType: ConferenceType,
    currentUserId: number,
    isShowWarningOnHelperHangup?: boolean | null,
) {
    if (msg.status === ConferenceProgressStatusWs.FINISHED && msg.context.callFinishMessage) {
        //We don't show 'transferConfirm' for slave agent
        if (conferenceType === ConferenceType.HELPER && msg.context.callFinishKey === CallEndReasonV2.TRANSFER_CONFIRM) {
            return;
        }

        //We don't show 'agentHangup' for master agent
        if (conferenceType !== ConferenceType.HELPER && msg.context.callFinishKey === CallEndReasonV2.AGENT_HANGUP) {
            return;
        }

        this.uiNotifications.addSuccess(msg.context.callFinishMessage, '', ERROR_DISPLAY_TIMEOUT);
    } else if (isShowWarningOnHelperHangup && msg.context.callFinishKey === null) {
        if (msg.context.agent && msg.context.agent?.id !== currentUserId) {
            const agentId = msg.context.agent.login;
            this.showHelperHangupWarning(agentId);
        } else if (msg.context.contact) {
            const contactId = msg.context.contact.phone ?? msg.context.contact.sipCallId ?? msg.context.contact.currentPhone;
            this.showHelperHangupWarning(contactId);
        }
    }
}

    // 3. Более точный тип данных, чем ExternalWrapupEnvironment точно помог бы сделать функцию более наглядной

    executeExternalWrapup(wrapUpEnvironment: ExternalWrapupEnvironment): void {
            const { wrapup, interaction, allowedWrapupIds, wrapups, contact } = wrapUpEnvironment;
            this.logger.logInfo(LogTag.DEBUG, 'ExternalWrapup', { interaction, wrapup });

            if (!allowedWrapupIds.includes(wrapup.wrapupId)) {
            this.handleNotAllowedExternalWrapup(wrapup, interaction);
            return;
        }

        if (!wrapups[wrapup.wrapupId]) {
            this.logger.logError(LogTag.CRM, 'ExternalWrapup.idNotFound', { wrapups, idReceived: wrapup.wrapupId });
            this.store$.dispatch(
                CoreUiStateActions.notificationMessage({
                    severity: 'error',
                    messageParams: ['agentInterface.crm.externalWrapup.error.wrapupNotFound'],
                }),
            );
            return;
        }

        const isInvalid =
            ExternalWrapUpService.invalidExternalWrapupPersonalCallback(wrapup, interaction, wrapups) ||
            ExternalWrapUpService.invalidExternalWrapupScheduledCall(wrapup, interaction, wrapups);
        if (isInvalid) {
            this.store$.dispatch(
                CoreUiStateActions.notificationMessage({
                    severity: 'error',
                    messageParams: ['agentInterface.crm.externalWrapup.error.invalidCallBackDate'],
                }),
            );
            return;
        }
        this.store$.dispatch(
            CoreUiStateActions.notificationMessage({
                severity: 'success',
                messageParams: ['agentInterface.crm.externalWrapup.success.wrapupIdOk'],
            }),
        );
        const preWrapupData = ExternalWrapUpService.getPreWrapupObject(wrapup, interaction, wrapups);
        this.store$.dispatch(CrmWrapupActions.updateWrapup({ wrapupObject: preWrapupData }));

        this.logger.logInfo(LogTag.DEBUG, 'ExternalWrapup.preWrapupData', preWrapupData);
        if (contact) {
            this.store$.dispatch(CrmWrapupActions.updateContactAndDoCrmPreWrapup({ contactId: contact.id, wrapupObject: preWrapupData }));
        } else {
            this.store$.dispatch(CrmWrapupActions.doPreWrapup({ wrapupObject: preWrapupData }));
        }
    }