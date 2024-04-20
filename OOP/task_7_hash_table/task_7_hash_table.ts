import {DynamicArray} from "../task_4_dynamic_array/task_4_dynamic_array";

abstract class HashTableSpec<T> {

  // конструктор
  // постусловие: создает новую пустую хэш-таблицу указанного размера
  constructor() {
  }

  // команды
  // постусловие: значение помещено в подходящий свободный слот
  abstract put(value: T): void

  // предусловие: в таблице имеется значение value;
// постусловие: из таблицы удалено значение value
  abstract remove(value: T): void

  // запросы
  // постусловие: по значению вычисляет индекс слота
  abstract hash_fun(value: T): number


  // постусловие: возвращает подходящий свободный слот или заканивается неудачей, если это невозможно
  public abstract seek_slot(value: T): number

  // постусловие: возвращает результат содержится ли значение value в таблице
  public abstract get(value: T): boolean

  // постусловие: возвращает размер таблицы
  public abstract size(): number

  public abstract get_remove_status(): number
}


export class HashTable<T> implements HashTableSpec<T> {
  private REMOVE_NIL = 0;
  private REMOVE_ERR = 2;

  private table: DynamicArray<T>;
  private step = 3;
  private capacity = 15;

  private remove_status = this.REMOVE_NIL;

  constructor() {
    this.table = new DynamicArray<T>(this.capacity);
  }

  get(value: T): boolean {
    return this.seek_item(value) >= 0
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

  remove(value: T): void {
    const slot = this.seek_item(value);
    if (slot) {
      this.table.remove(slot);
      this.remove_status = this.table.get_remove()
    } else {
      this.remove_status = this.REMOVE_ERR
    }
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

  seek_item(value: T): number {
    let init_slot = this.hash_fun(value);

    if (this.table.get_item(init_slot) === value) {
      return init_slot;
    }

    let next_slot = init_slot + this.step;
    while (this.step < this.table.size()) {
      if (this.table.get_item(next_slot) === value) {
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

  get_remove_status(): number {
    return 0;
  }
}
