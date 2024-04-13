import {DynamicArray} from "../task_4_dynamic_array/task_4_dynamic_array";

abstract class ParentQueueSpec<T> {

    // конструктор
    // постусловие: создана пустая очередь
    constructor() {
    }

    // команды
    // постусловие: в хвост очереди добавлен новый элемент
    public abstract addTail(value: T): void

    // предусловие: очередь не пуста
    // постусловие: из головы очереди удален элемент
    public abstract removeFront(): void

    // запросы
    // постусловие: возвращает текущий размер очереди
    public abstract size(): number

    // предусловие: очередь не пуста
    // постусловие: получить элемент из головы очереди
    public abstract get(): T

    // запросы статусов
    public abstract get_remove_front_status(): number;

    public abstract get_get_status(): number;
}

abstract class QueueSpec<T> extends ParentQueueSpec<T> {
}


abstract class DequeueSpec<T> extends ParentQueueSpec<T> {

    // конструктор
    // поустусловие: создана новая пустая очередь
    constructor() {
        super();
    }

    // команды
    // постусловие: в голову очереди добавлен новый элемент
    public abstract addFront(value: T): void;

    // предусловие: очередь не пуста
    // постусловие: из хвоста очереди удален элемент
    public abstract removeTail(): void

    // запросы статусов
    public abstract get_remove_tail_status(): number
}


class Dequeue<T> implements DequeueSpec<T> {
    private REMOVE_FRONT_NIL = 0 // removeFront() еще не вызывался
    private REMOVE_FRONT_OK = 1 // последний removeFront() отработал успешно
    private REMOVE_FRONT_ERR = 2 // очередь пуста
    private REMOVE_TAIL_NIL = 0 // removeTail() еще не вызывался
    private REMOVE_TAIL_OK = 1 // последний removeTail() отработал успешно
    private REMOVE_TAIL_ERR = 2 // очередь пуста
    private GET_NIL = 0 // get() еще не вызывался
    private GET_OK = 1 // последний get() отработал успешно
    private GET_ERR = 2// очередь пуста

    private queue: DynamicArray<T> = new DynamicArray<T>();

    private remove_front_status = this.REMOVE_FRONT_NIL
    private remove_tail_status = this.REMOVE_TAIL_NIL
    private get_status = this.GET_NIL

    addFront(value: T): void {
        this.queue.insert(value, 0)
    }

    removeFront(): void {
        if (this.size() > 0) {
            this.remove_front_status = this.REMOVE_FRONT_OK
            this.queue.remove(0)
        } else {
            this.remove_front_status = this.REMOVE_FRONT_ERR
        }
    }

    addTail(value: T): void {
        this.queue.append(value);
    }

    removeTail(): void {
        if (this.size() > 0) {
            this.remove_tail_status = this.REMOVE_TAIL_OK;
            this.queue.remove(this.queue.size() - 1)
        } else {
            this.remove_tail_status = this.REMOVE_TAIL_ERR;
        }
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

    get_remove_front_status(): number {
        return this.remove_front_status;
    }

    get_remove_tail_status(): number {
        return this.remove_tail_status;
    }

    get_get_status(): number {
        return this.get_status;
    }
}
