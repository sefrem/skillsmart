

export abstract class Tuple<T> {
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