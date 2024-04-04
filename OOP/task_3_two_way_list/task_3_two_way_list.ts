abstract class ParentList<T> {
    // конструктор
    // постусловие: создан новый пустой связный список
    constructor() {
    }

    //команды

    // предусловие: список не пустой
    // постусловие: курсор стоит на первом узле в списке
    public abstract head(): void

    // предусловие: список не пустой
    // постусловие: курсор стоит на последнем узле в списке
    public abstract tail(): void

    // предусловие: список не пустой и курсор не стоит на последнем узле
    // постусловие: курсор сдвинут на 1 узел вправо
    public abstract right(): void

    // предусловие: список не пустой
    // постусловие: следом за текущим узлом вставлен один узел со значением value
    public abstract put_right(value: T): void

    // предусловие: список не пустой
    // постусловие: перед текущим узлом вставлен один узел со значением value
    public abstract put_left(value: T): void

    // предусловие: список не пустой
    // постусловие: текущий узел удален. Курсор сместился на следующий узел (если он есть) или на предыдущий узел (если он есть)
    public abstract remove(): void

    // постусловие: из списка удалены все значения
    public abstract clear(): void

    // предусловие: список пуст
    // постусловие: в список добавлен новый узел
    public abstract add_to_empty(value: T): void

    // постусловие: в хвост списка добавлен новый узел
    public abstract add_tail(value: T): void

    // предусловие: список не пустой
    // постусловие: значение текущего узла заменено на заданное
    public abstract replace(value: T): void

    // постусловие: курсор установлен на следующий узел с искомым значением
    public abstract find(value: T): void

    // постусловие: из списка удалены все узлы с заданным значениям. Курсор установлен на следующий после последнего удаленного узла узел
    // (если он есть) или на предыдущий (если он есть)
    public abstract remove_all(value: T): void

    // запросы

    // предусловие: список не пустой
    public abstract get(): T

    public abstract size(): number

    public abstract is_head(): boolean

    public abstract is_tail(): boolean

    public abstract is_value(): boolean

    // дополнительные запросы

    public abstract get_head_status(): number // возвращает значение HEAD_*
    public abstract get_tail_status(): number // возвращает значение TAIL_*
    public abstract get_right_status(): number // возвращает значение RIGHT_*
    public abstract get_put_right_status(): number // возвращает значение PUT_RIGHT_*
    public abstract get_put_left_status(): number // возвращает значение PUT_LEFT_*
    public abstract get_remove_status(): number // возвращает значение REMOVE_*
    public abstract get_add_to_empty_status(): number // возвращает значение ADD_TO_EMPTY_*
    public abstract get_replace_status(): number // возвращает значение REPLACE_*
    public abstract get_get_status(): number // возвращает значение GET_*
}

class ListNode<T> {
    public prev: ListNode<T> | null = null;
    public next: ListNode<T> | null = null;

    constructor(public value: T) {
    }
}

export class ParentLinkedList<T> implements ParentList<T> {
    private HEAD_NIL = 0; // add_to_empty() или add_to_tail() еще не вызывался
    private HEAD_OK = 1; // последний head() отработал корректно
    private HEAD_ERR = 2; // список пуст
    private TAIL_NIL = 0; // add_to_empty() или add_to_tail() еще не вызывался
    private TAIL_OK = 1; // последний tail() отработал корректно
    private TAIL_ERR = 2; // список пуст
    private RIGHT_NIL = 0; // add_to_empty() или add_to_tail() еще не вызывался
    private RIGHT_OK = 1; // последний right() отработал корректно
    private RIGHT_ERR = 2; // список пуст или курсор уже стоит на последнем узле
    private PUT_RIGHT_NIL = 0; // add_to_empty() или add_to_tail() еще не вызывался
    private PUT_RIGHT_OK = 1; // последний put_right() отработал успешно
    private PUT_RIGHT_ERR = 2; // список пуст
    private PUT_LEFT_NIL = 0; // add_to_empty() или add_to_tail() еще не вызывался
    private PUT_LEFT_OK = 1; // последний put_left() отработал успешно
    private PUT_LEFT_ERR = 2; // список пуст
    private REMOVE_NIL = 0; // add_to_empty() или add_to_tail() еще не вызывался
    private REMOVE_OK = 1; // последний remove() отработал успешно
    private REMOVE_ERR = 2; // список пуст
    private ADD_TO_EMPTY_OK = 1; // последний add_to_empty() отработал успешно
    private ADD_TO_EMPTY_ERR = 2; // список не пустой
    private REPLACE_NIL = 0; // add_to_empty() или add_to_tail() еще не вызывался
    private REPLACE_OK = 1; // последний replace() отработал успешно
    private REPLACE_ERR = 2; // список пуст
    private GET_NIL = 0; // add_to_empty() или add_to_tail() еще не вызывался
    private GET_OK = 1; // последний get() отработал корректно
    private GET_ERR = 2; // список пуст

