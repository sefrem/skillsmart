const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

type Coordinates = [number, number];

function searchSequence(sequence: string, rowNumber: number, length: number, isCol?: boolean): number[][] {
    const pattern = new RegExp(`(.)\\1{${length-1}}`, 'g'); // matches exactly three consecutive identical characters

    return Array.from(sequence.matchAll(pattern)).flatMap(match => {
        const start = match.index;
        const end = start + match[0].length - 1;
        return isCol ? [[start, rowNumber], [end, rowNumber]] : [[rowNumber, start], [rowNumber, end]];
    })
}

function getRandomCharacter() {
    const characters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const rand = Math.floor(Math.random() * characters.length);
    return characters[rand];
}

abstract class Tuple<T> {

    // конструктор
    // постусловие: создан новый кортеж с 2 элементами
    constructor(first: T, second: T) {
    }

    // запросы

    // постусловие: возвращает первый элемент кортежа
    public abstract get first(): T

    // постусловие: возвращает второй элемент кортежа
    public abstract get second(): T
}

class CoordinatesTuple implements Tuple<Coordinates> {
    private store: Coordinates[] = [];

    constructor(first: Coordinates, second: Coordinates) {
        this.store[0] = first;
        this.store[1] = second;
    }

    get first(): Coordinates {
        return this.store[0];
    }

    get second(): Coordinates {
        return this.store[1];
    }
}

abstract class Matrix<T> {

    // конструктор
    // постусловие: создана новая пустая матрица нужного размера
    constructor(width: number, height: number) {
    }

    // команды

    // предусловие: матрица не пустая
    // постусловие: из матрицы удален элемент по заданным координатам
    public abstract remove(coordinates: Coordinates): void

    // предусловие: матрица не пустая
    // постусловие: выполнена итерация по всем ячейкам матрицы, для каждой применено переданное действие
    public abstract iterate(action: (value: string, coords: Coordinates) => void): void

    // предусловие: матрица не пустая
    // постусловие: в ячейку по переданным координатам вставлено значение
    public abstract insert(coordinates: Coordinates, value: T): void

    // запросы
    // предусловие: матрица не пустая
    // постусловие: возвращено значение элемента по переданным координатам
    public abstract getValue(coordinates: Coordinates): T

    // постусловие: возвращает массив рядов матрицы в виде строк
    public abstract getRows(): T[]

    // постусловие: возвращает массив столбцов матрицы в виде строк
    public abstract getCols(): T[]
}

class GameMatrix implements Matrix<string> {
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

abstract class Field {

    // постусловие: создано игровое поле нужного размера, заполненное случайными элементами
    constructor(width: number, height: number) {
    }

    // команды

    // постусловие: из поля удалена последовательность элементов по переданным координатам (переданы координаты
    // первого и последнего элементов)
    public abstract removeSequence(coordinates: Tuple<Coordinates>): void

    // постусловие: 2 элемента поля по переданным координатам переставлены местами
    public abstract switchElements(coordinates: Tuple<Coordinates>): void

    // постусловие: в поле добавлен элемент по переданным координатам
    public abstract addElement(coordinates: Coordinates, value: string): void

    // запросы

    // постусловие: возвращается массив массивов координат первого и последнего элемента последовательности
    // одинаковых элементов нужной длины. Первый элемент - массив координатов в рядах, второй - в колоннах
    public abstract searchSequence(length: number): Tuple<Coordinates>[][]
}

class GameField implements Field {
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

abstract class Rules {

    // принимает как параметры размеры поля
    constructor(width: number, height: number) {
    }

    // команды:

    // постусловия: проверяет валидны ли входные данные
    public abstract isInputValid(input: string): boolean

    // постусловия: проверяет валиден ли ход игрока
    public abstract isMoveValid(coordinates: Tuple<Coordinates>): boolean

    // запросы

    // постусловия: возвращает количество очков, начисляемых игроку за успешную комбинацию
    public abstract getPointsPerMove(): number
}

abstract class Statistics {

    // команды

    // постусловия: игроку добавлены очки за успешную комбинацию
    public abstract addPoints(points: number): void

    // постусловие: в список ходов игрока добавлен еще один
    public abstract addMove(move: Tuple<Coordinates>): void
}


abstract class Input {

