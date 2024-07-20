
// Было
// Один класс GameStatus, который в зависимости от текущего статуса игры (один из idle, playing, over), выбирает нужные операции. Проверка допустимости
// действий осуществляется при помощи условных операторов внутри методов.

export class GameStatus {
    protected broadcastService: BroadcastService;
    private deck: Card[] = [];
    public dealer: Dealer = {
        id: 0,
        name: 'Dealer',
        hand: [],
        score: 0,
        status: '',
    };
    public playersIds: string[] = [];
    public activePlayerId: string = '';
    public gameState: GameStatus = GameStatus.idle;
    public players: Player[] = [];

    constructor(broadcastOperator: BroadcastOperator<DefaultEventsMap>) {
        this.broadcastService = new BroadcastService(broadcastOperator);
    }

    public checkHandForPairs(player: Player) {
        const totalBet = player.bet.reduce((acc, value) => acc + Number(value), 0);
        const totalChipsValue = Object.entries(player.chips).reduce((acc, [value, quantity]) => acc + Number(value) * quantity, 0);

        if (totalBet > totalChipsValue) return false;

        return player.hand[0].rank === player.hand[1].rank;
    }

    public getInitialState(): InitialState {
        return {
            dealer: this.dealer,
            players: this.players,
            activePlayerId: this.activePlayerId,
            gameState: this.gameState,
        };
    }

    public initGame(playerId: string): void {
        this.addPlayer(playerId);
        this.createDeck();
    }

    public addPlayer(playerId: string): void {
        this.players.push({
            id: playerId,
            name: generateNickname(),
            hand: [],
            score: 0,
            chips: {
                '10': 5,
                '25': 4,
                '50': 3,
                '100': 2,
            },
            status: '',
            bet: [],
            canSplit: null
        });
        this.playersIds.push(playerId);
    }

    public setActivePlayer(playerId: string): void {
        this.activePlayerId = playerId;
    }

    public endBetting(): void {
        if (!this.setNextPlayer()) {
            this.gameState = GameStatus.playing;
            this.broadcastService.emitStatus(this.gameState);
            this.deal();
        }
        this.broadcastService.emitActivePlayerId(this.activePlayerId);
    }

    public hit(): void {
        const activePlayer = this.getActivePlayer();
        activePlayer.hand.push(this.getCardFromTop());
        this.updateActivePlayerScore();

        this.broadcastService.emitPlayers(this.players);

        if (activePlayer.score > 21) {
            this.handlePlayerBusted();
        }
    }

    public stand(): void {
        if (!this.setNextPlayer()) {
            this.dealerPlay();
            return;
        }
        this.updateActivePlayerScore();

        this.broadcastService.emitPlayers(this.players);
        this.broadcastService.emitActivePlayerId(this.activePlayerId);
    }

    private handlePlayerBusted(): void {
        this.setBusted(this.activePlayerId);
        setTimeout(() => {
            this.removePlayerBet(this.activePlayerId);
            this.broadcastService.emitPlayers(this.players);
        }, 500);

        setTimeout(() => {
            if (!this.setNextPlayer()) {
                this.dealerPlay();
            }
            this.broadcastService.emitActivePlayerId(this.activePlayerId);
        }, 1000);
    }

    private dealerPlay(): void {
        this.setActivePlayer('');
        this.updateDealerScore();

        this.broadcastService.emitActivePlayerId(this.activePlayerId);
        this.broadcastService.emitDealer(this.dealer);

        if (this.checkIfAllBusted()) {
            this.resetGame();
            return;
        }

        const dealerInterval = setInterval(() => {
            if (this.dealer.score >= 17) {
                if (this.dealer.score > 21) {
                    this.broadcastService.emitDealer(this.dealer);
                    this.setDealerBusted();

                    this.playersIds.forEach((id) => {
                        this.setPlayerWin(id);
                        this.updateChipsPlayerWon(id);
                    })
                    this.broadcastService.emitPlayers(this.players);
                    return;
                }

                clearInterval(dealerInterval);
                this.checkGameEnd();
                return;
            }
            this.dealerHit();
            this.broadcastService.emitDealer(this.dealer);
        }, 500);
    }

