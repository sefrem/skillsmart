import unittest

from linked_list_2 import LinkedList2, Node


def get_list_values(list):
    values = []
    node = list.head
    while node is not None:
        values.append((node.prev.value if node.prev else None, node.value))
        if node.next is None:
            values.append((node.value, None))
        node = node.next

    return values


class TestLinkedList2(unittest.TestCase):
    def setUp(self):
        self.list = LinkedList2() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(36))

    def assert_lists_equality(self, list1, list2):
        self.assertEqual(get_list_values(list1), get_list_values(list2))

    def test_find_one_node_in_list(self):
        found_node = self.list.find(48)

        self.assertEqual(found_node.value, Node(48).value)

    def test_find_non_existent_node(self):
        found_node = self.list.find(100)

        self.assertEqual(found_node, None)

    def test_find_all_nodes(self):
        found_nodes = self.list.find_all(48)

        self.assertEqual(len(found_nodes), 2)
        for node in found_nodes:
            self.assertEqual(node.value, 48)

    def test_deleting_one_node_from_the_middle(self):
        expected_list = LinkedList2() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(36))

        self.list.delete(48)

        self.assert_lists_equality(expected_list, self.list)

    def test_deleting_one_node_from_the_beginning(self):
        expected_list = LinkedList2() \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(36))

        self.list.delete(12)

        self.assert_lists_equality(expected_list, self.list)

    def test_deleting_one_node_from_the_end(self):
        test_list = LinkedList2().add_in_tail(Node(12)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(48))
        expected_list = LinkedList2() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(24)) \

        test_list.delete(48)
        last_node = test_list.find(24)

        self.assert_lists_equality(expected_list, test_list)
        self.assertEqual(test_list.tail.value, expected_list.tail.value)
        self.assertEqual(None, last_node.next)

    def test_deleting_one_node_from_list_with_single_node(self):
        test_list = LinkedList2().add_in_tail(Node(12))
        expected_list = LinkedList2()

        test_list.delete(12)

        self.assert_lists_equality(expected_list, test_list)
        self.assertEqual(expected_list.head, test_list.head)
        self.assertEqual(expected_list.tail, test_list.tail)

    def test_deleting_multiple_nodes_from_the_middle(self):
        expected_list = LinkedList2() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(36))

        self.list.delete(48, True)

        self.assert_lists_equality(expected_list, self.list)

    def test_deleting_multiple_consecutive_nodes_from_the_middle(self):
        test_list = LinkedList2() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(36)) \
            .add_in_tail(Node(36)) \
            .add_in_tail(Node(36)) \
            .add_in_tail(Node(24))

        expected_list = LinkedList2() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(24))

        test_list.delete(36, True)

        self.assert_lists_equality(expected_list, test_list)

    def test_deleting_multiple_nodes_from_the_beginning(self):
        """
        Тестирует удаление нескольких узлов из начала списка
        """
        test_list = LinkedList2() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(36))

        expected_list = LinkedList2() \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(36))

        test_list.delete(12, True)

        self.assert_lists_equality(expected_list, test_list)
        self.assertEqual(test_list.head.value, expected_list.head.value)

    def test_deleting_multiple_consecutive_nodes_from_the_beginning(self):
        test_list = LinkedList2() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(36))

        expected_list = LinkedList2() \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(36))

        test_list.delete(12, True)

        self.assert_lists_equality(expected_list, test_list)
        self.assertEqual(test_list.head.value, expected_list.head.value)

    def test_deleting_of_multiple_nodes_from_the_end(self):
        """
        Тестирует удаление нескольких элементов с конца списка
        """
        test_list = LinkedList2() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(36)) \
            .add_in_tail(Node(36))

        expected_list = LinkedList2() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(24))

        test_list.delete(36, True)

        self.assert_lists_equality(expected_list, test_list)
        self.assertEqual(test_list.tail.value, expected_list.tail.value)

    def test_deleting_of_multiple_nodes_from_list_with_one_node(self):
        test_list = LinkedList2().add_in_tail(Node(12))
        expected_list = LinkedList2()

        test_list.delete(12, True)

        self.assert_lists_equality(expected_list, test_list)
        self.assertEqual(test_list.head, expected_list.head)
        self.assertEqual(test_list.tail, expected_list.tail)

    def test_removal_of_one_node_from_empty_list(self):
        test_list = LinkedList2()
        expected_list = LinkedList2()

        test_list.delete(12)

        self.assert_lists_equality(expected_list, test_list)

    def test_removal_of_multiple_nodes_from_empty_list(self):
        test_list = LinkedList2()
        expected_list = LinkedList2()

        test_list.delete(12, True)

        self.assert_lists_equality(expected_list, test_list)

    def test_inserting_node_in_middle_of_list(self):
        expected_list = LinkedList2() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(100)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(36))

        self.list.insert(Node(24), Node(100))

        self.assert_lists_equality(expected_list, self.list)

    def test_inserting_node_in_end_of_list(self):
        expected_list = LinkedList2() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(36)) \
            .add_in_tail(Node(100))

        self.list.insert(Node(36), Node(100))

        self.assert_lists_equality(expected_list, self.list)
        self.assertEqual(self.list.tail.value, expected_list.tail.value)

    def test_inserting_node_when_after_node_not_passed(self):
        expected_list = LinkedList2() \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(36)) \
            .add_in_tail(Node(100))

        self.list.insert(None, Node(100))


        self.assert_lists_equality(expected_list, self.list)
        self.assertEqual(self.list.tail.value, expected_list.tail.value)

    def test_inserting_node_empty_list(self):
        test_list = LinkedList2()
        expected_list = LinkedList2().add_in_tail(Node(100))

        test_list.insert(None, Node(100))

        self.assert_lists_equality(expected_list, test_list)
        self.assertEqual(test_list.head.value, expected_list.head.value)
        self.assertEqual(test_list.tail.value, expected_list.tail.value)

    def test_adding_node_in_head(self):
        expected_list = LinkedList2() \
            .add_in_tail(Node(100)) \
            .add_in_tail(Node(12)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(24)) \
            .add_in_tail(Node(48)) \
            .add_in_tail(Node(36))

        self.list.add_in_head(Node(100))

        self.assert_lists_equality(expected_list, self.list)
        self.assertEqual(self.list.head.value, expected_list.head.value)

    def test_clean_list(self):
        expected_list = LinkedList2()

        self.list.clean()

        self.assert_lists_equality(expected_list, self.list)

    def test_finding_list_length(self):
        list_length = self.list.len()

        self.assertEqual(list_length, 5)

    def test_finding_empty_list_length(self):
        test_list_length = LinkedList2().len()

        self.assertEqual(test_list_length, 0)