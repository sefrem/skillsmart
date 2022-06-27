from stack_tail import Stack
from operator import add, sub, mul, truediv


def is_balanced(value: str):
    if len(value) == 0:
        return False

    stack = Stack()

    for char in value:
        if char == '(':
            stack.push(1)
        else:
            if stack.size() == 0:
                return False
            stack.pop()

    if stack.size() == 0:
        return True

    return False


def calculate_postfix(value: list):
    values = Stack()
    result = Stack()

    operators = {
        '+': add,
        '-': sub,
        '*': mul,
        '/': truediv,
    }

    for i in value:
        values.push(i)

    while values.size() > 0:
        i = values.pop()

        if isinstance(i, int):
            result.push(i)
            continue

        if i == '=':
            return result.pop()

        last = result.pop()
        prev_last = result.pop()
        result.push(operators[i](prev_last, last))
