abstract class LinkedList<T> {
    private HEAD_OK = 1; // последний head() отработал корректно
    private HEAD_ERR = 2; // список пуст
    private TAIL_OK = 1; // последний tail() отработал корректно
    private TAIL_ERR = 2; // список пуст
    private RIGHT_OK = 1; // последний right() отработал корректно
    private RIGHT_ERR = 2; // список пуст или курсор уже стоит на последнем узле
    private PUT_RIGHT_OK = 1; // последний put_right() отработал успешно
    private PUT_RIGHT_ERR = 2; // список пуст
    private PUT_LEFT_OK = 1; // последний put_left() отработал успешно
    private PUT_LEFT_ERR = 2; // список пуст
    private REMOVE_OK = 1; // последний remove() отработал успешно
    private REMOVE_ERR = 2; // список пуст
    private ADD_TO_EMPTY_OK = 1; // последний add_to_empty() отработал успешно
    private ADD_TO_EMPTY_ERR = 2; // список не пустой
    private REPLACE_OK = 1; // последний replace() отработал успешно
    private REPLACE_ERR = 2; // список пуст
    private FIND_OK = 1; // последний find() отработал успешно
    private FIND_ERR = 2; // список пуст
    private REMOVE_ALL_OK = 1; // последний remove_all() отработал успешно
    private REMOVE_ALL_ERR = 2; // список пуст
    private GET_OK = 1; // последний get() отработал корректно
    private GET_ERR = 2; // список пуст
    private IS_HEAD_OK = 1; // последний is_head() отработал корректно
    private IS_HEAD_ERR = 2; // список пуст
    private IS_TAIL_OK = 1; // последний is_tail() отработал корректно
    private IS_TAIL_ERR = 2; // список пуст
    private IS_VALUE_OK = 1; // последний is_value() отработал корректно
    private IS_VALUE_ERR = 2; // список пуст

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

    // предусловие: список не пустой
    // постусловие: курсор установлен на следующий узел с искомым значением
    public abstract find(value: T): void

    // предусловие: список не пустой
    // постусловие: из списка удалены все узлы с заданным значениям. Курсор установлен на следующий после последнего удаленного узла узел
    // (если он есть) или на предыдущий (если он есть)
    public abstract remove_all(value: T): void

    // запросы

    // предусловие: список не пустой
    public abstract get(): T

    public abstract size(): number

    // предусловие: список не пустой
    public abstract is_head(): boolean

    // предусловие: список не пустой
    public abstract is_tail(): boolean

    // предусловие: список не пустой
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
    public abstract get_find_status(): number // возвращает значение FIND_*
    public abstract get_remove_all_status(): number // возвращает значение REMOVE_ALL_*
    public abstract get_get_status(): number // возвращает значение GET_*
    public abstract get_is_head_status(): number // возвращает значение IS_HEAD_*
    public abstract get_is_tail_status(): number // возвращает значение IS_TAIL_*
    public abstract get_is_value_status(): number // возвращает значение IS_VALUE_*
}

// 2.2
// Кажется, что операция tail() как раз таки сводима к другим операциям, а именно - можно делать операцию right() до тех пор, пока get_right_status()
// не вернет RIGHT_ERR.

// 2.3
// Операция find_all() не нужна, потому что теперь у нас есть курсор и мы можем перемещаться непосредственно по списку.