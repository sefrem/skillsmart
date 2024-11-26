import {Tuple} from "./tuple";
import {Coordinates} from "./types";

export abstract class Rules {

    // принимает как параметры размеры поля
    constructor(width: number, height: number) {}

    // команды:

    // постусловия: проверяет валидны ли входные данные
    public abstract isInputValid(input: string): boolean

    // постусловия: проверяет валиден ли ход игрока
    public abstract isMoveValid(coordinates: Tuple<Coordinates>): boolean

    // запросы

    // постусловия: возвращает количество очков, начисляемых игроку за успешную комбинацию
    public abstract getPointsPerMove(): number
}
