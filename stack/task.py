from stack_tail import Stack
from operator import add, sub, mul, truediv


def is_balanced(value: str):
    stack = Stack()

    for char in value:
        if char == '(':
            stack.push(1)
        else:
            stack.pop()

    return True if stack.size() == 0 else False


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

        result.push(operators[i](result.pop(), result.pop()))



