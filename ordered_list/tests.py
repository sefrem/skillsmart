import unittest

from ordered_list import OrderedList, OrderedStringList


def get_list_values(list):
    values = []
    node = list.head
    while node is not None:
        values.append((node.prev.value if node.prev else None, node.value))
        if node.next is None:
            values.append((node.value, None))
        node = node.next

    return values


class TestOrderedList(unittest.TestCase):

    def assert_lists_equality(self, list1, list2):
        self.assertEqual(get_list_values(list1), get_list_values(list2))

    def test_adding_item_to_empty_list(self):
        ordered_list = OrderedList(True)
        ordered_list.add(1)

        self.assertEqual([(None, 1), (1, None)], get_list_values(ordered_list))
        self.assertEqual(1, ordered_list.head.value)
        self.assertEqual(1, ordered_list.tail.value)

    def test_adding_2_items_to_empty_list(self):
        ordered_list = OrderedList(True)
        ordered_list.add(1)
        ordered_list.add(2)

        self.assertEqual([(None, 1), (1, 2), (2, None)], get_list_values(ordered_list))
        self.assertEqual(1, ordered_list.head.value)
        self.assertEqual(2, ordered_list.tail.value)

    def test_adding_2_items_to_empty_asc_list_second_lower(self):
        ordered_list = OrderedList(True)
        ordered_list.add(2)
        ordered_list.add(1)

        self.assertEqual([(None, 1), (1, 2), (2, None)], get_list_values(ordered_list))
        self.assertEqual(1, ordered_list.head.value)
        self.assertEqual(2, ordered_list.tail.value)

    def test_adding_2_items_to_empty_desc_list_second_greater(self):
        ordered_list = OrderedList(False)
        ordered_list.add(2)
        ordered_list.add(1)

        self.assertEqual([(None, 2), (2, 1), (1, None)], get_list_values(ordered_list))
        self.assertEqual(2, ordered_list.head.value)
        self.assertEqual(1, ordered_list.tail.value)

    def test_adding_item_asc_order(self):
        ordered_list = OrderedList(True)
        ordered_list.add(1)
        ordered_list.add(2)
        ordered_list.add(4)
        ordered_list.add(3)

        self.assertEqual([(None, 1), (1, 2), (2, 3), (3, 4), (4, None)], get_list_values(ordered_list))
        self.assertEqual(1, ordered_list.head.value)
        self.assertEqual(4, ordered_list.tail.value)

    def test_adding_item_desc_order(self):
        ordered_list = OrderedList(False)
        ordered_list.add(1)
        ordered_list.add(4)
        ordered_list.add(2)

        self.assertEqual([(None, 4), (4, 2), (2, 1), (1, None)], get_list_values(ordered_list))
        self.assertEqual(4, ordered_list.head.value)
        self.assertEqual(1, ordered_list.tail.value)

    def test_adding_same_value_asc_order(self):
        ordered_list = OrderedList(True)
        ordered_list.add(4)
        ordered_list.add(2)
        ordered_list.add(2)
        ordered_list.add(1)

        self.assertEqual([(None, 1), (1, 2), (2, 2), (2, 4), (4, None)], get_list_values(ordered_list))
        self.assertEqual(1, ordered_list.head.value)
        self.assertEqual(4, ordered_list.tail.value)

    def test_adding_same_values_as_tail(self):
        ordered_list = OrderedList(True)
        ordered_list.add(1)
        ordered_list.add(2)
        ordered_list.add(2)

        self.assertEqual([(None, 1), (1, 2), (2, 2), (2, None)], get_list_values(ordered_list))
        self.assertEqual(1, ordered_list.head.value)
        self.assertEqual(2, ordered_list.tail.value)

    def test_adding_few_values_desc_order(self):
        ordered_list = OrderedList(False)
        ordered_list.add(2)
        ordered_list.add(1)
        ordered_list.add(4)
        ordered_list.add(3)
        ordered_list.add(90)

        self.assertEqual([(None, 90), (90, 4), (4, 3), (3, 2), (2, 1), (1, None)], get_list_values(ordered_list))
        self.assertEqual(90, ordered_list.head.value)
        self.assertEqual(1, ordered_list.tail.value)

    def test_find_element_by_value(self):
        ordered_list = OrderedList(True)
        ordered_list.add(2)
        ordered_list.add(1)
        ordered_list.add(4)
        ordered_list.add(3)
        ordered_list.add(90)

        self.assertEqual(4, ordered_list.find(4).value)

    def test_not_found_element(self):
        ordered_list = OrderedList(True)
        ordered_list.add(2)
        ordered_list.add(1)
        ordered_list.add(4)

        self.assertEqual(None, ordered_list.find(24))

    def test_deleting_element(self):
        ordered_list = OrderedList(True)
        ordered_list.add(1)
        ordered_list.add(4)
        ordered_list.add(2)

        ordered_list.delete(4)

        self.assertEqual([(None, 1), (1, 2), (2, None)], get_list_values(ordered_list))
        self.assertEqual(1, ordered_list.head.value)
        self.assertEqual(2, ordered_list.tail.value)

    def test_deleting_element_from_empty_list(self):
        ordered_list = OrderedList(True)

        self.assertEqual(None, ordered_list.delete(23))

    def test_deleting_two_first_elements(self):
        ordered_list = OrderedList(False)
        ordered_list.add(1)
        ordered_list.add(4)
        ordered_list.add(2)

        ordered_list.delete(4)
        ordered_list.delete(2)

        self.assertEqual([(None, 1), (1, None)], get_list_values(ordered_list))
        self.assertEqual(1, ordered_list.head.value)
        self.assertEqual(1, ordered_list.tail.value)

    def test_clean(self):
        ordered_list = OrderedList(False)
        ordered_list.add(1)
        ordered_list.add(4)
        ordered_list.add(2)

        ordered_list.clean(True)

        self.assertEqual([], get_list_values(ordered_list))

    def test_get_length(self):
        ordered_list = OrderedList(True)
        ordered_list.add(1)
        ordered_list.add(4)
        ordered_list.delete(4)
        ordered_list.add(5)
        ordered_list.add(5)
        ordered_list.add(6)
        ordered_list.add(8)

        self.assertEqual(5, ordered_list.len())


class TestOrderedListString(unittest.TestCase):

    def test_adding_asc_order(self):
        ordered_list = OrderedStringList(True)
        ordered_list.add('c')
        ordered_list.add(' ba ')
        ordered_list.add('a')

        self.assertEqual([(None, 'a'), ('a', ' ba '), (' ba ', 'c'), ('c', None)], get_list_values(ordered_list))
        self.assertEqual('a', ordered_list.head.value)
        self.assertEqual('c', ordered_list.tail.value)

    def test_adding_desc_order(self):
        ordered_list = OrderedStringList(False)
        ordered_list.add('g')
        ordered_list.add(' wx')
        ordered_list.add('z')

        self.assertEqual([(None, 'z'), ('z', ' wx'), (' wx', 'g'), ('g', None)], get_list_values(ordered_list))
        self.assertEqual('z', ordered_list.head.value)
        self.assertEqual('g', ordered_list.tail.value)
