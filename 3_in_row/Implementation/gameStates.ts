import {StateIdle, StateMove} from "../ADT/state";
import {Tuple} from "../ADT/tuple";
import {Coordinates} from "../ADT/types";
import {Game} from "./game";
import {UserInput} from "./userInput";

export class GameStateMove implements StateMove {
    constructor(private game: Game) {
        this.searchSequences();
    }

    searchSequences(): void {
        const sequences = this.game.searchSequence(3);
        this.game.removeSequences(sequences);
        this.game.showField();
        this.game.fillSequences(sequences);
        this.game.showField();

        this.updatePlayerStatistics(sequences[0].length + sequences[1].length)
        this.game.setState('idle')
    }

    updatePlayerStatistics(numberOfSequences: number): void {
        this.game.addPoints(numberOfSequences);
        this.game.showPoints();
    }
}

export class GameStateIdle implements StateIdle {
    private userInput: UserInput;

    constructor(private game: Game) {
        this.userInput = new UserInput(this.makeMove.bind(this), this.game.rules, this.game.output);
        this.userInput.waitForInput();
    }

    makeMove(inputData: Tuple<Coordinates>): StateMove | any {
        this.game.switchElements(inputData);
        this.game.showField();
        this.game.addMove(inputData);
        this.game.setState('move')
    }
}