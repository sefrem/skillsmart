
type Coordinates = [number, number];

abstract class Matrix<T> {

    // конструктор
    // постусловие: создана новая пустая матрица нужного размера
    constructor(width: number, height: number) {}

    // команды

    // предусловие: матрица не пустая
    // постусловие: из матрицы удален элемент по заданным координатам
    public abstract remove(coordinates: Coordinates): void

    // предусловие: матрица не пустая
    // постусловие: выполнена итерация по всем ячейкам матрицы, для каждой применено переданное действие
    public abstract iterate(action: Function): void

    // предусловие: матрица не пустая
    // постусловие: в ячейку по переданным координатам вставлено значение
    public abstract insert(coordinates: Coordinates, value: T): void

    // запросы
    // предусловие: матрица не пустая
    // постусловие: возвращено значение элемента по переданным координатам

    public abstract getValue(coordinates: Coordinates): T
}

abstract class Tuple<T> {

    // конструктор
    // постусловие: создан новый кортеж с 2 элементами
    constructor(first: T, second:T) {}

    // запросы

    // постусловие: возвращает первый элемент кортежа
    public abstract get first(): T

    // постусловие: возвращает второй элемент кортежа
    public abstract get second(): T
}

abstract class Field {

    // постусловие: создано игровое поле нужного размера, заполненное случайными элементами
    constructor(width: number, height: number) {}

    // команды

    // постусловие: из поля удалена последовательность элементов по переданным координатам (переданы координаты
    // первого и последнего элементов)
    public abstract removeSequence(coordinates: Tuple<Coordinates>): void

    // постусловие: 2 элемента поля по переданным координатам переставлены местами
    public abstract switchElements(coordinates: Tuple<Coordinates>): void

    // предусловие: из поля были удалены элементы
    // постусловие: в поле добавлены элементы на место удаленных
    public abstract addElements(coordinates: Tuple<Coordinates>[]): void

    // запросы

    // постусловие: возвращается массив координат первого и последнего элемента последовательности
    // одинаковых элементов нужной длины
    public abstract searchSequence(length: number): Tuple<Coordinates>[]
}

abstract class Rules {

    constructor() {}

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
    public abstract addMove(move: Tuple<Coordinates>)
}


abstract class Input {

    // постусловия: создан класс, работающий с инпутом из консоли
    constructor() {}


    // постусловие: возвращает кортеж с координатами
    public abstract createMove(inputData: any): Tuple<Coordinates>
}


abstract class Output {

    // постусловие: в консоль выведено игровое поле
    public abstract showField()
}

