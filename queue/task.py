from stack.stack_tail import Stack


def turn_queue(queue, n):
    if n > queue.size():
        return None
    i = 0

    def turn():
        nonlocal i

        if i == n:
            return queue

        i += 1
        item = queue.dequeue()
        turn()
        queue.enqueue(item)

        return queue

    return turn()


class StackQueue:
    def __init__(self):
        self.stack_in = Stack()
        self.stack_out = Stack()

    def enqueue(self, item):
        self.stack_in.push(item)

    def dequeue(self):
        if self.stack_out.size() == 0:
            while self.stack_in.size():
                self.stack_out.push(self.stack_in.pop())

        return self.stack_out.pop()

    def size(self):
        return self.stack_in.size() + self.stack_out.size()
