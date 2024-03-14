// 1
// Было
onCallFinishNotification$ = createEffect(
    () =>
        this.listenWsMessage(wsChannelFinishMessage).pipe(
            delay(50),
            withLatestFrom(
                this.store$.pipe(
                    select(AgentInterfaceCommonCoreSelectors.selectVoiceInteractionState),
                    filter((state) => !!state.interaction?.newProtocolCallInfo?.conferenceId),
                    map((state) => state.interaction as VoiceInteraction)
                ),
                this.store$.pipe(
                    select(AgentInterfaceCommonSelectors.selectAgentId),
                    filter((id) => id != null)
                )
            ),
            tap(([msg, interaction, currentUserId]) => {
                const voiceChannelMsg = msg.channel === WsChannels.PHONE ? msg : null;
                const callType = this.voiceInteractionService.getCallTypeByDirection(voiceChannelMsg?.direction);
                if (
                    VoiceInteractionNewProtocolHandlingEffects.MATCHING_CALLTYPES.indexOf(callType) !== -1 &&
                    interaction.newProtocolCallInfo.conferenceId === msg.context.conferenceId
                ) {
                    try {
                        this.handleConferenceFinishNotification(voiceChannelMsg, interaction.newProtocolCallInfo.conferenceType, currentUserId);
                    } catch (e) {
                        this.logger.logError(LogTag.VOICE_INTERACTION, 'Error in voice-interaction-new-protocol-handling notification effect', e);
                    }
                }
            })
        ),
    {dispatch: false}
);


