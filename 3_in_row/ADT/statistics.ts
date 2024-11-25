import {Tuple} from "./tuple";
import {Coordinates} from "./types";


export abstract class Statistics {

    // команды

    // постусловия: игроку добавлены очки за успешную комбинацию
    public abstract addPoints(points: number): void

    // постусловие: в список ходов игрока добавлен еще один
    public abstract addMove(move: Tuple<Coordinates>): void
}
