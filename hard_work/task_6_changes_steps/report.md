

Задача 1.
Нужно имплементировать инициализацию интеграции с Salesforce.
В первой задаче мало кода, но уже видна проблема - слишком большие юнит тесты. Кажется, это возникает как следствие того, что тесты
я писал после кода, когда уже представляешь, какую логику хочешь постестировать.

Код:

    export class ConnectorSCV {
        constructor(
        @Inject(HttpClientRaw) private http: HttpClient,
        @Inject(AuthTokenServiceToken) private authTokenService: TokenService,
        private store$: Store,
        private actions$: Actions,
        private hermes: HermesService,
        private router: Router
        ) {}
        
        async init(callCenterConfig: any): Promise<InitResult> {
        return firstValueFrom(this.authTokenService.getAuthToken(false))
        .then(() => {
        this.router.navigate(['/agent-crm']);
        publishEvent({
        // @ts-ignore
        eventType: Constants.EVENT_TYPE.LOGIN_RESULT,
        payload: new GenericResult({ success: true }),
        });
        
                return Promise.resolve(new InitResult({}));
              })
              .catch(() => {
                return Promise.resolve(new InitResult({ showLogin: true }));
              });
        }
        }

Тесты:

        describe('ConnectorSCVService', () => {
            let connectorSCVService: ConnectorSCV;
            let store$: Store;
            let router: Router;
            let authToken: TokenService;
            
            beforeEach(() => {
                TestBed.configureTestingModule({
                imports: [StoreModule.forRoot(coreReducers, { metaReducers: [] })],
                providers: [
                MockProvider(HttpClientRaw),
                MockProvider(AuthTokenServiceToken, { getAuthToken: jest.fn().mockReturnValue(EMPTY) }),
                ConnectorSCV,
                ],
                });
                connectorSCVService = TestBed.inject(ConnectorSCV);
                store$ = TestBed.inject(Store);
                router = TestBed.inject(Router);
                authToken = TestBed.inject(AuthTokenServiceToken);
            });
            
            afterEach(() => {
                jest.resetAllMocks();
            });
            
            it('should be created', () => {
                expect(connectorSCVService).toBeTruthy();
            });
            
            it('init should return empty InitResult if the user is already logged in and send an event to salesforce', async () => {
                const testTokenValue = 'token';
                jest.spyOn(authToken, 'getAuthToken').mockReturnValueOnce(of(testTokenValue));
                const publishEventSpy = jest.spyOn(ScvConnectorBase, 'publishEvent').mockImplementationOnce(() => Promise.resolve());
                const eventDataSentAfterSuccessfulLogin = {
                eventType: Constants.EVENT_TYPE.LOGIN_RESULT,
                payload: new GenericResult({ success: true }),
                };
                const routerNavigateSpy = jest.spyOn(router, 'navigate');
                // This is the default value when the InitResult is initialized with an empty object
                const initResultWhenLoggedIn = { loginFrameHeight: 350, showLogin: false };
            
                const initResult = await connectorSCVService.init({});
            
                expect(initResult).toEqual(initResultWhenLoggedIn);
                expect(publishEventSpy).toHaveBeenCalledWith(eventDataSentAfterSuccessfulLogin);
                expect(routerNavigateSpy).toHaveBeenCalledWith(['/agent-crm']);
            });
            
            it('init should return result that will show login if the user is not logged in', async () => {
                jest.spyOn(authToken, 'getAuthToken').mockReturnValueOnce(EMPTY);
                const initResultWhenNotLoggedIn = { loginFrameHeight: 350, showLogin: true };
                
                    const initResult = await connectorSCVService.init({});
                
                expect(initResult).toEqual(initResultWhenNotLoggedIn);
            });
            });

