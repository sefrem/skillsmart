import {Tuple} from "./tuple";
import {Coordinates} from "./types";

export abstract class Field {

    // постусловие: создано игровое поле нужного размера, заполненное случайными элементами
    constructor(width: number, height: number) {}

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
