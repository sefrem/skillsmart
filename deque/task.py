from deque import Deque


def is_palindrome(value: str):
    deque = Deque()
    middle_str = int(len(value) / 2)

    for i, char in enumerate(value):
        if i < middle_str:
            deque.addTail(char.lower())
        if i == middle_str and len(value) % 2 != 0:
            continue
        if i >= middle_str:
            if char.lower() != deque.removeTail():
                return False

    return deque.size() == 0
