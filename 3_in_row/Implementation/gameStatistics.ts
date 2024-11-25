import {Statistics} from "../ADT/statistics";
import {Tuple} from "../ADT/tuple";
import {Coordinates} from "../ADT/types";

export class GameStatistics implements Statistics {
    private moves: Tuple<Coordinates>[] = [];
    private points: number = 0;

    addMove(move: Tuple<Coordinates>): void {
        this.moves.push(move);
    }

    addPoints(numberOfSequences: number): void {
        this.points += numberOfSequences;
    }

    get playerPoints(): number {
        return this.points
    }
}
