
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


class Node:
    def __init__(self, v):
        self.value = v
        self.next = None


class LinkedList:
    def __init__(self):
        self.head = None
        self.tail = None

    def add_in_tail(self, item):
        if self.head is None:
            self.head = item
        else:
            self.tail.next = item
        self.tail = item
        return self

    def print_all_nodes(self):
        node = self.head
        while node is not None:
            print(node.value)
            node = node.next

    def find(self, val):
        node = self.head
        while node is not None:
            if node.value == val:
                return node
            node = node.next
        return None

    def delete(self, val, all=False):
        node = self.head
        prev_node = None
        while node is not None:
            if node.value == val:
                if not prev_node:
                    self.head = node.next
                    node = node.next
                    if not node:
                        self.tail = None
                    if not all:
                        return True
                    continue
                prev_node.next = node.next
                node = node.next
                if not node:
                    self.tail = prev_node
                if not all:
                    return True
                continue
            prev_node = node
            node = node.next
        return None

    def clean(self):
        self.__init__()

    def find_all(self, value):
        node = self.head
        found_nodes = []
        while node is not None:
            if node.value == value:
                found_nodes.append(node)
            node = node.next
        return found_nodes

    def len(self):
        node = self.head
        len = 0
        while node is not None:
            len += 1
            node = node.next
        return len

    def insert(self, afterNode, newNode):
        node = self.head
        if afterNode is None:
            if node is None:
                self.add_in_tail(newNode)
                return
            self.head = newNode
            self.head.next = node
            return

        while node is not None:
            if node.value == afterNode.value:
                new_node = newNode
                if node.next is None:
                    self.tail = new_node
                new_node.next = node.next
                node.next = new_node
                return
            node = node.next
