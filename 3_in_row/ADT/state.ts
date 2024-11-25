

export abstract class State {

    constructor() {}

    // public abstract setGameState(gameState: State): void
}

export abstract class StateIdle extends State {

    // предусловия: сгенерировано игровое поле, есть потенциальные ходы
    // постусловия: осуществлен ход игрока. Состояние игры переведено в GameStateMove
    public abstract makeMove(inputData: any): StateMove
}

export abstract class StateMove extends State {

    // постусловия: осуществлен поиск выигрышных комбинаций на поле
    public abstract searchSequences(): void

    // предусловие: найдены выигрышные комбинации
    // постусловие: обновлена статистика игрока. Состояние игры переведено в GameStateIdle
    public abstract updatePlayerStatistics(numberOfSequences: number): void
}