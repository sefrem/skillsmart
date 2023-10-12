
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