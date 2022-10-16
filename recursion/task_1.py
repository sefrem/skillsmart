import os


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
    def iterate(index):
        if index >= len(list):
            return

        value = list[index]
        if value % 2 == 0:
            print(value)

        iterate(index + 1)

    iterate(0)


# 6. печать элементов списка с чётными индексами;

def print_even_index(list):
    def iterate(index):
        if index >= len(list):
            return

        print(list[index])

        iterate(index + 2)

    iterate(0)


# 7. нахождение второго максимального числа в списке
# (с учётом, что максимальных может быть несколько, если они равны);

def find_max(list):
    def find(index, max, prev_max):

        if index == len(list):
            return prev_max

        if list[index] > max:
            return find(index + 1, list[index], max)

        if list[index] > prev_max and list[index] != max:
            return find(index + 1, max, list[index])

        return find(index + 1, max, prev_max)

    return find(0, 0, 0)


# 8. поиск всех файлов в заданном каталоге, включая файлы, расположенные в подкаталогах произвольной вложенности.

def print_file_names(files, index):
    if index == len(files):
        return
    print(files[index])

    print_file_names(files, index + 1)


def iterate_folders(folders, callback, dirpath, index):
    if index == len(folders):
        return
    callback(dirpath + '/' + folders[index])

    iterate_folders(folders, callback, dirpath, index + 1)


def find_files(path):
    (dirpath, folders, files) = next(os.walk(path))
    print_file_names(files, 0)

    iterate_folders(folders, find_files, dirpath, 0)

# Генерация всех корректных сбалансированных комбинаций круглых
# скобок (параметр -- количество открывающих скобок).

def generate_braces(n):
    total = []

    def generate(open_braces, close_braces, braces):
        if open_braces == n and close_braces == n:
            total.append(braces)
            return

        if open_braces < n:
            generate(open_braces + 1, close_braces, braces + '(')

        if close_braces < open_braces:
            generate(open_braces, close_braces + 1, braces + ')')

    generate(0, 0, '')

    return total
