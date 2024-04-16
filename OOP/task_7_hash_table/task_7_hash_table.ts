import {DynamicArray} from "../task_4_dynamic_array/task_4_dynamic_array";

abstract class HashTableSpec<T> {

  // конструктор
  // постусловие: создает новую пустую хэш-таблицу указанного размера
  constructor() {
  }

  // команды
  // постусловие: значение помещено в подходящий свободный слот
  abstract put(value: T): void

  // запросы
  // постусловие: по значению вычисляет индекс слота
  abstract hash_fun(value: T): number

  // постусловие: возвращает подходящий свободный слот или заканивается неудачей, если это невозможно
  public abstract seek_slot(value: T): number

  // постусловие: возвращает слот или признак неудачи, если элемент не найден
  public abstract find(value: T): number

  // постусловие: возвращает размер таблицы
  public abstract size(): number
}


export class HashTable<T> implements HashTableSpec<T> {
  private table: DynamicArray<T>;
  private step = 3;
  private capacity = 15;

  constructor() {
    this.table = new DynamicArray<T>(this.capacity);
  }

  find(value: T): number {
    return this.table.find(value)
  }

  hash_fun(value: T): number {
    return value.toString().split('').reduce((acc, _, index,) => acc + value.toString().charCodeAt(index), 0) % this.capacity
  }

  put(value: T): void {
    const slot = this.seek_slot(value);
    this.table.insert(value, slot);
  }

  size(): number {
    return this.table.size()
  }

  seek_slot(value: T): number {
    let init_slot = this.hash_fun(value);

    if (!this.table.get_item(init_slot)) {
      return init_slot;
    }

    let next_slot = init_slot + this.step;
    while (this.step < this.table.size()) {
      if (!this.table.get_item(next_slot)) {
        return next_slot
      } else {
        next_slot += this.step
      }

      if (next_slot >= this.table.size()) {
        this.step++;
        next_slot = init_slot + this.step;
      }
    }
    return -1;
  }
}
