import unittest

from data_structures_pt_2.heap.heap import Heap


class TestHeap(unittest.TestCase):

    def test_create_heap_with_7_nodes(self):
        test_arr = [3, 6, 1, 8, 5, 2, 4]

        heap = Heap().MakeHeap(test_arr, 2)

        self.assertEqual([8, 6, 5, 4, 3, 2, 1], heap)

    def test_create_heap_with_one_node(self):
        test_arr = [5]

        heap = Heap().MakeHeap(test_arr, 0)

        self.assertEqual([5], heap)

    def test_get_max_value_from_2_level_heap(self):
        heap = Heap()
        heap.MakeHeap([3, 6, 1, 8, 5, 2, 4], 2)

        max = heap.GetMax()

        self.assertEqual(8, max)
        self.assertEqual([6, 4, 5, 1, 3, 2, None], heap.HeapArray)