    private checkGameEnd(): void {
        const dealerScore = this.dealer.score;

        this.players.forEach(({ id, score, status }) => {
            if (status === 'busted') {
                this.checkIfBankrupt(id);
                return;
            }

            if (status === 'bankrupt') {
                return;
            }

            if (dealerScore <= 21 && score <= 21) {
                if (dealerScore > score) {
                    this.removePlayerBet(id);
                    this.setPlayerLose(id);
                    this.checkIfBankrupt(id);
                    this.broadcastService.emitPlayers(this.players);
                    return;
                }
                if (score > dealerScore) {
                    this.updateChipsPlayerWon(id);
                    this.setPlayerWin(id);
                    this.broadcastService.emitPlayers(this.players);
                    return;
                }
            }

            if (dealerScore === score) {
                this.updateChipsStandoff(id);
                this.setPlayerStandoff(id);
                this.broadcastService.emitPlayers(this.players);
                return;
            }
        });
        this.resetGame();
    }

    private resetGame(): void {
        let nextGameTimer = 6;
        const countdownTimer = setInterval(() => {
            nextGameTimer -= 1;
            this.broadcastService.emitCountdownTimer(nextGameTimer);
            if (nextGameTimer! <= 0) {
                this.resetPlayers();
                this.resetDealer();
                this.setActivePlayer(this.playersIds[0]);
                this.gameState = GameStatus.idle;
                clearInterval(countdownTimer);
                this.broadcastService.emitPlayers(this.players);
                this.broadcastService.emitDealer(this.dealer);
                this.broadcastService.emitActivePlayerId(this.activePlayerId);
                this.broadcastService.emitStatus(this.gameState);
            }
        }, 1000);
    }

    private resetPlayers(): void {
        this.players = this.players.map(player => {
            player.hand = [];
            player.bet = [];
            player.score = 0;
            player.status = player.status === 'bankrupt' ? 'bankrupt' : '';
            return player;
        });
    }

    private resetDealer(): void {
        if (this.dealer) {
            this.dealer.hand = [];
            this.dealer.score = 0;
            this.dealer.status = '';
        }
    }

    private updateChipsPlayerWon(playerId: string): void {
        const player = this.getPlayerById(playerId);
        player.bet.forEach(value => {
            player.chips[value] += 2;
        });
    }

    private updateChipsStandoff(playerId: string): void {
        const player = this.getPlayerById(playerId);
        player.bet.forEach(value => {
            player.chips[value] += 1;
        });
    }

    private dealerHit(): void {
        this.dealer.hand.push(this.getCardFromTop());
        this.updateDealerScore();
    }

    private checkIfAllBusted(): boolean {
        return this.players.every(({ status }) => status === 'busted');
    }

    private updateDealerScore(): void {
        this.dealer.score = countScoreInHand(this.dealer.hand);
    }

    private updateActivePlayerScore(): void {
        const activePlayer = this.getActivePlayer();
        activePlayer.score = countScoreInHand(activePlayer.hand);
    }

