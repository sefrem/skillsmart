import {Output} from "../ADT/output";
import {GameField} from "./gameFIeld";
import {GameStatistics} from "./gameStatistics";

export class GameOutput implements Output {
    constructor(private gameField: GameField, private gameStatistics: GameStatistics) {}

    showField(): void {
        const letters = ['A', 'B', 'C', 'D', 'E'];
        const output = this.gameField.fieldView.map(row => row.reduce((acc, val, index) => ({
            ...acc,
            [letters[index]]: val
        }), {} as any))
        console.table(output);
    }

    showPoints(): void {
        console.log("Player's points ", this.gameStatistics.playerPoints)
    }

    invalidMove(): void {
        console.log('The move is invalid. Please make a new move')
    }
}