import {Tuple} from "./tuple";
import {Coordinates} from "./types";

export abstract class Input {

    // предусловия: как параметр принят метод, принимающий ход пользователя в виде кортежа
    // постусловия: создан класс, работающий с инпутом из консоли
    constructor(setMove: (move: Tuple<Coordinates>) => void) {
    }

    // постусловие: выполняет команду пользователя, если переданная строка соответствует одной из команд,
    // или создает ход
    public abstract waitForInput(): void

    // постусловие: создает ход и вызывает метод setMove, передавая ему ход как аргумент
    public abstract createMove(inputData: any): void
}