    private deal(): void {
        const players = this.players.slice(-this.players.length);

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j <= players.length; j++) {
                if (j === players.length) {
                    this.dealer.hand.push(this.getCardFromTop());
                    this.broadcastService.emitDealer(this.dealer);
                } else {
                    if (this.players[j].status !== 'bankrupt') {
                        players[j].hand.push(this.getCardFromTop());
                        players[j].score = countScoreInHand(players[j].hand);
                        this.broadcastService.emitPlayers(this.players);
                    }
                }
            }
        }

        this.players.forEach(player => {
            player.canSplit = this.checkHandForPairs(player);
        });
        this.broadcastService.emitDealer(this.dealer);
        this.broadcastService.emitPlayers(this.players);

        this.setActivePlayer(this.playersIds[0]);
        this.broadcastService.emitActivePlayerId(this.activePlayerId);
    }

    public getCardFromTop(): Card {
        if (this.deck.length <= 10) {
            this.createDeck();
        }
        return this.deck.splice(0, 1)[0];
    }

    // Set the next player as active and return false if it was the last one
    private setNextPlayer(): boolean {
        if (!this.activePlayerId) return false;
        const activePlayerIndex = this.playersIds.indexOf(this.activePlayerId);
        if (activePlayerIndex === this.playersIds.length - 1) {
            return false;
        } else {
            this.activePlayerId = this.playersIds[activePlayerIndex + 1];
            return true;
        }
    }

    protected removePlayerChip(chipValue: ChipsValues): void {
        this.getActivePlayer().chips[chipValue]--;
    }

    private checkIfBankrupt(playerId: string): void {
        const player = this.getPlayerById(playerId);
        const chipsPlayerHas = Object.values(player.chips).filter(value => value);
        if (chipsPlayerHas.length === 0) {
            player.status = 'bankrupt';
            this.playersIds.splice(this.playersIds.indexOf(playerId), 1);
            this.broadcastService.emitPlayersIds(this.playersIds);
        }
    }

    private getActivePlayer(): Player {
        return this.getPlayerById(this.activePlayerId);
    }

    protected getPlayerById(playerId: string): Player {
        return this.players.find(({ id }) => id === playerId);
    }

    private createDeck(): void {
        this.deck = shuffleArray(createDeck());
    }

    private setBusted(playerId: string): void {
        this.getPlayerById(playerId).status = 'busted';
    }

    private removePlayerBet(playerId: string): void {
        this.getPlayerById(playerId).bet = [];
    }

    private setPlayerWin(playerId: string): void {
        this.getPlayerById(playerId).status = 'win';
    }

    private setPlayerLose(playerId: string): void {
        this.getPlayerById(playerId).status = 'lose';
    }

    private setPlayerStandoff(playerId: string): void {
        this.getPlayerById(playerId).status = 'standoff';
    }

    private setDealerBusted(): void {
        this.dealer.status = 'busted';
    }
}


// Стало
// Добавлен еще один класс Game, который хранит статус игры и в зависимости от него возвращает один из классов, хранящих допустимый
// набор методов для конкретного состояния. Внешние интерфейсы работают именно с ним (Game) и ничего про наследников не знают.


export class Game {
    protected gameStatus: GameStatus = GameStatus.idle;
    [GameStatus.idle]: GameStateIdle;
    [GameStatus.playing]: GameState;
    [GameStatus.over]: GameStateOver;

    constructor(broadcastOperator: BroadcastOperator<DefaultEventsMap>) {
        this[GameStatus.idle] = new GameStateIdle(broadcastOperator);
        this[GameStatus.playing] = new GameState(broadcastOperator);
        this[GameStatus.over] = new GameStateOver(broadcastOperator);
    }

    public getGameState(): GameState {
        return this[this.gameStatus];
    }

    public hit(): void {}

    public setActivePlayer(playerId: string): void {}

    public setBet(playerId: string, chipValue: ChipsValues): void {}

    public endBetting(): void {}

    public stand(): void {}
}


class GameState extends Game {
    protected broadcastService: BroadcastService;
    private deck: Card[] = [];
    public dealer: Dealer = {
        id: 0,
        name: 'Dealer',
        hand: [],
        score: 0,
        status: '',
    };
    public playersIds: string[] = [];
    public activePlayerId: string = '';

    public players: Player[] = [];

    constructor(broadcastOperator: BroadcastOperator<DefaultEventsMap>) {
        super(broadcastOperator);
        this.broadcastService = new BroadcastService(broadcastOperator);
    }

    public checkHandForPairs(player: Player) {
        const totalBet = player.bet.reduce((acc, value) => acc + Number(value), 0);
        const totalChipsValue = Object.entries(player.chips).reduce((acc, [value, quantity]) => acc + Number(value) * quantity, 0);

        if (totalBet > totalChipsValue) return false;

        return player.hand[0].rank === player.hand[1].rank;
    }

    public getInitialState(): InitialState {
        return {
            dealer: this.dealer,
            players: this.players,
            activePlayerId: this.activePlayerId,
            gameState: this.gameStatus,
        };
    }

    public initGame(playerId: string): void {
        this.addPlayer(playerId);
        this.createDeck();
    }

    public addPlayer(playerId: string): void {
        this.players.push({
            id: playerId,
            name: generateNickname(),
            hand: [],
            score: 0,
            chips: {
                '10': 5,
                '25': 4,
                '50': 3,
                '100': 2,
            },
            status: '',
            bet: [],
            canSplit: null
        });
        this.playersIds.push(playerId);
    }

    public setActivePlayer(playerId: string): void {
        this.activePlayerId = playerId;
    }

