from stack.stack_tail import Stack


def turn_queue(queue, n):
    for i in range(n):
        queue.enqueue(queue.dequeue())


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
