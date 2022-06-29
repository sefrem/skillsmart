from stack.stack_tail import Stack


def turn_queue(queue, n):
    if n > queue.size():
        return None

    stack = Stack()

    for i in range(n*2):
        if i < n:
            stack.push(queue.dequeue())
        else:
            queue.enqueue(stack.pop())

    return queue


class StackQueue:
    def __init__(self):
        self.stack_in = Stack()
        self.stack_out = Stack()

    def enqueue(self, item):
        if self.stack_out.size() == 0:
            self.stack_out.push(item)
        else:
            self.stack_in.push(item)

        return self

    def dequeue(self):
        item = self.stack_out.pop()

        if self.stack_out.size() == 0:
            while self.stack_in.size():
                self.stack_out.push(self.stack_in.pop())

        return item

    def size(self):
        return self.stack_in.size() + self.stack_out.size()