    // предусловия: как параметр принят метод, принимающий ход пользователя в виде кортежа
    // постусловия: создан класс, работающий с инпутом из консоли
    constructor(setMove: (move: Tuple<Coordinates>) => void) {
    }

    // постусловие: выполняет команду пользователя, если переданная строка соответствует одной из команд,
    // или создает ход
    public abstract waitForInput(): void

    // постусловие: создает ход и вызывает метод setMove, передавая ему ход как аргумент
    public abstract createMove(inputData: any): void
}


abstract class Output {

    // постусловие: в консоль выведено игровое поле
    public abstract showField(): void

    // постусловие: в консоль выведено количество очков игрока
    public abstract showPoints(): void

    // постусловие: в консоль выведено сообщение о невалидном ходе
    public abstract invalidMove(): void
}


abstract class State {

    constructor() {
    }
}

abstract class StateIdle extends State {

    // предусловия: сгенерировано игровое поле, есть потенциальные ходы
    // постусловия: осуществлен ход игрока. Состояние игры переведено в GameStateMove
    public abstract makeMove(inputData: any): StateMove
}

abstract class StateMove extends State {

    // постусловия: осуществлен поиск выигрышных комбинаций на поле
    public abstract searchSequences(): void

    // предусловие: найдены выигрышные комбинации
    // постусловие: обновлена статистика игрока. Состояние игры переведено в GameStateIdle
    public abstract updatePlayerStatistics(numberOfSequences: number): void
}


class Game {
    gameState: StateIdle | StateMove;
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
        this.gameState = new GameStateIdle(this.setState.bind(this), this.gameField, this.gameStatistics, this.gameOutput, this.gameRules);
    }

    setState(gameState: any): void {
        this.gameState = gameState;
    }

}

class GameStateMove implements StateMove {
    constructor(private setGameState: (gameState: State) => void,
                private gameField: GameField,
                private gameStatistics: GameStatistics,
                private gameOutput: GameOutput,
                private gameRules: GameRules
    ) {
        this.searchSequences();
    }

    searchSequences(): void {
        const sequences = this.gameField.searchSequence(3);
        this.gameField.removeSequences(sequences);
        this.gameOutput.showField();
        this.gameField.fillSequences(sequences);
        this.gameOutput.showField();

        this.updatePlayerStatistics(sequences[0].length + sequences[1].length)
        this.setGameState(new GameStateIdle(this.setGameState, this.gameField, this.gameStatistics, this.gameOutput, this.gameRules))
    }

    updatePlayerStatistics(numberOfSequences: number): void {
        this.gameStatistics.addPoints(numberOfSequences);
        this.gameOutput.showPoints()
    }
}


class GameStateIdle implements StateIdle {
    private userInput: UserInput;

    constructor(private setGameState: (gameState: State) => void,
                private gameField: GameField,
                private gameStatistics: GameStatistics,
                private gameOutput: GameOutput,
                private gameRules: GameRules,
    ) {
        this.userInput = new UserInput(this.makeMove.bind(this), this.gameRules, this.gameOutput);
        this.userInput.waitForInput();
    }

    makeMove(inputData: Tuple<Coordinates>): StateMove | any {
        this.gameField.switchElements(inputData);
        this.gameOutput.showField();
        this.gameStatistics.addMove(inputData);
        this.setGameState(new GameStateMove(this.setGameState, this.gameField, this.gameStatistics, this.gameOutput, this.gameRules))
    }
}

class UserInput implements Input {
    constructor(private setMove: (inputData: Tuple<Coordinates>) => void,
                private gameRules: GameRules,
                private gameOutput: GameOutput) {
    }

    createMove(inputData: any): void {
        if (!this.gameRules.isInputValid(inputData)) {
            this.gameOutput.invalidMove()
            this.waitForInput();
            return;
        }
        const [first, second] = inputData.split(',');
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
}

class GameOutput implements Output {
    constructor(private gameField: GameField, private gameStatistics: GameStatistics) {
    }

    showField(): void {
        console.log(this.gameField.fieldView)
    }

    showPoints(): void {
        console.log("Player's points ", this.gameStatistics.playerPoints)
    }

    invalidMove(): void {
        console.log('The move is invalid. Please make a new move')
    }

}

class GameStatistics implements Statistics {
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

class GameRules implements Rules {

    constructor(private width: number, private height: number) {
    }

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

const game = new Game();