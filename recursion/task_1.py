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

def print_even(list, index=0):
    if index == len(list):
        return

    value = list[index]
    if value % 2 == 0:
        print(value)

    print_even(list, index + 1)


# 6. печать элементов списка с чётными индексами;

def print_even_index(list, index=0):
    if index == len(list):
        return

    print(list[index])

    print_even_index(list, index + 2)


# 7. нахождение второго максимального числа в списке
# (с учётом, что максимальных может быть несколько, если они равны);

def find_max(list):
    index = 0
    max = 0
    prev_max = 0

    def search_list(index):
        nonlocal max, prev_max
        if index == len(list):
            return
        if list[index] > max:
            prev_max = max
            max = list[index]

        search_list(index + 1)

    search_list(index)

    return prev_max


# 8. поиск всех файлов в заданном каталоге, включая файлы, расположенные в подкаталогах произвольной вложенности.

def print_file_names(files, index=0):
    if index == len(files):
        return
    print(files[index])

    print_file_names(files, index + 1)


def iterate_folders(folders, callback, dirpath, index=0, ):
    if index == len(folders):
        return
    callback(dirpath + '/' + folders[index])

    iterate_folders(folders, callback, dirpath, index + 1)


def find_files(path):
    (dirpath, folders, files) = next(os.walk(path))
    print_file_names(files)

    iterate_folders(folders, find_files, dirpath)



