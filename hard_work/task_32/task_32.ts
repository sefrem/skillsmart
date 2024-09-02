
// Ниже пример класса Call, который обращается к методам звонка в зависимости от этапа звонка.
// Каждый этап звонка реализует следующий интерфейс.

export interface CallState {
    handleDeviceSignals(signal: ICallControlSignal, dispatchAction: DispatchAction): void;
}

export interface IdleState extends CallState {
    takeCallLock(): Promise<RingingState | IdleState>;
}

export interface RingingState extends CallState {
    startRinger(): RingingState;
    startCall(): ActiveState | RingingState;
    hangupCall(): IdleState | RingingState;
    resetState(): RingingState;
}

export interface ActiveState extends CallState {
    hangupCall(): IdleState | ActiveState;
    resetState(): ActiveState;
}


export class Call {
    private state: CallState | null = null;

    constructor(
        callControl: ICallControl,
        private dispatchAction: DispatchAction,
        private logger: LoggingService,
        private uiNotificationsService: UiNotificationsService,
        private translate: TranslateService,
    ) {
        this.state = new CallIdle(callControl, this.logger, this.uiNotificationsService, this.translate);
    }

    async takeCallLock(): Promise<void> {
        if (this.state instanceof CallIdle) {
            this.state = await this.state.takeCallLock();
        } else {
            this.logger.logError(LogTag.HEADSET_INTEGRATION, 'Invalid action for state CallIdle');
        }
    }

    startRinger(): void {
        if (this.state instanceof CallRinging) {
            this.state = this.state.startRinger();
        } else {
            this.logger.logError(LogTag.HEADSET_INTEGRATION, 'Invalid action for state CallRinging');
        }
    }

    startCall(): void {
        if (this.state instanceof CallRinging) {
            this.state = this.state.startCall();
        } else {
            this.logger.logError(LogTag.HEADSET_INTEGRATION, `Invalid action for state CallRinging`);
        }
    }

    hangupCall(): void {
        if (this.state instanceof CallRinging || this.state instanceof CallActive) {
            this.state = this.state.hangupCall();
        } else {
            this.logger.logError(LogTag.HEADSET_INTEGRATION, 'Invalid action for state CallRinging or CallActive');
        }
    }

    handleDeviceSignals(signal: ICallControlSignal): void {
        this.state?.handleDeviceSignals(signal, this.dispatchAction);
    }

    resetDeviceState(): void {
        if (this.state instanceof CallRinging || this.state instanceof CallActive) {
            this.state = this.state.resetState();
        } else {
            this.logger.logError(LogTag.HEADSET_INTEGRATION, 'Invalid action for state CallRinging or CallActive');
        }
    }

    get isCallRinging(): boolean {
        return this.state instanceof CallRinging;
    }

    get isCallActive(): boolean {
        return this.state instanceof CallActive;
    }
}