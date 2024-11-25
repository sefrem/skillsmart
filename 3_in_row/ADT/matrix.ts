import {Coordinates} from "./types";


export abstract class Matrix<T> {

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