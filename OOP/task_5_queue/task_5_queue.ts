import {DynamicArray} from "../task_4_dynamic_array/task_4_dynamic_array";

abstract class QueueSpec<T> {

    // конструктор
    // постусловие: создана пустая очередь
    constructor() {
    }

    // команды
    // постусловие: в хвост очереди добавлен новый элемент
    public abstract enqueue(value: T): void

    // предусловие: очередь не пуста
    // постусловие: из головы очереди удален элемент
    public abstract dequeue(): void

    // запросы
    // постусловие: возвращает текущий размер очереди
    public abstract size(): number

    // предусловие: очередь не пуста
    // постусловие: получить элемент из головы очереди
    public abstract get(): T

    // запросы статусов
    public abstract get_dequeue_status(): number;

    public abstract get_get_status(): number;
}

export class Queue<T> implements QueueSpec<T> {
    private DEQUEUE_NIL = 0 // dequeue() еще не вызывался
    private DEQUEUE_OK = 1 // последний dequeue() отработал успешно
    private DEQUEUE_ERR = 2 // очередь пуста
    private GET_NIL = 0 // get() еще не вызывался
    private GET_OK = 1 // последний get() отработал успешно
    private GET_ERR = 2// очередь пуста

    private queue: DynamicArray<T> = new DynamicArray<T>();

    private dequeue_status = this.DEQUEUE_NIL
    private get_status = this.GET_NIL

    dequeue(): void {
        if (this.size() > 0) {
            this.dequeue_status = this.DEQUEUE_OK
            this.queue.remove(0)
        } else {
            this.dequeue_status = this.DEQUEUE_ERR
        }
    }

    enqueue(value: T): void {
        this.queue.append(value);
    }

    size(): number {
        return this.queue.size()
    }

    get(): T {
        if (this.size() > 0) {
            this.get_status = this.GET_OK;
            return this.queue.get_item(0);
        } else {
            this.get_status = this.GET_ERR;
        }
    }

    get_dequeue_status(): number {
        return this.dequeue_status
    }

    get_get_status(): number {
        return this.get_status
    }
}