    public endBetting(): void {
        if (!this.setNextPlayer()) {
            this.gameStatus = GameStatus.playing;
            this.broadcastService.emitStatus(this.gameStatus);
            this.deal();
        }
        this.broadcastService.emitActivePlayerId(this.activePlayerId);
    }

    public hit(): void {
        const activePlayer = this.getActivePlayer();
        activePlayer.hand.push(this.getCardFromTop());
        this.updateActivePlayerScore();

        this.broadcastService.emitPlayers(this.players);

        if (activePlayer.score > 21) {
            this.handlePlayerBusted();
        }
    }

    public stand(): void {
        if (!this.setNextPlayer()) {
            this.dealerPlay();
            return;
        }
        this.updateActivePlayerScore();

        this.broadcastService.emitPlayers(this.players);
        this.broadcastService.emitActivePlayerId(this.activePlayerId);
    }

    private handlePlayerBusted(): void {
        this.setBusted(this.activePlayerId);
        setTimeout(() => {
            this.removePlayerBet(this.activePlayerId);
            this.broadcastService.emitPlayers(this.players);
        }, 500);

        setTimeout(() => {
            if (!this.setNextPlayer()) {
                this.dealerPlay();
            }
            this.broadcastService.emitActivePlayerId(this.activePlayerId);
        }, 1000);
    }

    private dealerPlay(): void {
        this.setActivePlayer('');
        this.updateDealerScore();

        this.broadcastService.emitActivePlayerId(this.activePlayerId);
        this.broadcastService.emitDealer(this.dealer);

        if (this.checkIfAllBusted()) {
            this.resetGame();
            return;
        }

        const dealerInterval = setInterval(() => {
            if (this.dealer.score >= 17) {
                if (this.dealer.score > 21) {
                    this.broadcastService.emitDealer(this.dealer);
                    this.setDealerBusted();

                    this.playersIds.forEach((id) => {
                        this.setPlayerWin(id);
                        this.updateChipsPlayerWon(id);
                    })
                    this.broadcastService.emitPlayers(this.players);
                    return;
                }

                clearInterval(dealerInterval);
                this.checkGameEnd();
                return;
            }
            this.dealerHit();
            this.broadcastService.emitDealer(this.dealer);
        }, 500);
    }

    private checkGameEnd(): void {
        const dealerScore = this.dealer.score;

        this.players.forEach(({ id, score, status }) => {
            if (status === 'busted') {
                this.checkIfBankrupt(id);
                return;
            }

            if (status === 'bankrupt') {
                return;
            }

            if (dealerScore <= 21 && score <= 21) {
                if (dealerScore > score) {
                    this.removePlayerBet(id);
                    this.setPlayerLose(id);
                    this.checkIfBankrupt(id);
                    this.broadcastService.emitPlayers(this.players);
                    return;
                }
                if (score > dealerScore) {
                    this.updateChipsPlayerWon(id);
                    this.setPlayerWin(id);
                    this.broadcastService.emitPlayers(this.players);
                    return;
                }
            }

            if (dealerScore === score) {
                this.updateChipsStandoff(id);
                this.setPlayerStandoff(id);
                this.broadcastService.emitPlayers(this.players);
                return;
            }
        });
        this.resetGame();
    }

    private resetGame(): void {
        let nextGameTimer = 6;
        const countdownTimer = setInterval(() => {
            nextGameTimer -= 1;
            this.broadcastService.emitCountdownTimer(nextGameTimer);
            if (nextGameTimer! <= 0) {
                this.resetPlayers();
                this.resetDealer();
                this.setActivePlayer(this.playersIds[0]);
                this.gameStatus = GameStatus.idle;
                clearInterval(countdownTimer);
                this.broadcastService.emitPlayers(this.players);
                this.broadcastService.emitDealer(this.dealer);
                this.broadcastService.emitActivePlayerId(this.activePlayerId);
                this.broadcastService.emitStatus(this.gameStatus);
            }
        }, 1000);
    }

    private resetPlayers(): void {
        this.players = this.players.map(player => {
            player.hand = [];
            player.bet = [];
            player.score = 0;
            player.status = player.status === 'bankrupt' ? 'bankrupt' : '';
            return player;
        });
    }

    private resetDealer(): void {
        if (this.dealer) {
            this.dealer.hand = [];
            this.dealer.score = 0;
            this.dealer.status = '';
        }
    }

