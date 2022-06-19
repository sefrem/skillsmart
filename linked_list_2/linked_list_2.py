class Node:
    def __init__(self, v):
        self.value = v
        self.prev = None
        self.next = None


class LinkedList2:
    def __init__(self):
        self.head = None
        self.tail = None

    def add_in_tail(self, item):
        if self.head is None:
            self.head = item
            item.prev = None
            item.next = None
        else:
            self.tail.next = item
            item.prev = self.tail
        self.tail = item
        return self

    def find(self, val):
        node = self.head
        while node is not None:
            if node.value == val:
                return node
            node = node.next
        return None

    def find_all(self, val):
        found_nodes = []
        node = self.head
        while node is not None:
            if node.value == val:
                found_nodes.append(node)
            node = node.next
        return found_nodes

    def delete(self, val, all=False):
        node = self.head
        while node is not None:
            if node.value == val:
                if node.prev is None and node.next is None:
                    self.head = None
                    self.tail = None
                    return

                if node.prev is None:
                    self.head = node.next
                    self.head.prev = None
                    if not all:
                        return
                    else:
                        node = node.next
                        continue

                if node.next is None:
                    node.prev.next = None
                    self.tail = node.prev
                    if not all:
                        return
                    else:
                        node = node.next
                        continue

                node.prev.next = node.next
                node.next.prev = node.prev

                if not all:
                    return

            node = node.next

    def insert(self, afterNode, newNode):
        node = self.head
        if afterNode is None and not self.head:
            self.add_in_tail(newNode)
            return
        while node is not None:
            if afterNode is None:
                self.add_in_tail(newNode)
                return
            if node.value == afterNode.value:
                newNode.prev = node
                newNode.next = node.next
                if node.next is None:
                    node.next = newNode
                    self.tail = newNode
                else:
                    node.next.prev = newNode
                    node.next = newNode
                return
            node = node.next

    def add_in_head(self, newNode):
        newNode.next = self.head
        self.head.prev = newNode
        self.head = newNode

    def clean(self):
        self.__init__()

    def len(self):
        node = self.head
        len = 0
        while node is not None:
            len += 1
            node = node.next
        return len
