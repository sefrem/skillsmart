import unittest

from dynamic_array import DynArray


class TestDynamicArray(unittest.TestCase):

    def test_insert_item_capacity_not_exceeded(self):
        expected_array = DynArray().append(1).append(2).append(4).append(3)
        test_array = DynArray().append(1).append(2).append(3)

        test_array.insert(2, 4)

        for i in range(expected_array.count):
            self.assertEqual(expected_array[i], test_array[i])
        self.assertEqual(expected_array.capacity, test_array.capacity)
        self.assertEqual(expected_array.count, test_array.count)

    def test_insert_item_capacity_exceeded(self):
        expected_array = DynArray().append(1).append(2).append(3).append(4).append(5).append(6) \
            .append(7).append(8).append(9).append(100).append(10).append(11).append(12) \
            .append(13).append(14).append(15).append(16)
        test_array = DynArray().append(1).append(2).append(3).append(4).append(5).append(6) \
            .append(7).append(8).append(9).append(10).append(11).append(12) \
            .append(13).append(14).append(15).append(16)

        test_array.insert(9, 100)

        for i in range(expected_array.count):
            self.assertEqual(expected_array[i], test_array[i])
        self.assertEqual(expected_array.capacity, test_array.capacity)
        self.assertEqual(expected_array.count, test_array.count)

    def test_insert_item_as_last(self):
        expected_array = DynArray().append(1).append(2).append(3).append(4)
        test_array = DynArray().append(1).append(2).append(3)

        test_array.insert(test_array.count, 4)

        for i in range(expected_array.count):
            self.assertEqual(expected_array[i], test_array[i])

    def test_insert_in_out_of_range_position(self):
        test_array = DynArray().append(1).append(2).append(3)
        with self.assertRaises(IndexError):
            test_array.insert(8, 10)

    def test_remove_item(self):
        test_array = DynArray().append(1).append(2).append(3)
        expected_array = DynArray().append(1).append(3)

        test_array.delete(1)

        for i in range(expected_array.count):
            self.assertEqual(test_array[i], expected_array[i])
        self.assertEqual(expected_array.capacity, test_array.capacity)
        self.assertEqual(expected_array.count, test_array.count)

    def test_remove_item_shrinks_capacity(self):
        test_array = DynArray().append(1).append(2).append(3).append(4).append(5).append(6) \
            .append(7).append(8).append(9).append(10).append(11).append(12) \
            .append(13).append(14).append(15).append(16).append(17)
        expected_array = DynArray().append(1).append(2).append(3).append(4) \
            .append(7).append(8).append(9).append(10).append(11) \
            .append(12).append(13).append(14).append(15).append(16).append(17)
        expected_array.capacity = 21

        test_array.delete(4)
        test_array.delete(4)

        for i in range(expected_array.count):
            self.assertEqual(test_array[i], expected_array[i])
        self.assertEqual(expected_array.count, test_array.count)
        self.assertEqual(expected_array.capacity, test_array.capacity)

    def test_delete_in_out_of_range_position(self):
        test_array = DynArray().append(1).append(2).append(3)
        with self.assertRaises(IndexError):
            test_array.delete(8)

    def test_remove_from_empty_array(self):
        test_array = DynArray()

        with self.assertRaises(IndexError):
            test_array.delete(0)
        self.assertEqual(test_array.count, 0)