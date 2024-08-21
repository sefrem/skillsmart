


// 1
async function setAgentStatus (agentStatus: string, statusInfo: AgentStatusFromWidget, enqueueNextState: boolean): Promise<GenericResult> {
    if ('statusId' in statusInfo) {
        this.store$.dispatch(ScvActions.setAgentStatus({ statusId: statusInfo?.statusId }));
    }
    // If the key reasonForChange is present on the status object
    // it means that the status has been set to offline and we need to logout
    if ('reasonForChange' in statusInfo) {
        this.logout();
    }


    return new GenericResult({ success: false });
}

// 2
async function dial (contact: Contact): Promise<CallResult> {
    // If contact id is present it means we are starting an internal call to the agent, otherwise it is just
    // an outbound call
    if (contact.id) {
        this.store$.dispatch(VoiceInteractionsActions.startAgentToAgentCall({ agentId: Number(contact.id) }));
    } else {
        this.store$.dispatch(ScvActions.startCall({ phoneNumber: contact.phoneNumber }));
    }

    return firstValueFrom(
        this.actions$.pipe(
            ofType(VoiceInteractionsActions.newInteraction),
            filter(({ interaction }) => [CallType.OUTBOUND_FREE, CallType.AGENT_TO_AGENT].includes(interaction.callType)),
            map(({ interaction }) => {
                const call = new PhoneCall({
                    phoneNumber: interaction.phone,
                    callId: interaction.newProtocolCallInfo.conferenceId,
                    callType: CALL_TYPES_DBLC_SCV_MAP[interaction.callType],
                    callAttributes: new PhoneCallAttributes({
                        participantType: Constants.PARTICIPANT_TYPE.AGENT,
                    }),
                });
                this.addActiveCall(call);

                return new CallResult({ call });
            }),
        ),
    );
}

// 3

onLogout$ = createEffect(() =>
    this.actions$.pipe(
        ofType(AuthActions.logoutByUi),
        switchMap(() =>
            // We need to navigate here before logout so after logout and new login we would
            // redirect back to the page and the SCV module would call initializeConnector again
            from(this.router.navigate(['/scv'])).pipe(
                filter(Boolean),
                map(() => CoreUiStateActions.turnOnAutomaticSCVTabActivation({ turnOn: false })),
            ),
        ),
    ),
);


// 4
onScvCallCreatedMessage$ = createEffect(
    () =>
        this.actions$.pipe(
            ofWebsocketMessage(wsScvCallCreatedMessage),
            map(({ payload }) => [payload.context.scvCallId, payload.context.conferenceId]),
            switchMap(([voiceCallId, scvConferenceId]) =>
                this.store$.select(AgentInterfaceCommonSelectors.selectVoiceInteraction).pipe(
                    filter(
                        (interaction) =>
                            [CallType.INBOUND, CallType.OUTBOUND_CAMPAIGN].includes(interaction?.callType) &&
                            interaction.newProtocolCallInfo.conferenceId === scvConferenceId,
                        // We create a call in Salesforce from our BE only if it is an inbound call or an outbound campaign call
                        // (because technically the campaign call starts as an inbound from the point of view of the agent)
                    ),
                    take(1),
                    map((interaction) => {
                        this.connectorMessagingService.postMessage({
                            messageType: CONNECTOR_MESSAGES.CALL_STARTED,
                            payload: {
                                phoneNumber: interaction.phone,
                                callType: CALL_TYPES_DBLC_SCV_MAP[interaction.callType],
                                contact: new Contact({
                                    phoneNumber: interaction.phone,
                                }),
                                state: Constants.CALL_STATE.RINGING,
                                callAttributes: new PhoneCallAttributes({
                                    voiceCallId,
                                }),
                                callId: interaction.newProtocolCallInfo?.conferenceId,
                                callInfo: new CallInfo({
                                    isMuted: false,
                                    isOnHold: false,
                                    isRecordingPaused: !interaction.newProtocolCallInfo.recording,
                                    showRecordButton: true,
                                    recordEnabled: true,
                                    showAddCallerButton: true,
                                }),
                            },
                        });
                    }),
                ),
            ),
        ),
    { dispatch: false },
);

// 5

function onSubmit(): void {
    FormUtils.markAllAsDirty(this.form);

    // Is required for autoError to work
    this.form.updateValueAndValidity({ emitEvent: false });

    if (FormUtils.hasUiError(this.form)) {
    this.focusWithDelay();
    return;
}

this.save.emit({ entity: this.form.getRawValue() });
}