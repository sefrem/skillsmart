import {HashTable} from "../task_7_hash_table/task_7_hash_table";

abstract class PowerSetSpec<T> {

  // конструктор
  // постусловие: создано новое пустое множество
  constructor() {
  }

  // команды
  // постусловие: в множество добавлено значение. Если это значение в нем уже есть, ничего не происходит
  public abstract put(value: T): void

  // предусловие: в множестве есть значени
  // постусловие: из множества удалено значение
  public abstract remove(value: T): void

  // запросы
  // постусловие: проверяет есть ли элемент в множестве
  public abstract get(value: T): boolean

  // постусловие: возвращено новое множество, в котором есть только элементы, встречающиеся в двух множествах
  public abstract intersection(set: PowerSetSpec<T>): PowerSetSpec<T>

  // постусловие: возвращено новое множество, в котором есть все элементы обоих множеств
  public abstract union(set: PowerSetSpec<T>): PowerSetSpec<T>

  // постусловие: возвращено новое множество, в котором есть только те элементы, которые не входят во множество-параметр
  public abstract difference(set: PowerSetSpec<T>): PowerSetSpec<T>

  // постусловие: проверяет, является ли множество-параметр подмножеством оригинального множества
  public abstract is_subset(set: PowerSetSpec<T>): boolean

  // постусловие: возвращает размер множества
  public abstract size(): number

  // возвращает статус последней команды remove()
  public abstract get_remove_status(): number

  public abstract get_put_status(): number
}


class PowerSet<T> implements PowerSetSpec<T> {
  private REMOVE_NIL = 0;
  private REMOVE_ERR = 2;
  private PUT_NIL = 0;
  private PUT_ERR = 2;

  private put_status = this.PUT_NIL;
  private remove_status = this.REMOVE_NIL;

  constructor(private set = new HashTable<T>()) {
  }

  put(value: T): void {
    if (!this.get(value)) {
      this.set.put(value);
      this.put_status = this.set.get_put_status()
    } else {
      this.put_status = this.PUT_ERR;
    }
  }

  get(value: T): boolean {
    return this.set.get(value);
  }

  remove(value: T): void {
    if (this.get(value)) {
      this.set.remove(value);
      this.remove_status = this.set.get_remove_status()
    } else {
      this.remove_status = this.REMOVE_ERR;
    }
  }

  union(set: PowerSet<T>): PowerSet<T> {
    const unionSet = new PowerSet<T>();
    for (let value of this.set.get_iterator()) {
      unionSet.put(value)
    }
    for (let value of set.get_iterator()) {
      unionSet.put(value)
    }
    return unionSet;
  }

  difference(set: PowerSet<T>): PowerSet<T> {
    const differenceSet = new PowerSet<T>();
    for (let value of this.set.get_iterator()) {
      if (!set.get(value)) {
        differenceSet.put(value)
      }
    }
    return differenceSet;
  }

  intersection(set: PowerSet<T>): PowerSet<T> {
    const intersectionSet = new PowerSet<T>();
    for (let value of this.set.get_iterator()) {
      if (set.get(value)) {
        intersectionSet.put(value)
      }
    }
    return intersectionSet;
  }

  is_subset(set: PowerSet<T>): boolean {
    for (let value of set.get_iterator()) {
      if (!this.set.get(value)) {
        return false
      }
    }
    return true
  }

  size(): number {
    return this.set.size()
  }

  get_iterator() {
    return this.set.get_iterator()
  }

  get_put_status(): number {
    return this.put_status;
  }

  get_remove_status(): number {
    return this.remove_status
  }
}