    private head_status: number = this.HEAD_NIL;
    private tail_status: number = this.TAIL_NIL;
    private right_status: number = this.RIGHT_NIL;
    private add_to_empty_status: number;
    private put_right_status: number = this.PUT_RIGHT_NIL;
    private put_left_status: number = this.PUT_LEFT_NIL;
    private remove_status: number = this.REMOVE_NIL;
    private replace_status: number = this.REPLACE_NIL;
    private get_status: number = this.GET_NIL;

    protected head_pointer: ListNode<T> | null = null; // указатель на начало списка
    private tail_pointer: ListNode<T> | null = null; // указатель на конец списка
    private current_size: number = 0; // текущий размер списка
    public cursor: ListNode<T> | null = null; // курсор

    head(): void {
        if (this.size() > 0) {
            this.cursor = this.head_pointer;
            this.head_status = this.HEAD_OK;
        } else {
            this.head_status = this.HEAD_ERR;
        }
    }

    tail(): void {
        if (this.size() > 0) {
            this.cursor = this.tail_pointer;
            this.tail_status = this.TAIL_OK;
        } else {
            this.tail_status = this.TAIL_ERR;
        }
    }

    add_to_empty(value: T): void {
        if (this.size() === 0) {
            const node = new ListNode(value);
            this.head_pointer = node;
            this.tail_pointer = node;
            this.cursor = node;
            this.current_size += 1;
            this.add_to_empty_status = this.ADD_TO_EMPTY_OK;
        } else {
            this.add_to_empty_status = this.ADD_TO_EMPTY_ERR;
        }
    }

    add_tail(value: T): void {
        if (this.size() === 0) {
            this.add_to_empty(value);
        } else {
            const node = new ListNode(value);
            node.prev = this.tail_pointer;
            this.tail_pointer.next = node;
            this.tail_pointer = node;
            this.current_size += 1;
        }
    }

    right(): void {
        if (this.size() > 0 && this.cursor !== this.tail_pointer) {
            this.cursor = this.cursor.next;
            this.right_status = this.RIGHT_OK;
        } else {
            this.right_status = this.RIGHT_ERR;
        }
    }

    put_right(value: T): void {
        if (this.size() > 0) {
            const new_node = new ListNode<T>(value);
            new_node.prev = this.cursor;
            new_node.next = this.cursor.next;
            if (new_node.next) {
                new_node.next.prev = new_node
            }
            if (new_node.prev) {
                new_node.prev.next = new_node
            }
            // если нет следующего узла, значит мы добавили узел
            // в хвост и нужно обновить указатель
            if (!new_node.next) {
                this.tail_pointer = new_node;
            }
            this.cursor.next = new_node;
            this.put_right_status = this.PUT_RIGHT_OK;
            this.current_size += 1;
        } else {
            this.put_right_status = this.PUT_RIGHT_ERR;
        }
    }

    put_left(value: T): void {
        if (this.size() > 0) {
            const new_node = new ListNode<T>(value);
            new_node.prev = this.cursor.prev;
            new_node.next = this.cursor;
            if (new_node.prev) {
                new_node.prev.next = new_node
            }
            if (new_node.next) {
                new_node.next.prev = new_node
            }
            // если нет предыдущего узла, значит мы добавили
            // узел в начало, и нужно обновить указатель
            if (!new_node.prev) {
                this.head_pointer = new_node;
            }

            this.put_left_status = this.PUT_LEFT_OK;
            this.current_size += 1;
        } else {
            this.put_left_status = this.PUT_LEFT_ERR;
        }
    }

