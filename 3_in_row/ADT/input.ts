
export abstract class Input {

    // постусловие: выполняет команду пользователя, если переданная строка соответствует одной из команд,
    // или создает ход
    public abstract waitForInput(): void

    // постусловие: создает ход и вызывает метод setMove, передавая ему ход как аргумент
    public abstract createMove(inputData: any): void
}