Задача 2.
Здесь нужно имплементировать разлогин, а также синхронизировать жизненный цикл интеграции (сделать его как в основном приложении) Сюда входит разлогин пользователя при логине в другой системе,
а также поддержание смены активной вкладки приложения при нескольких открытых вкладках одновременно.
Здесь я тесты писал сразу, до логики. Так не всегда получалось, потому что приходилось делать много проб и ошибок, и не всегда казалось адекватным писать тест, если хочешь посмотреть,
как будет работать код, если изменить одну строку. Но при этом вижу несомненную пользу такого метода в том, что тесты помогают не забыть, где ты сейчас находишься, так как добавляя
небольшие изменения то тут то там, можно запутаться в том, по какой ветке кода ты шел изначально. Когда я это понял, то стал стараться писать тесты на каждую итерацию мыслительного процесса,
что, кстати, автоматически делает их более гранулярными.
Всего изменений было немало, несколько десятков, каждый тест неоднократно правил.
Касательно момента с постоянными коммитами кода - может быть это вопрос привычки, но это выглядит избыточным, коммичу код я обычно 1-2 раза в день или реже.

Код:

    export class ConnectorSCV {
        constructor(
        @Inject(HttpClientRaw) private http: HttpClient,
        @Inject(AuthTokenServiceToken) private authTokenService: TokenService,
        private store$: Store,
        private actions$: Actions,
        private router: Router
        ) {}
        
        async init(callCenterConfig: any): Promise<InitResult> {
            return firstValueFrom(this.authTokenService.getAuthToken(false))
            .then(() => {
            this.router.navigate(['/agent-crm']);
            
                    return Promise.resolve(new InitResult({}));
                  })
                  .catch(() => {
                    return Promise.resolve(new InitResult({ showLogin: true }));
                  });
        }
        
        logout(): Promise<LogoutResult> {
            // We need to navigate here before logout so after logout and new login we would
            // redirect back to the page and the SCV module would call initializeConnector again
            this.router.navigate(['/scv']);
            this.store$.dispatch(AuthActions.logoutByUi({ redirectBack: true }));
            
                return Promise.resolve(new LogoutResult({ success: true }));
        }
    }

