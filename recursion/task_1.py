# 1. возведение числа N в степень M.

def pow(n, m):
    return n if m == 1 else n * pow(n, m - 1)


# 2. вычисление суммы цифр числа.

def value_numbers_sum(x):
    return x if x == 1 else x + value_numbers_sum(x - 1)


# 3. расчёт длины списка, для которого разрешена только операция удаления первого элемента pop(0)
# (и получение длины конечно);

def get_list_length(list):
    if len(list) == 0:
        return 0
    list.pop(0)

    return 1 + get_list_length(list)


# 4. проверка, является ли строка палиндромом;

def is_palyndrome(str):
    if len(str) in (0, 1):
        return True
    if str[0] != str[-1]:
        return False

    return is_palyndrome(str[1: -1])


# 5. печать только чётных значений из списка;

def print_even(list):
    if len(list) == 0:
        return

    value = list[0]
    if value % 2 == 0:
        print(value)

    return print_even(list[1:])


# 6. печать элементов списка с чётными индексами;

def print_even_index(list):
    if len(list) == 0:
        return

    print(list[0])

    return print_even_index(list[2:])


