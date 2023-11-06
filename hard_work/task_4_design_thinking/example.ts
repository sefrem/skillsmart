export class VoiceInteractionInboundEffects implements OnRunEffects {
    withExistingInboundActions$ = this.allActions$.pipe(
        this.voiceInteractionService.filterByCurrentCallTypes(this.store$, [CallType.INBOUND])
    );

    onConferenceStatus$ = createEffect(() =>
        this.withExistingInboundActions$.pipe(
            ofType(VoiceInteractionsActions.newInteraction, VoiceInteractionsActions.updateInteraction),
            withLatestFrom(this.store$.pipe(select(AgentInterfaceCommonSelectors.selectVoiceInteractionState))),
            switchMap(([action, voiceState]) => {
                try {
                    return this.handleChannelStatusForInboundCall(action.conferenceStatus, voiceState.interaction);
                } catch (e) {
                    this.logger.logError(LogTag.VOICE_INTERACTION, 'Error in voice-interaction-inbound effect', e);
                }
            })
        )
    );

    onLoadInboundInfo$ = createEffect(() =>
        this.withExistingInboundActions$.pipe(
            ofType(VoiceInteractionsActions.loadInboundCallInfo),
            withLatestFrom(this.store$.pipe(select(AgentInterfaceCommonSelectors.selectVoiceInteraction))),
            switchMap(([action, interaction]) => {
                const actions = [];

                return this.voiceApi.getAssignedCampaigns().pipe(
                    switchMap((campaigns) => {
                        actions.push(CampaignsActions.loadCampaignsSuccess({campaigns}));
                        return this.voiceApi
                            .searchContacts(
                                {
                                    campaignsIds: campaigns.map((c) => c.id),
                                    phones: [interaction.phone],
                                },
                                1,
                                40
                            )
                            .pipe(map((data) => data.items));
                    }),
                    switchMap((contacts) => {
                        actions.push(
                            ContactsActions.storeContactsOnInboundCall({
                                contacts,
                            })
                        );
                        return concat([
                            ...actions,
                            VoiceInteractionsActions.loadInboundCallInfoSuccess({
                                uuid: action.uuid,
                                contactIds: contacts.map((c) => c.id),
                            }),
                        ]);
                    }),
                    catchError((error) =>
                        of(
                            VoiceInteractionsActions.loadInboundCallInfoFailed({
                                error,
                                uuid: action.uuid,
                            })
                        )
                    )
                );
            })
        )
    );

    /**
     * Process wrapup action
     * @type {Observable<any>}
     */
    onWrapup$ = createEffect(() =>
        this.withExistingInboundActions$.pipe(
            ofType(VoiceInteractionsActions.wrapupCall),
            withLatestFrom(
                this.store$.pipe(select(AgentInterfaceCommonSelectors.selectVoiceInteraction)),
                this.store$.pipe(select(AgentInterfaceCommonSelectors.selectContactMap)),
                this.store$.select(CoreFeatureToggleSelectors.selectHasFeature(FeatureToggleName.TECHNICAL_ASYNC_API_STAGE_2))
            ),
            switchMap(([action, interaction, contactMap, asyncCall]) => {
                const contact = contactMap[interaction.inboundCallInfo.workingContactId];
                const wrapupPayload: WrapupRequestPayload = {
                    conferenceId: interaction.newProtocolCallInfo.conferenceId,
                    wrapupId: action.wrapupId,
                    agentLegId: interaction.newProtocolCallInfo.agent.legId,
                    comment: action.wrapupComment,
                };
                const stream = LODASH.isNil(contact)
                    ? asyncCall
                        ? this.voiceApi.wrapupInboundCallAsNonCampaignAsync(wrapupPayload)
                        : this.voiceApi.wrapupInboundCallAsNonCampaign(wrapupPayload)
                    : asyncCall
                        ? this.voiceApi.wrapupInboundCallAsOutboundContactAsync({
                            ...wrapupPayload,
                            campaignId: contact.campaignId,
                            contactId: contact.idInCampaign,
                            retryDate: action.callbackDate,
                        })
                        : this.voiceApi.wrapupInboundCallAsOutboundContact({
                            ...wrapupPayload,
                            campaignId: contact.campaignId,
                            contactId: contact.idInCampaign,
                            retryDate: action.callbackDate,
                        });

                return stream.pipe(
                    map(() =>
                        VoiceInteractionsActions.wrapupCallSuccess({
                            uuid: interaction.uuid,
                            wrapupId: action.wrapupId,
                            wrapupComment: action.wrapupComment,
                        })
                    ),
                    catchError((error) =>
                        of(
                            VoiceInteractionsActions.wrapupCallFailed({
                                error,
                                uuid: interaction.uuid,
                            })
                        )
                    )
                );
            })
        )
    );

    loadCallscript$ = createEffect(() =>
        this.withExistingInboundActions$.pipe(
            ofType(VoiceInteractionsActions.newInboundContact),
            filter((action) => !LODASH.isNil(action.callScriptId)),
            withLatestFrom(this.store$.pipe(select(AgentInterfaceCommonSelectors.selectVoiceInteraction))),
            switchMap(([action, interaction]) =>
                merge(
                    of(CallscriptViewActions.ClearView({uuid: CallscriptViewInstance.VOICE_INTERACTION})),
                    this.voiceApi.getActivityContactRecord(action.activityContactId, ActivityContactType.INBOUND).pipe(
                        map((contact) =>
                            CallscriptViewActions.LoadCallscript({
                                uuid: CallscriptViewInstance.VOICE_INTERACTION,
                                callscriptId: action.callScriptId,
                                varMap: Object.assign({}, (contact.variables as StringMap<string>) ?? {}, {
                                    system_inbound_phone_number: interaction?.phone, // This is a legacy metavariable
                                }),
                            })
                        ),
                        catchError((error) => {
                            this.logger.logError(LogTag.INTERNAL, 'Failed to get inbound contact record for:', {
                                activityId: action.activityContactId,
                                error,
                            });
                            return EMPTY;
                        })
                    )
                )
            )
        )
    );

    onSetInboundWrapupAsInboundContactByUi = createEffect(() =>
        this.withExistingInboundActions$.pipe(
            ofType(VoiceInteractionsActions.setInboundWrapupAsCampaignByUi),
            withLatestFrom(this.store$.select(AgentInterfaceCommonSelectors.selectWrapupDraft), (payload, draft) => ({
                ...payload,
                draft
            })),
            switchMap(({uuid, contactId, draft}) => [
                CallscriptViewActions.ClearView({
                    uuid: CallscriptViewInstance.VOICE_INTERACTION,
                }),
                VoiceInteractionsActions.loadContactWrapupAsCampaignInternal({uuid, contactId}),
                VoiceInteractionsActions.saveWrapupDraft({wrapup: draft}),
            ])
        )
    );

    onLoadContactForLoadRequiredWrapups$ = createEffect(() =>
        this.withExistingInboundActions$.pipe(
            ofType(VoiceInteractionsActions.loadContactWrapupAsCampaignInternal),
            this.ngrxHelper.withFeature(FeatureToggleName.REQUEST_ONLY_REQUIRED_WRAPUPS),
            withLatestFrom(
                this.store$.select(AgentInterfaceCommonSelectors.selectCampaignsMap),
                this.store$.select(AgentInterfaceCommonSelectors.selectContactMap)
            ),
            map(([action, campaigns, contacts]) => {
                const contact = contacts[action.contactId];
                return campaigns[contact?.campaignId];
            }),
            filter((campaign) => !!campaign),
            switchMap((campaign) => {
                return of(WrapupsActions.loadRequiredWrapups({folderId: campaign.wrapupFolderId}));
            })
        )
    );

    onLoadContact$ = createEffect(() =>
        this.withExistingInboundActions$.pipe(
            ofType(VoiceInteractionsActions.loadContactWrapupAsCampaignInternal),
            withLatestFrom(
                this.store$.select(AgentInterfaceCommonSelectors.selectVoiceInteraction),
                this.store$.select(AgentInterfaceCommonSelectors.selectCampaignsMap),
                this.store$.select(AgentInterfaceCommonSelectors.selectContactMap)
            ),
            switchMap(([action, {inboundCallInfo}, campaigns, contacts]) => {
                if (this.hasInboundCallScriptAndWeWrapupAsInbound(action.contactId, inboundCallInfo)) {
                    return of(
                        VoiceInteractionsActions.newInboundContact({
                            callScriptId: inboundCallInfo.callScriptId,
                            activityContactId: inboundCallInfo.activityContactId,
                        })
                    );
                } else {
                    const contact = contacts[action.contactId];
                    const campaign = campaigns[contact?.campaignId];

                    if (!contact || !campaign || campaign.formType !== CampaignFormType.CALLSCRIPT || !campaign.callScriptId) {
                        return EMPTY;
                    }

                    return of(
                        CallscriptViewActions.LoadCallscriptWithCampaignContact({
                            contactId: contact.idInCampaign,
                            campaignId: contact.campaignId,
                            callScriptId: campaign.callScriptId,
                            csUuid: CallscriptViewInstance.VOICE_INTERACTION,
                        })
                    );
                }
            })
        )
    );

    constructor(
        private allActions$: Actions,
        private store$: Store,
        private voiceApi: AgentVoiceApiService,
        private logger: LoggingService,
        private voiceInteractionService: VoiceInteractionService,
        private ngrxHelper: CoreNgrxHelper
    ) {
    }

    hasInboundCallScriptAndWeWrapupAsInbound(contactId: number, inboundCallInfo: InboundCallInfo): boolean {
        return contactId == null && inboundCallInfo.callScriptId != null && inboundCallInfo.activityContactId != null;
    }

    private handleChannelStatusForInboundCall(
        msg: WsVoiceChannelStatusMsgPayload | WsDisplayChannelStatusMsgPayload | WsVoiceChannelFinishMsgPayload,
        interaction: VoiceInteraction
    ): Observable<Action> {
        const actions: Action[] = [];
        const callInfo = LODASH.cloneDeep(interaction.inboundCallInfo);

        Object.assign<InboundCallInfo, Partial<InboundCallInfo>>(callInfo, {
            ...callInfo,
            queueId: LODASH.get(msg, 'context.queue.id', callInfo.queueId),
            queueName: LODASH.get(msg, 'context.queue.name', callInfo.queueName),

            serviceName: LODASH.get(msg, 'context.service.name', callInfo.serviceName),
            servicePhoneNumber: LODASH.get(msg, 'context.service.phone', callInfo.servicePhoneNumber),

            sipCallId: LODASH.get(msg, 'context.contact.sipCallId', callInfo.sipCallId),
            voxpayId: LODASH.get(msg, 'context.contact.voxpayId', callInfo.voxpayId),

            allowWrapupInCampaign: LODASH.get(msg, 'context.wrapupInfo.allowWrapupInCampaign', callInfo.allowWrapupInCampaign),

            skills: LODASH.get(msg, 'context.skills', callInfo.skills),
            variables: LODASH.get(msg, 'context.variables', callInfo.variables),
            callScriptId: LODASH.get(msg, 'context.callScript.id', callInfo.callScriptId),
            callScriptName: LODASH.get(msg, 'context.callScript.name', callInfo.callScriptName),
            ivrDurationMs: LODASH.get(msg, 'context.duration.ivr', callInfo.ivrDurationMs),
            queuesWaitTimeMs: LODASH.get(msg, 'context.duration.queueWait', callInfo.queuesWaitTimeMs),
        });

        if (!LODASH.isEqual(interaction.inboundCallInfo, callInfo)) {
            actions.push(
                VoiceInteractionsActions.updateInboundInteraction({
                    uuid: interaction.uuid,
                    inboundInfo: callInfo,
                })
            );
        }

        if (
            (interaction.inboundCallInfo.dataStatus === LoadingStatus.NONE || interaction.inboundCallInfo.dataStatus === LoadingStatus.ERROR) &&
            interaction.phone
        ) {
            actions.push(VoiceInteractionsActions.loadInboundCallInfo({uuid: interaction.uuid}));
        }

        return of(...actions);
    }

    ngrxOnRunEffects(resolvedEffects$: Observable<EffectNotification>): Observable<EffectNotification> {
        return this.allActions$.pipe(
            ofType(AgentInterfaceCommonActions.initializeAgentInterface),
            exhaustMap(() => resolvedEffects$.pipe(takeUntil(this.allActions$.pipe(ofType(AgentInterfaceCommonActions.terminateAgentInterface)))))
        );
    }
}
