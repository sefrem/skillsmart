class Node:
    def __init__(self, v):
        self.value = v
        self.prev = None
        self.next = None


class DummyNode:
    def __init__(self):
        self.value = False
        self.prev = None
        self.next = None


class LinkedList2:
    def __init__(self):
        self.dummyHead = DummyNode()
        self.dummyTail = DummyNode()
        self.dummyHead.next = self.dummyTail
        self.dummyTail.prev = self.dummyHead

    def add_in_tail(self, item):
        if isinstance(self.dummyHead.next, DummyNode):
            item.next = self.dummyTail
            item.prev = self.dummyHead
            self.dummyTail.prev = item
            self.dummyHead.next = item
        else:
            last_item = self.dummyTail.prev
            item.prev = last_item
            item.next = self.dummyTail
            last_item.next = item
            self.dummyTail.prev = item

        return self

    def find(self, val):
        node = self.dummyHead.next
        while isinstance(node, Node):
            if node.value == val:
                return node
            node = node.next
        return None

    def find_all(self, val):
        found_nodes = []
        node = self.dummyHead.next
        while isinstance(node, Node):
            if node.value == val:
                found_nodes.append(node)
            node = node.next
        return found_nodes

    def delete(self, val, all=False):
        node = self.dummyHead.next
        while isinstance(node, Node):
            if node.value == val:
                node.prev.next = node.next
                node.next.prev = node.prev
                if not all:
                    return

            node = node.next

    def insert(self, afterNode, newNode):
        node = self.dummyHead.next
        if isinstance(node, DummyNode) or afterNode is None:
            self.add_in_tail(newNode)
            return
        while isinstance(node, Node):
            if node.value == afterNode.value:
                newNode.prev = node
                newNode.next = node.next
                node.next.prev = newNode
                node.next = newNode

            node = node.next

    def add_in_head(self, newNode):
        newNode.next = self.dummyHead.next
        newNode.prev = self.dummyHead
        self.dummyHead.next.prev = newNode
        self.dummyHead.next = newNode

    def clean(self):
        self.__init__()

    def len(self):
        node = self.dummyHead.next
        len = 0
        while isinstance(node, Node):
            len += 1
            node = node.next
        return len
