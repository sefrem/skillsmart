import unittest


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
            self.head = Node(newNode)
            self.head.next = node
            if self.tail is None:
                self.tail = Node(newNode)
            return

        while node is not None:
            if node.value == afterNode:
                new_node = Node(newNode)
                if node.next is None:
                    self.tail = new_node
                new_node.next = node.next
                node.next = new_node
                return
            node = node.next


def make_list(linked_list_a, linked_list_b):
    if linked_list_a.len() == linked_list_b.len():
        new_list = LinkedList()
        node_a = linked_list_a.head
        node_b = linked_list_b.head
        while node_a is not None:
            new_list.add_in_tail(Node(node_a.value + node_b.value))
            node_a = node_a.next
            node_b = node_b.next
        return new_list
    return None


def get_list_values(list):
    values = []
    node = list.head
    while node is not None:
        values.append(node.value)
        node = node.next
    return values


class TestLinkedList(unittest.TestCase):
    def setUp(self):
        self.list = LinkedList() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(36))

    def assert_lists_equality(self, list1, list2):
        self.assertEqual(get_list_values(list1), get_list_values(list2))

    def test_removal_of_one_node_from_the_middle(self):
        """
        Тестирует удаление одного узла из середины списка
        """
        expected_list = LinkedList() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(36))

        self.list.delete(48)

        self.assert_lists_equality(expected_list, self.list)

    def test_removal_of_multiple_nodes_from_the_middle(self):
        """
        Тестирует удаление нескольких узлов из середины списка
        """
        expected_list = LinkedList() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(36))

        self.list.delete(48, True)

        self.assert_lists_equality(expected_list, self.list)

    def test_removal_of_multiple_consecutive_nodes_from_the_middle(self):
        """
        Тестирует удаление нескольких последовательных узлов из середины списка
        """
        test_list = LinkedList() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(36)) \
            .add_in_tail(Node(36)) \
            .add_in_tail(Node(36)) \
            .add_in_tail(Node(24))

        expected_list = LinkedList() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(24))

        test_list.delete(36, True)

        self.assert_lists_equality(expected_list, test_list)

    def test_removal_of_one_node_from_the_beginning(self):
        """
        Тестирует удаление одного узла из начала списка
        """
        test_list = LinkedList() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(36))

        expected_list = LinkedList() \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(36))

        test_list.delete(12)

        self.assert_lists_equality(expected_list, test_list)
        self.assertEqual(test_list.head.value, expected_list.head.value)

    def test_removal_of_multiple_nodes_from_the_beginning(self):
        """
        Тестирует удаление нескольких узлов из начала списка
        """
        test_list = LinkedList() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(36))

        expected_list = LinkedList() \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(36))

        test_list.delete(12, True)

        self.assert_lists_equality(expected_list, test_list)
        self.assertEqual(test_list.head.value, expected_list.head.value)

    def test_removal_of_multiple_consecutive_nodes_from_the_beginning(self):
        """
        Тестирует удаление нескольких последовательных узлов из начала списка
        """
        test_list = LinkedList() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(36))

        expected_list = LinkedList() \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(36))

        test_list.delete(12, True)

        self.assert_lists_equality(expected_list, test_list)
        self.assertEqual(test_list.head.value, expected_list.head.value)

    def test_removal_of_one_element_from_the_end(self):
        """
        Тестирует удаление одного элемента с конца списка
        """
        test_list = LinkedList() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(36))

        expected_list = LinkedList() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(24))

        test_list.delete(36)

        self.assert_lists_equality(expected_list, test_list)
        self.assertEqual(test_list.tail.value, expected_list.tail.value)

    def test_removal_of_multiple_elements_from_the_end(self):
        """
        Тестирует удаление нескольких элементов с конца списка
        """
        test_list = LinkedList() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(36)) \
            .add_in_tail(Node(36))

        expected_list = LinkedList() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(24))

        test_list.delete(36, True)

        self.assert_lists_equality(expected_list, test_list)
        self.assertEqual(test_list.tail.value, expected_list.tail.value)

    def test_removal_of_one_element_from_list_with_one_node(self):
        """
        Тестирует удаление одного элемента из списка длиной 1
        """
        test_list = LinkedList().add_in_tail(Node(12))
        expected_list = LinkedList()

        test_list.delete(12)

        self.assert_lists_equality(expected_list, test_list)
        self.assertEqual(test_list.head, expected_list.head)
        self.assertEqual(test_list.tail, expected_list.tail)

    def test_removal_of_multiple_elements_from_list_with_one_node(self):
        """
        Тестирует удаление нескольких элементов из списка длиной 1
        """
        test_list = LinkedList().add_in_tail(Node(12))
        expected_list = LinkedList()

        test_list.delete(12, True)

        self.assert_lists_equality(expected_list, test_list)
        self.assertEqual(test_list.head, expected_list.head)
        self.assertEqual(test_list.tail, expected_list.tail)

    def test_removal_of_one_element_from_empty_list(self):
        """
        Тестирует удаление элемента из пустого списка
        """
        test_list = LinkedList()
        expected_list = LinkedList()

        test_list.delete(12)

        self.assert_lists_equality(expected_list, test_list)

    def test_removal_of_multiple_elements_from_empty_list(self):
        """
        Тестирует удаление нескольких элементов из пустого списка
        """
        test_list = LinkedList()
        expected_list = LinkedList()

        test_list.delete(12, True)

        self.assert_lists_equality(expected_list, test_list)

    def test_clean_list(self):
        """
        Тестирует метод очистки всего списка
        """
        expected_list = LinkedList()

        self.list.clean()

        self.assert_lists_equality(expected_list, self.list)

    def test_find_all_nodes_by_value(self):
        """
        Тестирует поиск всех узлов списка по определенному значению.
        """
        found_nodes = self.list.find_all(48)

        expected = [Node(48), Node(48)]

        self.assertEqual(len(found_nodes), 2)
        for i in range(len(found_nodes)):
            self.assertEqual(found_nodes[i].value, expected[i].value)

    def test_find_non_existent_node(self):
        """
        Тестирует поиск несуществующего узла
        """
        found_nodes = self.list.find_all(100)

        self.assertEqual(len(found_nodes), 0)

    def test_find_node_in_list_with_single_node(self):
        """
        Тестирует поиск узлов в списке из одного узла
        """
        test_list = LinkedList().add_in_tail(Node(12))
        found_nodes = test_list.find_all(12)

        self.assertEqual(len(found_nodes), 1)
        self.assertEqual(found_nodes[0].value, test_list.head.value)

    def test_finding_list_length(self):
        """
        Тестирует метод получение длины списка
        """
        list_length = self.list.len()

        self.assertEqual(list_length, 5)

    def test_finding_empty_list_length(self):
        """
        Тестирует получение длины пустого списка
        """
        test_list = LinkedList()
        list_length = test_list.len()

        self.assertEqual(list_length, 0)

    def test_inserting_node_in_middle_of_list(self):
        """
        Тестирует добавление узла в середину списка
        """
        self.list.insert(24, 100)

        expected_list = LinkedList() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(100)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(36))

        self.assert_lists_equality(expected_list, self.list)

    def test_inserting_node_in_end_of_list(self):
        """
        Тестирует добавление узла в конец списка
        """
        self.list.insert(36, 100)

        expected_list = LinkedList() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(36)) \
            .add_in_tail(Node(100))

        self.assert_lists_equality(expected_list, self.list)
        self.assertEqual(self.list.tail.value, expected_list.tail.value)

    def test_inserting_node_in_beginning_of_list(self):
        """
        Тестирует добавление узла в начало списка
        """
        self.list.insert(None, 100)

        expected_list = LinkedList() \
            .add_in_tail(Node(100)) \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(36)) \

        self.assert_lists_equality(expected_list, self.list)
        self.assertEqual(self.list.head.value, expected_list.head.value)

    def test_inserting_node_in_beginning_of_empty_list(self):
        """
        Тестирует добавление узла в начала пустого списка
        """
        test_list = LinkedList()
        expected_list = LinkedList().add_in_tail(Node(100))

        test_list.insert(None, 100)

        self.assert_lists_equality(expected_list, test_list)
        self.assertEqual(test_list.head.value, expected_list.head.value)
        self.assertEqual(test_list.tail.value, expected_list.tail.value)
