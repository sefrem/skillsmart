import {Rules} from "../ADT/rules";
import {Tuple} from "../ADT/tuple";
import {Coordinates} from "../ADT/types";

export class GameRules implements Rules {
    constructor(private width: number, private height: number) {}

    getPointsPerMove(): number {
        return 0;
    }

    isInputValid(input: string): boolean {
        const [first, second] = input.split(',');
        return !(isNaN(Number(first)) || isNaN(Number(second)));
    }

    isMoveValid(coordinates: Tuple<Coordinates>): boolean {
        const [start1, end1] = coordinates.first;
        const [start2, end2] = coordinates.second;
        if (start1 >= this.width || start2 >= this.width) {
            return false
        }
        if (end1 >= this.height || end2 >= this.height) {
            return false
        }

        return true;
    }
}