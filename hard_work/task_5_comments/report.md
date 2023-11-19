
Пример 1

Класс, инкапсулирующий методы работы со звонками со стороны Service Cloud Voice (SCV) Salesforce-интеграции.
Класс Connector, реализующий интерфейс VendorConnector, вызывает методы данного класса для управления звонками.
Со стороны SCV взаимодействие с нашей системой происходит через методы данного класса. Из нашей системы в SCV мы
посылаем сообщения при помощи методов publishEvent и publishError. Инициализируется этот класс методом initializeConnector,
который также передает в метод init параметр callCenterConfig - настройки Contact Center ползователя Salesforce, а также основную
информацию о пользователе.

    export class ConnectorSCV {
        constructor(
        @Inject(HttpClientRaw) private http: HttpClient,
        @Inject(AuthTokenServiceToken) private authTokenService: TokenService,
        private store$: Store,
        private actions$: Actions,
        private hermes: HermesService
        ) {}

    initInterface() {
        publishEvent({
        eventType: Constants.EVENT_TYPE.LOGIN_RESULT,
        payload: new GenericResult({ success: true }),
        });

    this.store$.dispatch(AuthActions.checkSession({ forceTokenRequest: false }));

    this.store$
      .pipe(
        select(AuthSelectors.selectAuthInitStatus),
        first((status) => status === LoadingStatus.DONE)
      )
      .subscribe(() => {
        this.store$.dispatch(AgentInterfaceCommonActions.initializeAgentInterface());
        this.store$.dispatch(WsSessionActions.registerSession({ isCrm: true, prevRequestId: null }));
      });
    }

    init(callCenterConfig: any) {
        this.hermes.on(Topics.LOGIN_SUCCESS, () => {
          this.initInterface();
        });
    
        return firstValueFrom(this.authTokenService.getAuthToken(true))
          .then((token) => {
            this.initInterface();
    
            return Promise.resolve(new InitResult({}));
          })
          .catch(() => {
            return Promise.resolve(new InitResult({ showLogin: true }));
          });
    }
    ...

Пример 2

Базовый сервис интеграции с CRM, методы которого используются реализациями конкретных интеграций. Конкретная интеграция
передается в метод initCrmIntegration при инициализации. Выбор интеграции происходит классом IntegrationsGuard при инициализации агентского
интерфейса, если в урле есть query-параметр, обозначающий конкретную интеграцию. Далее происходит загрузка модуля конкретной интеграции
классом IntegrationLoaderService, там же загружаются пользовательские настройки конкретной интеграции.
Основная сущность данного класса - это crmDataBridge. Это объект, в котором хранится вся информация о текущем пользовательском
взаимодействии с интеграцией. Все методы изменения этой сущности хранятся в данном классе. Далее конкретная интеграция отслеживает ее изменения
и реагуирует на них. Если мы по какой-то причине обнуляем dataBridge в процессе активной интеракции пользователя, возникают баги, когда в
пользовательской CRM появляется не вся информация о звонке или введенная агентом. Одно из самых хрупких мест всего нашего кода.


    export class CrmIntegrationService<SDK = any> {
        crmDataBridge: CrmDataBridgeState = CrmDataBridge.initialState;
        user: AuthUser;
        listenersRunning: boolean = false;
        
        private resetCrmIntegration: Subject<void> = new Subject();
        private preWrapup: Subject<[CrmDataBridgeState, number]> = new Subject();
        private wrapup: Subject<CrmDataBridgeState> = new Subject();
        private agentStatus$: BehaviorSubject<CTIAgentStatusEvent> = new BehaviorSubject({
        currentStatus: null,
        previousStatus: null,
        userId: null,
        });
        private clickToCallEnabled$: BehaviorSubject<boolean> = new BehaviorSubject(false);
        private conferenceStatus: Subject<CrmConferenceStatus> = new Subject();
        private retrySaveCallLog: Subject<{ attempt: number; data: any; logInfo: LogEntryIdentifiers }> = new Subject();
        crmInstance: any;
        private confirmationDialog$: Subject<Confirmation> = new Subject();
    
        crmClientSDK: SDK = null;
        crmIdentifier: CrmIdentifier;
        private integrationConfig: ExternalIntegrationConfig = DEFAULT_CONFIG;
        
        crmInstanceActive$: BehaviorSubject<boolean> = new BehaviorSubject(false);
        LOGIN_STATUS = 'Login';
        LOGOUT_STATUS = 'Logout';
        
        constructor(private store$: Store, private injector: Injector, private logService: LoggingService, private window: WindowService) {
            this.logPageLoadInformation();
        }
    
        displayErrorMessage(message: string): void {
            this.store$.dispatch(CoreUiStateActions.notificationMessage({ severity: 'error', messageParams: [message] }));
        }
        
        confirm(config: Confirmation): void {
            return this.confirmationDialog$.next(config);
        }
        
        onConfirmation(): Observable<Confirmation> {
            return this.confirmationDialog$.asObservable().pipe(filter((config) => config != null));
        }
        ...

Пример 3

Класс, имлементирующий и расширяющий интерфейс SipService, который нужен для установления WebRtc соединения.
После загрузки агентского интерфеса и подключения data-сокета (веб-сокет, используемый для обмена информационными сообщениями), мы посылаем на бэкенд
сообщение о необходимости выдать агенту webrtc номер. Когда бэкенд ответным сообщением присылает нам номер, данный сервис создаем объект подключения
к sip-протоколу (в который также входит аудио-поток от пользователя) и логинит пользователя. Далее управление звонком и контроль сессии происходит здесь.
В основном методы данноо сервиса вызываются из класса SipWebrtcConnectionEffects, где собраны эффекты, реагирующие на экшены из других частей системы.


    export class SipJsService implements SipService, OnDestroy {
        static TAG_LOCAL_STORAGE_CALL_INFO: string = 'sip-call-info';
        
        @HasFeature(FeatureToggleName.SIP_WEBRTC_PRIORITY)
        sipCallPriority$: Observable<boolean>;
        
        registererState$: BehaviorSubject<RegistererState> = new BehaviorSubject(null);
        
        private userAgent: UserAgent;
        private registerer: Registerer;
        private session: Invitation;
        private sessionDescriptionsHandlerOptions = {
        constraints: {
        audio: { echoCancellation: true },
        video: false,
        },
        };
        
        private uaConnectFail: number = 0;
        private registerFail: number = 0;
        private callStats: CallStats;
        private stopCallStatsHandling$: Subject<void> = new Subject();
        private registererWaitingRequest$: BehaviorSubject<boolean> = new BehaviorSubject(false);
        private transportConnected$: BehaviorSubject<boolean> = new BehaviorSubject(false);
        private doLogin$: Subject<void> = new Subject();
        
        get sessionState(): PeerConnectionState {
            return (
            ((this.session?.sessionDescriptionHandler as SessionDescriptionHandler)?.peerConnection?.connectionState as PeerConnectionState) ??
            null
            );
        }
        
        get isCallConnected(): boolean {
            return this.sessionState === PeerConnectionState.CONNECTED;
        }
        
        get userAgentUsername(): string {
            return this.userAgent?.['options']?.['authorizationUsername'];
        }
        ...

Выводы

Признаюсь - до данного задания я также был сторонником "самодокументирующегося кода" и почти никогда не писал комментариев
в коде, только в самых крайних случаях. Вы отлично "продали" мне комментарии. Действительно, получается большая логическая дыра
в том, что каким бы самодокументирующимся код ни был, он никогда не сможет задокументировать то, что находится вокруг него,
и о чем он не знает.
Для этого и нужны или даже необходимы комментарии. 