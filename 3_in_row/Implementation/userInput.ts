import {Input} from "../ADT/input";
import {Tuple} from "../ADT/tuple";
import {Coordinates} from "../ADT/types";
import {GameRules} from "./gameRules";
import {GameOutput} from "./gameOutput";
import {CoordinatesTuple} from "./coordinatesTuple";

const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export class UserInput implements Input {
    constructor(private setMove: (inputData: Tuple<Coordinates>) => void,
                private gameRules: GameRules,
                private gameOutput: GameOutput) {
    }

    createMove(inputData: any): void {
        const input = this.transformInput(inputData);
        if (!this.gameRules.isInputValid(input)) {
            this.gameOutput.invalidMove()
            this.waitForInput();
            return;
        }
        const [first, second] = input.split(',');
        const firstElement: Coordinates = [Number(first[0]), Number(first[1])]
        const secondElement: Coordinates = [Number(second[0]), Number(second[1])];
        const move = new CoordinatesTuple(firstElement, secondElement);
        if (!this.gameRules.isMoveValid(move)) {
            this.gameOutput.invalidMove()
            this.waitForInput();
            return;
        }
        this.setMove(move)
    }

    waitForInput(): void {
        const createMove = this.createMove.bind(this)
        rl.question("Your move ", function (move: any) {
            if (move.trim() === 'exit') {
                process.exit(0)
            } else {
                createMove(move);
            }
        });
    }

    transformInput(inputData: string): string {
        const coordMap: Record<string, number> = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4};
        const [first, second] = inputData.split(',');
        const str1 = (first[1] + coordMap[first[0]]);
        const str2 = (second[1] + coordMap[second[0]]);
        return `${str1},${str2}`
    }
}
