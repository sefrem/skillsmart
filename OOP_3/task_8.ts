const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

type Coordinates = [number, number];

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
    matrix: string[][];

    constructor(width: number, height: number) {
        this.matrix = Array.from(Array(height), () => new Array(width).fill(''));
    }

    getRows(): string[] {
        return this.matrix.map(row => row.join(''))
    }

    getCols(): string[] {
        let cols: string[] = []

        for (let i=0; i < this.matrix[0].length; i++) {
            let row = [];
            for (let j = 0; j < this.matrix.length; j++) {
                row.push(this.getValue([i, j]))
            }
            cols[i] = row.join('')
        }
        return cols
    }

    getValue(coordinates: Coordinates): string {
        const [col, row] = coordinates;
        return this.matrix[row][col];
    }

    insert(coordinates: Coordinates, value: string): void {
        const [col, row] = coordinates;
        this.matrix[row][col] = value;
    }

    iterate(action: (value: string, coords: Coordinates) => void): void {
        this.matrix.forEach((row, rowIndex) => row.forEach((value, colIndex) => action(value, [colIndex, rowIndex])))
    }

    remove(coordinates: Coordinates): void {
        const [col, row] = coordinates;
        this.matrix[row][col] = '';
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

function getRandomCharacter() {
    const characters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const rand = Math.floor(Math.random() * characters.length);
    return characters[rand];
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
    }

    searchSequence(length: number): Tuple<Coordinates>[][] {

        function searchSequence(sequence: string, rowNumber: number): number[][] {
            const pattern = /(.)\1{2}/g; // matches exactly three consecutive identical characters

            const matches = Array.from(sequence.matchAll(pattern)).flatMap(match => {
                const start = match.index;
                const end = start + match[0].length - 1;
                return [[rowNumber, start], [rowNumber, end]];
            })
            return matches
        }

        const matchesRow = this.field.getRows().flatMap((row, index) => {
           return  searchSequence(row, index).filter((value, index, array) => array.length > 0)
        });
        const matchesCol = this.field.getCols().flatMap((col, index) => {
            return  searchSequence(col, index).filter((value, index, array) => array.length > 0)
        })

        const result: Tuple<Coordinates>[][]  = [[],[]]
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
}

const gam = new GameField(5, 6);
gam.searchSequence(3)

abstract class Rules {

    constructor() {
    }

    // команды:

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
    public abstract updatePlayerStatistics(): void
}


class Game {
    private gameState: StateIdle | StateMove;

    // private gameField: Field

    constructor() {
        this.gameState = new GameStateIdle(this.setState.bind(this));
        // this.gameField = new Field()
    }

    setState(gameState: any): void {
        this.gameState = gameState;
    }

}

class GameStateMove implements StateMove {
    constructor(private move: Tuple<Coordinates>) {
        console.log('GameStateMove', this.move)
    }

    searchSequences(): void {
    }

    updatePlayerStatistics(): void {
    }
}


class GameStateIdle implements StateIdle {
    private userInput: UserInput;

    constructor(private setGameState: (gameState: GameStateMove) => void) {
        this.userInput = new UserInput(this.makeMove.bind(this));
        this.userInput.waitForInput();
    }


    makeMove(inputData: Tuple<Coordinates>): StateMove | any {
        this.setGameState(new GameStateMove(inputData))
    }
}

class UserInput implements Input {

    constructor(private setMove: (inputData: Tuple<Coordinates>) => void) {
    }

    createMove(inputData: any): void {
        const [first, second] = inputData.split(',');
        const firstElement: Coordinates = [Number(first[0]), Number(first[1])]
        const secondElement: Coordinates = [Number(second[0]), Number(second[1])]
        this.setMove(new CoordinatesTuple(firstElement, secondElement))
    }

    waitForInput(): void {
        const createMove = this.createMove.bind(this)
        rl.question("Your move ", function (move: any) {
            if (move.trim() === 'exit') {
                process.exit(0)
            } else {
                createMove(move);
                process.exit(0);
            }
        });
    }
}
