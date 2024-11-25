import {StateIdle, StateMove} from "../ADT/state";
import {Tuple} from "../ADT/tuple";
import {Coordinates} from "../ADT/types";
import {GameField} from "./gameFIeld";
import {GameStatistics} from "./gameStatistics";
import {GameOutput} from "./gameOutput";
import {GameRules} from "./gameRules";
import {GameStateIdle, GameStateMove} from "./gameStates";

export class Game {
    private gameState: StateIdle | StateMove;
    private gameField: GameField;
    private gameStatistics: GameStatistics;
    private gameOutput: GameOutput;
    private gameRules: GameRules;

    constructor() {
        this.gameField = new GameField(5, 5);
        this.gameStatistics = new GameStatistics();
        this.gameOutput = new GameOutput(this.gameField, this.gameStatistics);
        this.gameRules = new GameRules(5, 5)
        this.gameOutput.showField();
        this.gameState = new GameStateIdle(this);
    }

    setState(gameState: 'idle' | 'move'): void {
        if (gameState === 'idle') {
            this.gameState = new GameStateIdle(this);
        }
        if (gameState === 'move') {
            this.gameState = new GameStateMove(this);
        }
    }

    searchSequence(length: number): Tuple<Coordinates>[][] {
        return this.gameField.searchSequence(length);
    }

    removeSequences(sequences: Tuple<Coordinates>[][]): void {
        this.gameField.removeSequences(sequences);
    }

    fillSequences(sequences: Tuple<Coordinates>[][]): void {
        this.gameField.fillSequences(sequences);
    }

    showField(): void {
        this.gameOutput.showField();
    }

    addPoints(numberOfSequences: number): void {
        this.gameStatistics.addPoints(numberOfSequences);
    }

    showPoints(): void {
        this.gameOutput.showPoints();
    }

    switchElements(inputData: Tuple<Coordinates>): void {
        this.gameField.switchElements(inputData);
    }

    addMove(inputData: Tuple<Coordinates>): void {
        this.gameStatistics.addMove(inputData);
    }

    get rules(): GameRules {
        return this.gameRules
    }

    get output(): GameOutput {
        return this.gameOutput
    }

}