Тесты:

    describe('ConnectorSCVService', () => {
        let connectorSCVService: ConnectorSCV;
        let connectorService: Connector;
        let store$: Store;
        let router: Router;
        let authToken: TokenService;
        let actions: Actions;
        let actionsSub: Subscription;
        let actionsArray: Action[];
        
        beforeEach(() => {
            TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(coreReducers, { metaReducers: [] }), EffectsModule.forRoot([ConnectorScvEffects])],
            providers: [
            MockProvider(HttpClientRaw),
            MockProvider(AuthTokenServiceToken, { getAuthToken: jest.fn().mockReturnValue(EMPTY) }),
            ConnectorSCV,
            Connector,
            ],
            });
            connectorSCVService = TestBed.inject(ConnectorSCV);
            connectorService = TestBed.inject(Connector);
            store$ = TestBed.inject(Store);
            router = TestBed.inject(Router);
            actions = TestBed.inject(Actions);
            authToken = TestBed.inject(AuthTokenServiceToken);
        });
        
        beforeEach(() => {
            actionsArray = [];
            actionsSub = actions.subscribe((a) => actionsArray.push(a));
        });
        
        afterEach(() => {
            actionsSub.unsubscribe();
            jest.resetAllMocks();
        });
        
        it('should be created', () => {
            expect(connectorSCVService).toBeTruthy();
        });
        
        it('calling init in Connector should call ConnectorSCV init method', () => {
            const connectorSCVInitSpy = jest.spyOn(connectorSCVService, 'init');
            const testConfig = { test };
        
            connectorService.init(testConfig);
        
            expect(connectorSCVInitSpy).toHaveBeenCalledTimes(1);
            expect(connectorSCVInitSpy).toHaveBeenCalledWith(testConfig);
        });
        
        it('init should return empty InitResult if the user is already logged in', async () => {
            const testTokenValue = 'token';
            jest.spyOn(authToken, 'getAuthToken').mockReturnValueOnce(of(testTokenValue));
            const routerNavigateSpy = jest.spyOn(router, 'navigate');
            // This is the default value when the InitResult is initialized with an empty object
            const initResultWhenLoggedIn = { loginFrameHeight: 350, showLogin: false };
        
            const initResult = await connectorSCVService.init({});
        
            expect(initResult).toEqual(initResultWhenLoggedIn);
            expect(routerNavigateSpy).toHaveBeenCalledWith(['/agent-crm']);
        });
        
        it('init should return result that will show login if the user is not logged in', async () => {
            jest.spyOn(authToken, 'getAuthToken').mockReturnValueOnce(EMPTY);
            const initResultWhenNotLoggedIn = { loginFrameHeight: 350, showLogin: true };
        
            const initResult = await connectorSCVService.init({});
        
            expect(initResult).toEqual(initResultWhenNotLoggedIn);
        });
        
        it('calling logout in Connector should call ConnectorSCV logout method', () => {
            const connectorSCVLogoutSpy = jest.spyOn(connectorSCVService, 'logout');
            
            connectorService.logout();
        
            expect(connectorSCVLogoutSpy).toHaveBeenCalledTimes(1);
        });
        
        it('logout method of ConnectorSCV should redirect to scv page', async () => {
            const routerNavigateSpy = jest.spyOn(router, 'navigate');
        
            await connectorSCVService.logout();
        
            expect(routerNavigateSpy).toHaveBeenCalledWith(['/scv']);
        });
        
        it('logout method of ConnectorSCV should return the correct result', async () => {
            const expectedLogoutResult: LogoutResult = { success: true, loginFrameHeight: 350 }; // 350 - is the default value when we don't pass anything
        
            const result = await connectorSCVService.logout();
        
            expect(result).toEqual(expectedLogoutResult);
        });
        
        it('should dispatch a logout action when call logout ConnectorSCV method', async () => {
            const logoutAction = AuthActions.logoutByUi({ redirectBack: true });
        
            await connectorSCVService.logout();
        
            expect(actionsArray).toContainEqual(logoutAction);
        });
        
        it('should publish logout message to Salesforce after the disconnect WS event', () => {
            const publishEventSpy = jest.spyOn(ScvConnectorBase, 'publishEvent').mockImplementationOnce(() => Promise.resolve());
            const eventDataSentAfterLogout = {
            eventType: Constants.EVENT_TYPE.LOGOUT_RESULT,
            payload: new LogoutResult({ success: true }),
            };
        
            store$.dispatch(SocketActions.disconnectedByUser({ code: 0, reason: '' }));
        
            expect(publishEventSpy).toHaveBeenCalledWith(eventDataSentAfterLogout);
        });
        
        it('should redirect to scv route when logout by ws event', () => {
            const routerNavigateSpy = jest.spyOn(router, 'navigate').mockImplementationOnce(() => Promise.resolve(true));
            store$.dispatch(AuthActions.logoutByWsEvent({ redirectBack: true }));
        
            expect(routerNavigateSpy).toHaveBeenCalledWith(['/scv']);
        });
        
        it('should publish login success message to Salesforce after a successfull connection to WebRTC', () => {
            const publishEventSpy = jest.spyOn(ScvConnectorBase, 'publishEvent').mockImplementationOnce(() => Promise.resolve());
            const eventData = {
            eventType: Constants.EVENT_TYPE.LOGIN_RESULT,
            payload: new GenericResult({ success: true }),
            };
        
            store$.dispatch(SipActions.loginToWebrtcSuccess());
        
            expect(publishEventSpy).toHaveBeenCalledWith(eventData);
        });
        
        it('should make current session (tab) active if it has been deactivated from another tab', () => {
            store$.dispatch(CoreUiStateActions.displayAlreadyLoggedScreen());
        
            expect(actionsArray).toContainEqual(CoreUiStateActions.hideAlreadyLoggedScreen());
            expect(actionsArray).toContainEqual(WsSessionActions.autoActivateCurrentSession());
            expect(actionsArray).toContainEqual(
              WsSessionActions.activateCurrentSession({ reason: SessionActivationReason.SWAP_ACTIVE_SESSION_AUTOMATIC })
            );
        });
    });