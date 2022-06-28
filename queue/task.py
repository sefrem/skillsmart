from stack.stack_tail import Stack


def turn_queue(queue, n):
    if n > queue.size():
        return None

    stack = Stack()

    for i in range(n):
        stack.push(queue.dequeue())

    while stack.size() > 0:
        queue.enqueue(stack.pop())

    return queue


class StackQueue:
    def __init__(self):
        self.stack_in = Stack()
        self.stack_out = Stack()

    def enqueue(self, item):
        if self.stack_out.size() == 0:
            self.stack_out.push(item)
            return self

        while self.stack_out.size() > 0:
            self.stack_in.push(self.stack_out.pop())
        self.stack_out.push(item)
        while self.stack_in.size() > 0:
            self.stack_out.push(self.stack_in.pop())

        return self

    def dequeue(self):
        return self.stack_out.pop()

    def size(self):
        return self.stack_out.size()
