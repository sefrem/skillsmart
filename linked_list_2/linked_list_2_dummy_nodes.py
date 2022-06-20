class Node:
    def __init__(self, v):
        self.value = v
        self.prev = None
        self.next = None


class LinkedList2:
    def __init__(self):
        self.dummy = Node(False)
        self.dummy.next = self.dummy
        self.dummy.prev = self.dummy

    def add_in_tail(self, item):
        if self.dummy.next is self.dummy:
            item.prev = self.dummy
            item.next = self.dummy
            self.dummy.next = item
            self.dummy.prev = item
        else:
            item.prev = self.dummy.prev
            item.next = self.dummy
            self.dummy.prev.next = item
            self.dummy.prev = item

        return self

    def find(self, val):
        node = self.dummy.next
        while node.value is not False:
            if node.value == val:
                return node
            node = node.next
        return None

    def find_all(self, val):
        found_nodes = []
        node = self.dummy.next
        while node.value is not False:
            if node.value == val:
                found_nodes.append(node)
            node = node.next
        return found_nodes

    def delete(self, val, all=False):
        node = self.dummy.next
        while node.value is not False:
            if node.value == val:
                node.prev.next = node.next
                node.next.prev = node.prev
                if not all:
                    return

            node = node.next

    def insert(self, afterNode, newNode):
        node = self.dummy.next
        if node.value is False or afterNode is None:
            self.add_in_tail(newNode)
            return
        while node.value is not False:
            if node.value == afterNode.value:
                newNode.prev = node
                newNode.next = node.next
                node.next.prev = newNode
                node.next = newNode

            node = node.next

    def add_in_head(self, newNode):
        newNode.next = self.dummy.next
        newNode.prev = self.dummy
        self.dummy.next.prev = newNode
        self.dummy.next = newNode

    def clean(self):
        self.__init__()

    def len(self):
        node = self.dummy.next
        len = 0
        while node.value is not False:
            len += 1
            node = node.next
        return len
