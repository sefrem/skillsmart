export class BoundedStack<T> {
  private POP_NIL = 0; // push() еще не вызывалась
  private POP_OK = 1; // последняя pop() отработала нормально
  private POP_ERR = 2; // стек пуст
  private PEEK_NIL = 0; // push() еще не вызывалась
  private PEEK_OK = 1; // последняя peek() отработала нормально
  private PEEK_ERR = 2; // стек пуст
  private PUSH_NIL = 0; // push() еще не вызывалась
  private PUSH_OK = 1; // последняя push() отработала нормально
  private PUSH_ERR = 2; // стек полон

  private stack: Array<T> = []; // основное хранилище стека
  private peek_status: number = this.PEEK_NIL; // начальный статус команды peek()
  private pop_status: number = this.POP_NIL; // начальный статус команды pop()
  private push_status: number = this.PUSH_NIL; // начальный статус команды push()

  constructor(private stackLength: number = 32) {
  }

  // команды
  // предусловие: в стеке достаточно места для нового значения
  // постусловие: в стек добавлено новое значение
  public push(value: T): void {
    if (this.size() < this.stackLength) {
      this.stack.push(value);
      this.push_status = this.PUSH_OK;
    } else {
      this.push_status = this.PUSH_ERR;
    }
  }

  // предусловие: стек не пустой
  // постусловие: из стека удален верхний элемент
  public pop(): void {
    if (this.size() > 0) {
      this.stack.splice(-1, 1);
      this.pop_status = this.POP_OK;
    } else {
      this.pop_status = this.POP_ERR;
    }
  }

  // постусловие: из стека удалены все значения
  public clear(): void {
    this.stack = [];
  }

  // запросы
  // предусловие: стек не пустой
  public peek(): T | number {
    if (this.size() > 0) {
      this.peek_status = this.PEEK_OK;
      return this.stack[this.stack.length - 1];
    } else {
      this.peek_status = this.PEEK_ERR;
      return 0
    }
  }

  // возвращает текущий размер стека
  public size(): number {
    return this.stack.length;
  }

  // возвращает значение PUSH_*
  public get_push_status(): number {
    return this.push_status;
  }

  // возвращает значение PEEK_*
  public get_peek_status(): number {
    return this.peek_status;
  }

  // возвращает значение POP_*
  public get_pop_status(): number {
    return this.pop_status;
  }
}