private
handleConferenceFinishNotification(
    msg
:
WsVoiceChannelFinishMsgPayload,
    conferenceType
:
ConferenceType,
    currentUserId
:
number,
    isShowWarningOnHelperHangup ? : boolean | null
)
{
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


// Стало
// Убрал проверки из метода handleConferenceFinishNotification в фильтры до него. Попутно обнаружил,
// что часть кода в методе не вызывается никогда. Удалил это.
onCallFinishNotification$ = createEffect(
    () =>
        this.listenWsMessage(wsChannelFinishMessage).pipe(
            filter(
                (msg) =>
                    msg.status === ConferenceProgressStatusWs.FINISHED &&
                    !!msg.context.callFinishMessage &&
                    !!VoiceInteractionNewProtocolHandlingEffects.MATCHING_CALLTYPES.indexOf(
                        this.voiceInteractionService.getCallTypeByDirection(msg?.direction)
                    ) &&
                    msg.channel === WsChannels.PHONE
            ),
            delay(50),
            withLatestFrom(
                this.store$.pipe(
                    select(AgentInterfaceCommonSelectors.selectVoiceInteraction),
                    filter((interaction) => !!interaction?.newProtocolCallInfo?.conferenceId)
                )
            ),
            filter(
                ([{context},
                     {newProtocolCallInfo: {conferenceType, conferenceId}},
                 ]) =>
                    conferenceId === context.conferenceId &&
                    ((context.callFinishKey === CallEndReasonV2.TRANSFER_CONFIRM && conferenceType !== ConferenceType.HELPER) ||
                        (context.callFinishKey === CallEndReasonV2.AGENT_HANGUP && conferenceType === ConferenceType.HELPER))
            ),
            tap(([msg]) => {
                this.uiNotifications.addSuccess(msg.context.callFinishMessage, '', ERROR_DISPLAY_TIMEOUT);
            }),
            catchError((_, err) => {
                this.logger.logError(LogTag.VOICE_INTERACTION, 'Error in voice-interaction-new-protocol-handling notification effect', err);
                return err;
            })
        ),
    {dispatch: false}
);


//2
//Было
returnToPrevScreen(): void {
    this.currentStep$.pipe(
            withLatestFrom(this.hasPaymentButtonRight$, this.store$.select(AgentInterfaceCommonSelectors.selectPaymentUpdatedByExternalEvent)),
            take(1),
            map(([currentStep, _hasPaymentButtonRight, isExternal]) => {
                if (currentStep === PaymentSteps.PAYMENT_INFO) {
                    if (isExternal) {
                        return null;
                    }
                    return PaymentSteps.PAYMENT_FORM;
                } else if (currentStep === PaymentSteps.PAYMENT_STATUS) {
                    return PaymentSteps.PAYMENT_PROGRESS;
                }
                return null;
            })
        )
        .subscribe((nextStep: PaymentSteps | null) => {
            if (!nextStep) {
                return;
            }
            this.store$.dispatch(PaymentActions.changePaymentScreenByUi({stage: nextStep, manualNavigation: true}));
        })
}

// Стало
// Упростил проверки, избавился от вложенности
returnToPrevScreen(): void {
    this.currentStep$.pipe(
            withLatestFrom(this.store$.select(AgentInterfaceCommonSelectors.selectPaymentUpdatedByExternalEvent)),
            take(1),
            map(([currentStep, isExternal]) => {
                if (currentStep === PaymentSteps.PAYMENT_INFO && !isExternal) {
                    return PaymentSteps.PAYMENT_FORM;
                }
                if (currentStep === PaymentSteps.PAYMENT_STATUS) {
                    return PaymentSteps.PAYMENT_PROGRESS;
                }
            })
        )
        .subscribe((nextStep: PaymentSteps) => {
            this.store$.dispatch(PaymentActions.changePaymentScreenByUi({stage: nextStep, manualNavigation: true}));
        });
}

// 3
// Было
onContactCreated$ = createEffect(() =>
    this.actions$.pipe(
        ofType(ContactsActions.createContactSuccess),
        withLatestFrom(this.store$.pipe(select(AgentInterfaceCommonSelectors.selectExistingVoiceInteractionWithContactAndCampaign))),
        switchMap(([action, [interaction, , campaign]]) => {
            if (interaction) {
                if (campaign && campaign.hasContactSearch && action.contact && action.contact.campaignId === campaign.id) {
                    return of(
                        ContactSearchActions.setSearchResultsOnContactCreation({
                            contactId: action.contact.id,
                            global: false,
                        }),
                        ContactSearchActions.selectContactInSearchOnCreation({
                            contactId: action.contact.id,
                            global: false,
                        })
                    );
                } else {
                    return EMPTY;
                }
            } else {
                return of(
                    ContactSearchActions.setSearchResultsOnContactCreation({
                        contactId: action.contact.id,
                        global: true,
                    }),
                    ContactSearchActions.selectContactInSearchOnCreation({
                        contactId: action.contact.id,
                        global: true,
                    })
                );
            }
        })
    )
);


// Стало
// Разделил эффект на 2 метода, проверки вынес в фильтры
onContactCreatedWithInteraction$ = createEffect(() =>
    this.actions$.pipe(
        ofType(ContactsActions.createContactSuccess),
        withLatestFrom(
            this.store$.pipe(
                select(AgentInterfaceCommonSelectors.selectExistingVoiceInteractionWithContactAndCampaign),
                filter(([interaction, , campaign]) => !!interaction && campaign && campaign.hasContactSearch))
        ),
        map(([action, [, , campaign]]) => ({action, campaign})),
        filter(({action, campaign}) => action.contact && action.contact.campaignId === campaign.id),
        switchMap(({action}) => {
            return of(
                ContactSearchActions.setSearchResultsOnContactCreation({
                    contactId: action.contact.id,
                    global: false,
                }),
                ContactSearchActions.selectContactInSearchOnCreation({
                    contactId: action.contact.id,
                    global: false,
                })
            );
        })
    )
);

onContactCreatedWithoutInteraction$ = createEffect(() =>
    this.actions$.pipe(
        ofType(ContactsActions.createContactSuccess),
        withLatestFrom(
            this.store$.pipe(
                select(AgentInterfaceCommonSelectors.selectExistingVoiceInteractionWithContactAndCampaign),
                filter(([interaction]) => !interaction))
        ),
        switchMap(([action]) => {
            return of(
                ContactSearchActions.setSearchResultsOnContactCreation({
                    contactId: action.contact.id,
                    global: true,
                }),
                ContactSearchActions.selectContactInSearchOnCreation({
                    contactId: action.contact.id,
                    global: true,
                })
            );
        })
    )
);


//4
// Было
onUpdateContact$ = createEffect(() =>
    this.actions$.pipe(
        ofType(ContactsActions.updateContactCustomFieldsByUi, ContactsActions.updateContactCustomFieldsByCallscript),
        withLatestFrom(this.store$.pipe(select(AgentInterfaceCommonSelectors.selectContactMap))),
        switchMap(([action, contacts]) => {
            const contact = contacts[action.contactId];

            if (!contact) {
                this.logger.logError(LogTag.INTERNAL, "Can't update not loaded contact onUpdateContact", action);
                return EMPTY;
            }

            return this.voiceApi.updateContactRecord(contact.campaignId, contact.idInCampaign, action.record).pipe(
                map((data) =>
                    ContactsActions.updateContactCustomFieldsSuccess({
                        contact: data,
                    })
                ),
                catchError((error) =>
                    of(
                        ContactsActions.updateContactCustomFieldsFailed({
                            contactId: action.contactId,
                            error,
                        })
                    )
                )
            );
        })
    )
);

// Стало
// Убрал проверку в фильтр, удалил ненужное логирование
onUpdateContact$ = createEffect(() =>
    this.actions$.pipe(
        ofType(ContactsActions.updateContactCustomFieldsByUi, ContactsActions.updateContactCustomFieldsByCallscript),
        withLatestFrom(this.store$.pipe(select(AgentInterfaceCommonSelectors.selectContactMap))),
        filter(([action, contacts]) => !!contacts[action.contactId]),
        switchMap(([action, contacts]) => {
            const contact = contacts[action.contactId];
            return this.voiceApi.updateContactRecord(contact.campaignId, contact.idInCampaign, action.record).pipe(
                map((data) =>
                    ContactsActions.updateContactCustomFieldsSuccess({
                        contact: data,
                    })
                ),
                catchError((error) =>
                    of(
                        ContactsActions.updateContactCustomFieldsFailed({
                            contactId: action.contactId,
                            error,
                        })
                    )
                )
            );
        })
    )
);

//5
// Было
onRecordState$ = createEffect(() =>
    this.voiceInteractionService.listenWsMessages(this.actions$, this.store$, wsRecordStateMessage).pipe(
        withLatestFrom(this.store$.pipe(select(AgentInterfaceCommonSelectors.selectVoiceInteraction))),
        switchMap(([msg, interaction]) => {
            if (interaction && msg) {
                return of(
                    VoiceInteractionsActions.recordingStateUpdated({
                        uuid: interaction.uuid,
                        active: msg.context.recordState.recording,
                    })
                );
            } else {
                this.logger.logError(LogTag.VOICE_INTERACTION, 'Cant process RecordingStateUpdated action without active voice interactions');
                return EMPTY;
            }
        })
    )
);

// Стало
// Убрал проверку в фильтр и ненужное логирование
onRecordState$ = createEffect(() =>
    this.voiceInteractionService.listenWsMessages(this.actions$, this.store$, wsRecordStateMessage).pipe(
        withLatestFrom(
            this.store$.pipe(
                select(AgentInterfaceCommonSelectors.selectVoiceInteraction),
                filter((interaction) => !!interaction))
        ),
        switchMap(([msg, interaction]) =>
            of(
                VoiceInteractionsActions.recordingStateUpdated({
                    uuid: interaction.uuid,
                    active: msg.context.recordState.recording,
                })
            )
        )
    )
);

