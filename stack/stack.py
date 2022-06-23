

class Stack:
    def __init__(self):
        self.stack = []

    def size(self):
        return len(self.stack)

    def pop(self):
        item = self.stack.pop(self.size()-1)
        return item if item else None

    def push(self, value):
        self.stack.append(value)
        return self

    def peek(self):
        # ваш код
        return None