    private updateChipsPlayerWon(playerId: string): void {
        const player = this.getPlayerById(playerId);
        player.bet.forEach(value => {
            player.chips[value] += 2;
        });
    }

    private updateChipsStandoff(playerId: string): void {
        const player = this.getPlayerById(playerId);
        player.bet.forEach(value => {
            player.chips[value] += 1;
        });
    }

    private dealerHit(): void {
        this.dealer.hand.push(this.getCardFromTop());
        this.updateDealerScore();
    }

    private checkIfAllBusted(): boolean {
        return this.players.every(({ status }) => status === 'busted');
    }

    private updateDealerScore(): void {
        this.dealer.score = countScoreInHand(this.dealer.hand);
    }

    private updateActivePlayerScore(): void {
        const activePlayer = this.getActivePlayer();
        activePlayer.score = countScoreInHand(activePlayer.hand);
    }

    private deal(): void {
        const players = this.players.slice(-this.players.length);

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j <= players.length; j++) {
                if (j === players.length) {
                    this.dealer.hand.push(this.getCardFromTop());
                    this.broadcastService.emitDealer(this.dealer);
                } else {
                    if (this.players[j].status !== 'bankrupt') {
                        players[j].hand.push(this.getCardFromTop());
                        players[j].score = countScoreInHand(players[j].hand);
                        this.broadcastService.emitPlayers(this.players);
                    }
                }
            }
        }

        this.players.forEach(player => {
            player.canSplit = this.checkHandForPairs(player);
        });
        this.broadcastService.emitDealer(this.dealer);
        this.broadcastService.emitPlayers(this.players);

        this.setActivePlayer(this.playersIds[0]);
        this.broadcastService.emitActivePlayerId(this.activePlayerId);
    }

    public getCardFromTop(): Card {
        if (this.deck.length <= 10) {
            this.createDeck();
        }
        return this.deck.splice(0, 1)[0];
    }

    // Set the next player as active and return false if it was the last one
    private setNextPlayer(): boolean {
        if (!this.activePlayerId) return false;
        const activePlayerIndex = this.playersIds.indexOf(this.activePlayerId);
        if (activePlayerIndex === this.playersIds.length - 1) {
            return false;
        } else {
            this.activePlayerId = this.playersIds[activePlayerIndex + 1];
            return true;
        }
    }

    protected removePlayerChip(chipValue: ChipsValues): void {
        this.getActivePlayer().chips[chipValue]--;
    }

    private checkIfBankrupt(playerId: string): void {
        const player = this.getPlayerById(playerId);
        const chipsPlayerHas = Object.values(player.chips).filter(value => value);
        if (chipsPlayerHas.length === 0) {
            player.status = 'bankrupt';
            this.playersIds.splice(this.playersIds.indexOf(playerId), 1);
            this.broadcastService.emitPlayersIds(this.playersIds);
        }
    }

    private getActivePlayer(): Player {
        return this.getPlayerById(this.activePlayerId);
    }

    protected getPlayerById(playerId: string): Player {
        return this.players.find(({ id }) => id === playerId);
    }

    private createDeck(): void {
        this.deck = shuffleArray(createDeck());
    }

    private setBusted(playerId: string): void {
        this.getPlayerById(playerId).status = 'busted';
    }

    private removePlayerBet(playerId: string): void {
        this.getPlayerById(playerId).bet = [];
    }

    private setPlayerWin(playerId: string): void {
        this.getPlayerById(playerId).status = 'win';
    }

    private setPlayerLose(playerId: string): void {
        this.getPlayerById(playerId).status = 'lose';
    }

    private setPlayerStandoff(playerId: string): void {
        this.getPlayerById(playerId).status = 'standoff';
    }

    private setDealerBusted(): void {
        this.dealer.status = 'busted';
    }
}

class GameStateIdle extends GameState {

    public setBet(playerId: string, chipValue: ChipsValues): void {
        if (playerId !== this.activePlayerId) return;
        const player = this.getPlayerById(playerId);

        if (player?.chips[chipValue] === 0) return;

        player.bet.push(chipValue);

        this.removePlayerChip(chipValue);

        this.broadcastService.emitPlayers(this.players);
    }

}

class GameStateOver extends GameState {}