import {Field} from "../ADT/field";
import {Coordinates} from "../ADT/types";
import {Tuple} from "../ADT/tuple";
import {GameMatrix} from "./gameMatrix";
import {CoordinatesTuple} from "./coordinatesTuple";

function getRandomCharacter() {
    const characters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const rand = Math.floor(Math.random() * characters.length);
    return characters[rand];
}

function searchSequence(sequence: string, rowNumber: number, length: number, isCol?: boolean): number[][] {
    const pattern = new RegExp(`(.)\\1{${length-1}}`, 'g'); // matches exactly three consecutive identical characters

    return Array.from(sequence.matchAll(pattern)).flatMap(match => {
        const start = match.index;
        const end = start + match[0].length - 1;
        return isCol ? [[start, rowNumber], [end, rowNumber]] : [[rowNumber, start], [rowNumber, end]];
    })
}

export class GameField implements Field {
    private field: GameMatrix;

    constructor(width: number, height: number) {
        this.field = new GameMatrix(width, height);
        this.field.iterate((_, coords) => this.addElement(coords, getRandomCharacter())
        )
    }

    addElement(coordinates: Coordinates, value: string): void {
        this.field.insert(coordinates, value);
    }

    removeSequence(coordinates: Tuple<Coordinates>): void {
        const start: Coordinates = [...coordinates.first];
        const end: Coordinates = [...coordinates.second];
        if (start[0] === end[0]) {
            // means we are removing the horizontal sequence
            while (start[1] < end[1]) {
                this.field.remove(start);
                start[1] += 1;
            }
            this.field.remove(end)
        }
        if (start[1] === end[1]) {
            // means we are removing the vertical sequence
            while (start[0] < end[0]) {
                this.field.remove(start);
                start[0] += 1;
            }
            this.field.remove(end)
        }
    }

    fillSequence(coordinates: Tuple<Coordinates>): void {
        const start: Coordinates = [...coordinates.first];
        const end: Coordinates = [...coordinates.second];
        if (start[0] === end[0]) {
            // means we are removing the horizontal sequence
            while (start[1] < end[1]) {
                this.field.insert(start, getRandomCharacter());
                start[1] += 1;
            }
            this.field.insert(end, getRandomCharacter())
        }
        if (start[1] === end[1]) {
            // means we are removing the vertical sequence
            while (start[0] < end[0]) {
                this.field.insert(start, getRandomCharacter());
                start[0] += 1;
            }
            this.field.insert(end, getRandomCharacter())
        }
    }

    removeSequences(sequences: Tuple<Coordinates>[][]): void {
        const [rowSequences, colSequences] = sequences;
        rowSequences.forEach(coord => this.removeSequence(coord))
        colSequences.forEach(coord => this.removeSequence(coord))
    }

    fillSequences(sequences: Tuple<Coordinates>[][]): void {
        const [rowSequences, colSequences] = sequences;
        rowSequences.forEach(coord => this.fillSequence(coord))
        colSequences.forEach(coord => this.fillSequence(coord))
    }

    searchSequence(length: number): Tuple<Coordinates>[][] {
        const matchesRow = this.field.getRows().flatMap((row, index) => {
            return searchSequence(row, index, length).filter((value, index, array) => array.length > 0)
        });
        const matchesCol = this.field.getCols().flatMap((col, index) => {
            return searchSequence(col, index, length, true).filter((value, index, array) => array.length > 0)
        })
        const result: Tuple<Coordinates>[][] = [[], []]
        while (matchesRow.length) {
            const [first, second] = matchesRow.splice(0, 2);
            result[0].push(new CoordinatesTuple(first as Coordinates, second as Coordinates))
        }
        while (matchesCol.length) {
            const [first, second] = matchesCol.splice(0, 2);
            result[1].push(new CoordinatesTuple(first as Coordinates, second as Coordinates))
        }

        return result;
    }

    switchElements(coordinates: Tuple<Coordinates>): void {
        const valueA = this.field.getValue(coordinates.first);
        const valueB = this.field.getValue(coordinates.second);
        this.field.insert(coordinates.first, valueB);
        this.field.insert(coordinates.second, valueA);
    }

    get fieldView() {
        return this.field.fieldView
    }
}