    remove(): void {
        if (this.size() > 0) {
            // const prev_node = this.search_prev_node();
            this.remove_status = this.REMOVE_OK;
            this.current_size -= 1;

            if (this.cursor.next && this.cursor.prev) {
                // удаляем не последний узел и не первый
                this.cursor.prev.next = this.cursor.next;
                this.cursor.next.prev = this.cursor.prev;
                this.cursor = this.cursor.next;
            } else if (!this.cursor.next) {
                // удаляем последний узел
                this.cursor.prev.next = null;
                this.cursor = this.cursor.prev;
                this.tail_pointer = this.cursor;
            } else if (!this.cursor.prev) {
                // удаляем первый узел
                this.cursor = this.head_pointer.next;
                this.head_pointer = this.head_pointer.next;
                this.head_pointer.prev = null;
            }
        } else {
            this.remove_status = this.REMOVE_ERR;
        }
    }

    clear(): void {
        this.head_pointer = null;
        this.tail_pointer = null;
        this.cursor = null;
        this.current_size = 0;
    }

    replace(value: T): void {
        if (this.size() > 0) {
            this.cursor.value = value;
            this.replace_status = this.REPLACE_OK;
        } else {
            this.replace_status = this.REPLACE_ERR;
        }
    }

    find(value: T): void {
        let pointer = this.cursor;

        while (pointer && pointer.next !== null) {
            pointer = pointer.next
            if (pointer.value === value) {
                this.cursor = pointer
                break;
            }
        }
    }

    get(): T {
        if (this.size() > 0) {
            this.get_status = this.GET_OK;
            return this.cursor.value;
        } else {
            this.get_status = this.GET_ERR;
        }
    }

    remove_all(value: T): void {
        let new_pointer = null;
        let pointer = this.head_pointer;
        let validElements = 0;

        while (pointer !== null) {
            if (pointer.value !== value) {
                validElements++

                if (!new_pointer) {
                    // заполняем начало списка
                    this.head_pointer = pointer;
                    // this.head_pointer.prev = null;
                    new_pointer = pointer;
                    this.cursor = new_pointer;
                } else {
                    new_pointer.next = pointer;
                    new_pointer.next.prev = new_pointer;
                    new_pointer = new_pointer.next;
                }
            }

            // ставим курсор на следующий после удаленного узел
            if (pointer && pointer.value === value && pointer.next && pointer.next.value !== value) {
                this.cursor = pointer.next;
                this.cursor.prev = new_pointer
            }

            if (!pointer.next) {
                this.tail_pointer = new_pointer;
            }

            pointer = pointer.next
        }

        // случай, когда все последние элементы списка нужно удалить
        if (new_pointer.next?.value === value) {
            new_pointer.next = null;
            this.cursor = new_pointer;
            this.tail_pointer = new_pointer
        }

        this.current_size = validElements
    }

    is_head(): boolean {
        return this.head_pointer === this.cursor
    }

    is_tail(): boolean {
        return this.tail_pointer === this.cursor;
    }

    is_value(): boolean {
        return !!this.cursor;
    }

    size(): number {
        return this.current_size
    }

    get_get_status(): number {
        return this.get_status;
    }

    get_put_left_status(): number {
        return this.put_left_status;
    }

    get_put_right_status(): number {
        return this.put_right_status;
    }

    get_remove_status(): number {
        return this.remove_status
    }

    get_replace_status(): number {
        return this.replace_status;
    }

    get_right_status(): number {
        return this.right_status;
    }

    get_tail_status(): number {
        return this.tail_status;
    }

    get_head_status(): number {
        return this.head_status;
    }

    get_add_to_empty_status(): number {
        return this.add_to_empty_status
    }
}

abstract class TwoWayListSpec<T> extends ParentLinkedList<T> {
    // конструктор
    // постусловие: создан новый пустой двусвязный список
    constructor() {
        super();
    }

    // команды
    // предусловие: список не пустой и курсор не стоит на первом узле
    // постусловие: курсор сдвинут на 1 узел влево
    public abstract left(): void;

    // дополнительные запросы

    public abstract get_left_status(): number //  возвращает статус LEFT_*
}

export class LinkedList<T> extends ParentLinkedList<T> {
}


export class TwoWayList<T> extends TwoWayListSpec<T> {
    private LEFT_NIL = 0; // add_to_empty() или add_to_tail() еще не вызывался
    private LEFT_OK = 1; // последний left() отработал корректно
    private LEFT_ERR = 2; // список пуст или курсор уже стоит на первом узле

    private left_status: number = this.LEFT_NIL;

    left(): void {
        if (this.size() > 0 && this.cursor !== this.head_pointer) {
            this.cursor = this.cursor.prev;
            this.left_status = this.LEFT_OK;
        } else {
            this.left_status = this.LEFT_ERR;
        }
    }

    get_left_status(): number {
        return this.left_status
    }
}
