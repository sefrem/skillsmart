from deque import Deque


def is_palindrome(value: str):
    deque = Deque()

    for char in value:
        if char == " ":
            continue
        deque.addTail(char.lower())

    while deque.size() > 1:
        if deque.removeFront() != deque.removeTail():
            return False

    return True
