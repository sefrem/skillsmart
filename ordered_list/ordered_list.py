class Node:
    def __init__(self, v):
        self.value = v
        self.prev = None
        self.next = None


class OrderedList:
    def __init__(self, asc):
        self.head = None
        self.tail = None
        self.__ascending = asc

    def compare(self, v1, v2):
        if v1 < v2:
            return -1
        if v1 > v2:
            return 1
        return 0

    def add(self, value):
        item = Node(value)
        if self.head is None:
            self.head = item
            item.prev = None
            item.next = None
            self.tail = item
            return

        node = self.head

        while node is not None:
            if self.__ascending:
                if self.compare(value, self.tail.value) == 1:
                    item.prev = self.tail
                    item.next = None
                    self.tail.next = item
                    self.tail = item
                    break

                if self.compare(node.value, value) == 1:
                    item.prev = node.prev
                    item.next = node
                    if node.prev is None:
                        self.head = item
                    else:
                        node.prev.next = item
                    node.prev = item
                    break
            else:
                if self.compare(value, self.head.value) == 1:
                    item.next = self.head
                    item.prev = None
                    self.head.prev = item
                    self.head = item
                    break

                if self.compare(node.value, value) == 1:
                    item.prev = node
                    item.next = node.next
                    if node.next is None:
                        self.tail = item
                    else:
                        node.next.prev = item
                    node.next = item
                    break

            node = node.next

    def find(self, val):
        node = self.head

        while node is not None:
            if (self.__ascending and node.value > val) \
                    or (not self.__ascending and node.value < val):
                return None
            if node.value == val:
                return node
            node = node.next

        return None

    def delete(self, val):
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
                    return

                if node.next is None:
                    node.prev.next = None
                    self.tail = node.prev
                    return

                node.prev.next = node.next
                node.next.prev = node.prev

            node = node.next

    def clean(self, asc):
        self.__ascending = asc
        self.head = None
        self.tail = None

    def len(self):
        node = self.head
        len = 0
        while node is not None:
            len += 1
            node = node.next
        return len

    def get_all(self):
        r = []
        node = self.head
        while node != None:
            r.append(node)
            node = node.next
        return r


class OrderedStringList(OrderedList):
    def __init__(self, asc):
        super(OrderedStringList, self).__init__(asc)

    def compare(self, v1, v2):
        stripped_v1 = v1.strip()
        stripped_v2 = v2.strip()
        if stripped_v1 < stripped_v2:
            return -1
        if stripped_v1 > stripped_v2:
            return 1
        return 0
