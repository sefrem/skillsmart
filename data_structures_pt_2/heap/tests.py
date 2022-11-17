import unittest

from data_structures_pt_2.heap.heap import Heap


class TestHeap(unittest.TestCase):

    def test_create_heap_empty_arr(self):
        test_arr = []

        heap = Heap().MakeHeap(test_arr, 0)

        self.assertEqual([], heap)

    def test_create_heap_with_7_nodes(self):
        test_arr = [1, 2, 6, 4, 8, 5, 3]

        heap = Heap().MakeHeap(test_arr, 2)

        self.assertEqual([8, 6, 5, 1, 4, 2, 3], heap)

    def test_create_heap_with_one_node(self):
        test_arr = [5]

        heap = Heap().MakeHeap(test_arr, 0)

        self.assertEqual([5], heap)

    def test_get_max_value_from_2_level_heap(self):
        heap = Heap()
        heap.MakeHeap([3, 6, 1, 8, 5, 2, 4], 2)

        self.assertEqual([8, 6, 4, 3, 5, 1, 2], heap.HeapArray)
        max = heap.GetMax()

        self.assertEqual(8, max)
        self.assertEqual([6, 5, 4, 3, 2, 1, None], heap.HeapArray)

    def test_find_max_in_empty_heap(self):
        heap = Heap()

        self.assertEqual(-1, heap.GetMax())

    def test_add_node_to_heap(self):
        heap = Heap()
        heap.HeapArray = [6, 5, 4, 3, 2, 1, None]

        heap.Add(8)

        self.assertEqual([8, 5, 6, 3, 2, 1, 4], heap.HeapArray)

    def test_add_node_to_full_heap(self):
        heap = Heap()
        heap.HeapArray = [6, 5, 4, 3, 2, 1]

        self.assertFalse(heap.Add(12))