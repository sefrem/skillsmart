abstract class DynamicArraySpec<T> {

  //конструктор
  // создан новый пустой динамический массив фиксированного размера
  constructor() {
  }

  // команды
  // постусловие: изменен размер массива
  public abstract make_array(new_capacity: number): void

  // постусловие: в конец массива добавлен новый элемент. при необходимости увеличен размер массива
  public abstract append(item: T): void

  // предусловие: в массиве есть место, индекс не выходит за границы массива. индекс может быть равен длине массива
  // постусловие: в нужный индекс добавлен новый элемент. все последующие элементы сдвинуты вперед
  // при необходимости увеличен размер массива
  public abstract insert(item: T, index: number): void

  // предусловие: индекс не выходит за границы массива
  // постусловие: из массива удален элемент по данному индексу. при необходимости прозведено сжатие массива
  public abstract remove(index: number): void

  // запросы
  // предусловие: индекс не выходит за границы массива
  // постусловие: возвращает значение по данному индексу
  public abstract get_item(index: number): T

  // дополнительные запросы
  public abstract get_get_item(): number // возвращает значение GET_ITEM_*

}

export class DynamicArray<T> implements DynamicArraySpec<T> {
  private GET_ITEM_NIL = 0; // get_item() еще не вызывался
  private GET_ITEM_OK = 1; // последний get_item() отработал успешно
  private GET_ITEM_ERR = 2; // индекс выходит за границы массива
  private INSERT_ITEM_NIL = 0; // insert_item() еще не вызывался
  private INSERT_ITEM_OK = 1; // последний insert_item() отработал успешно
  private INSERT_ITEM_ERR = 2; // индекс выходит за границы массива
  private REMOVE_NIL = 0; // remove() еще не вызывался
  private REMOVE_OK = 1; // последний remove() отработал успешно
  private REMOVE_ERR = 2; // индекс выходит за границы массива

  private capacity: number = 15;
  private get_item_status: number = this.GET_ITEM_NIL;
  private insert_item_status: number = this.INSERT_ITEM_NIL;
  private remove_status: number = this.REMOVE_NIL;

  constructor(private array: T[] = [], capacity?: number) {
    this.capacity = capacity - 1;
  }

  public size(): number {
    return this.array.length;
  }

  private resize(new_capacity: number): void {
    this.capacity *= new_capacity
  }

  append(item: T): void {
    if (this.size() === this.capacity) {
      this.resize(2);
    }
    this.array.push(item);
  }

  insert(item: T, index: number): void {
    if (index >= 0 && index <= this.size()) {
      if (index === this.capacity) {
        this.make_array(2)
      }
      this.array.splice(index, 0, item)

      this.insert_item_status = this.INSERT_ITEM_OK
    } else {
      this.insert_item_status = this.INSERT_ITEM_ERR
    }
  }

  make_array(new_capacity: number): void {
    this.capacity = new_capacity;
  }

  remove(index: number): void {
    if (index >= 0 && index < this.size()) {
      this.array.splice(index, 1);
      this.remove_status = this.REMOVE_OK;

      if (this.size() < this.capacity / 2) {
        this.capacity = Math.floor(this.capacity / 1.5)
      }
    } else {
      this.remove_status = this.REMOVE_ERR
    }
  }

  // запросы
  get_item(index: number): T {
    if (index >= 0 && index < this.size()) {
      this.get_item_status = this.GET_ITEM_OK;
      return this.array[index];
    } else {
      this.get_item_status = this.GET_ITEM_ERR;
    }
  }

  // дополнительные запросы

  get_get_item(): number {
    return this.get_item_status;
  }

  get_insert_item(): number {
    return this.insert_item_status;
  }

  get_remove(): number {
    return this.remove_status;
  }
}
