import {HashTable} from "../task_7_hash_table/task_7_hash_table";
import {DynamicArray} from "../task_4_dynamic_array/task_4_dynamic_array";


abstract class NativeDictionarySpec {
  // конструктор
  // постусловие: создает пустой словрь
  constructor() {
  }

  // команды
  // постусловие: в словарь сохранены ключ и значение
  public abstract put(key: string, value: any): void

  // предусловие: ключ есть в словаре
  // постусловие: возвращено значение ключа
  public abstract get(key: string): any

  // предусловие: ключ есть в словаре
  // постусловие: ключ и значение удалены из словаря
  public abstract remove(key: string): void

  // запросы
  // постусловие: возвращает результат проверки есть ли в словаре ключ
  public abstract is_key(key: string): boolean

  // постусловие: возвращает количество элементов в словаре
  public abstract size(): number

  // постусловие: возвращает статус последней операции get()
  public abstract get_get_status(): number

  // постусловие: возвращает статус последней операции remove()
  public abstract get_remove_status(): number
}

class NativeDictionary implements NativeDictionarySpec {
  private GET_NIL = 0; // get() еще не вызывался
  private GET_ERR = 2 // в словаре нет такого элемента
  private REMOVE_NIL = 0; // remove() еще не вызывался
  private REMOVE_ERR = 2; // в словаре нет такого элемента

  private get_status = this.GET_NIL;
  private remove_status = this.REMOVE_NIL;

  constructor(private keys = new HashTable<any>(), private values = new DynamicArray()) {
  }

  get(key: string): any {
    const slot = this.keys.seek_item(key);
    if (slot) {
      const value = this.values.get_item(slot);
      this.get_status = this.values.get_get_item();
      return value;
    } else {
      this.get_status = this.GET_ERR;
    }
  }

  remove(key: string): void {
    const slot = this.keys.seek_item(key);
    if (slot) {
      this.keys.remove(slot);
      this.values.remove(slot);
      this.remove_status = this.keys.get_remove_status()
    } else {
      this.remove_status = this.REMOVE_ERR
    }
  }

  is_key(key: string): boolean {
    return this.keys.get(key);
  }

  put(key: string, value: any): void {
    const slot = this.keys.seek_slot(value);
    this.keys.put(key);
    this.values.insert(value, slot);
  }

  size(): number {
    return this.keys.size();
  }

  get_get_status(): number {
    return this.get_status
  }

  get_remove_status(): number {
    return this.remove_status
  }
}
