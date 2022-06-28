from linked_list.linked_list import LinkedList, Node


class Queue:
    def __init__(self):
        self.queue = LinkedList()

    def enqueue(self, item):
        self.queue.add_in_tail(Node(item))
        return self

    def dequeue(self):
        value = self.queue.head
        if not value:
            return None
        self.queue.head = self.queue.head.next
        return value.value

    def size(self):
        return self.queue.len()