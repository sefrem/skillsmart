import {DynamicArray} from "../task_4_dynamic_array/task_4_dynamic_array";

abstract class QueueSpec<T> {

  // конструктор
  // постусловие: создана пустая очередь
  constructor() {
  }

  // команды
  // постусловие: в хвост очереди добавлен новый элемент
  public abstract enqueue(value: T): void

  // постусловие: из головы очереди извлечен элемент
  public abstract dequeue(): T

  // запросы
  // поустусловие: возвращает текущий размер очереди
  public abstract size(): number
}

export class Queue<T> implements QueueSpec<T> {
  private queue: DynamicArray<T> = new DynamicArray<T>()

  dequeue(): T {
    const item = this.queue.get_item(this.queue.size() - 1)
    this.queue.remove(this.queue.size() - 1)
    return item;
  }

  enqueue(value: T): void {
    this.queue.insert(value, 0);
  }

  size(): number {
    return this.queue.size()
  }


}
