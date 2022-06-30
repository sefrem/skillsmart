import unittest

from deque import Deque


class TestDeque(unittest.TestCase):

    def test_add_front_one_elem(self):
        deque = Deque()

        deque.addFront(1)

        self.assertEqual([1], deque.deque)

    def test_add_front_two_elem(self):
        deque = Deque()

        deque.addFront(1)
        deque.addFront(2)

        self.assertEqual([2, 1], deque.deque)

    def test_add_tail_one_elem(self):
        deque = Deque()

        deque.addTail(1)

        self.assertEqual([1], deque.deque)

    def test_add_tail_two_elem(self):
        deque = Deque()

        deque.addTail(1)
        deque.addTail(2)

        self.assertEqual([1, 2], deque.deque)

    def test_add_front_and_tail(self):
        deque = Deque()

        deque.addFront(1)
        deque.addFront(2)
        deque.addTail(3)
        deque.addTail(4)

        self.assertEqual([2, 1, 3, 4], deque.deque)

    def test_get_size(self):
        deque = Deque()

        deque.addFront(1)
        deque.addFront(2)

        self.assertEqual(2, deque.size())

        deque.addTail(3)
        deque.addTail(4)

        self.assertEqual(4, deque.size())

        deque.removeFront()

        self.assertEqual(3, deque.size())


    def test_get_size_empty_deque(self):
        deque = Deque()

        self.assertEqual(0, deque.size())

    def test_remove_from_head(self):
        deque = Deque()

        deque.addTail(1)
        deque.addTail(2)
        item = deque.removeFront()

        self.assertEqual(1, item)
        self.assertEqual([2], deque.deque)

    def test_remove_from_head_empty_deque(self):
        deque = Deque()

        self.assertEqual(None, deque.removeFront())

    def test_remove_from_tail(self):
        deque = Deque()

        deque.addTail(1)
        deque.addTail(2)
        item = deque.removeTail()

        self.assertEqual(2, item)
        self.assertEqual([1], deque.deque)
        self.assertEqual(1, deque.size())

    def test_remove_from_tail_empty_deque(self):
        deque = Deque()

        self.assertEqual(None, deque.removeTail())