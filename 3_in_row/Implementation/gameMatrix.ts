import {Matrix} from "../ADT/matrix";
import {Coordinates} from "../ADT/types";

export class GameMatrix implements Matrix<string> {
    private matrix: string[][];

    constructor(width: number, height: number) {
        this.matrix = Array.from(Array(height), () => new Array(width).fill(''));
    }

    getRows(): string[] {
        return this.matrix.map(row => row.join(''))
    }

    getCols(): string[] {
        let cols: string[] = []

        for (let i = 0; i < this.matrix[0].length; i++) {
            let row = [];
            for (let j = 0; j < this.matrix.length; j++) {
                row.push(this.getValue([j, i]))
            }
            cols[i] = row.join('')
        }
        return cols
    }

    getValue(coordinates: Coordinates): string {
        const [row, col] = coordinates;
        return this.matrix[row][col];
    }

    insert(coordinates: Coordinates, value: string): void {
        const [row, col] = coordinates;
        this.matrix[row][col] = value;
    }

    iterate(action: (value: string, coords: Coordinates) => void): void {
        this.matrix.forEach((row, rowIndex) => row.forEach((value, colIndex) => action(value, [rowIndex, colIndex])))
    }

    remove(coordinates: Coordinates): void {
        const [row, col] = coordinates;
        this.matrix[row][col] = '';
    }

    get fieldView(): string[][] {
        return this.matrix
    }
}
