import unittest

from queue import Queue
from task import turn_queue, StackQueue


def get_queue_values(queue):
    values = []
    node = queue.queue.head

    while node is not None:
        values.append(node.value)
        node = node.next
    return values


class TestQueue(unittest.TestCase):

    def assert_queues_equality(self, queue_1, queue_2):
        self.assertEqual(get_queue_values(queue_1), get_queue_values(queue_2))

    def test_enqueue_few_items(self):
        queue = Queue()

        queue.enqueue(1).enqueue(2).enqueue(3)

        self.assertEqual([1, 2, 3], get_queue_values(queue))

    def test_dequeue_one_item(self):
        queue = Queue().enqueue(1).enqueue(2).enqueue(3)

        item = queue.dequeue()

        self.assertEqual(1, item)
        self.assertEqual([2, 3], get_queue_values(queue))

    def test_dequeue_few_items(self):
        queue = Queue().enqueue(1).enqueue(2).enqueue(3)

        item_1 = queue.dequeue()
        item_2 = queue.dequeue()

        self.assertEqual(1, item_1)
        self.assertEqual(2, item_2)
        self.assertEqual([3], get_queue_values(queue))

    def test_dequeue_empty_queue(self):
        self.assertEqual(None, Queue().dequeue())

    def test_get_queue_size(self):
        queue = Queue().enqueue(1).enqueue(2).enqueue(3)

        self.assertEqual(3, queue.size())

    def test_get_empty_queue_size(self):
        queue = Queue()

        self.assertEqual(0, queue.size())


class TestQueueTask(unittest.TestCase):

    def assert_queues_equality(self, queue_1, queue_2):
        self.assertEqual(get_queue_values(queue_1), get_queue_values(queue_2))

    def setUp(self):
        self.queue = Queue().enqueue(1).enqueue(2).enqueue(3).enqueue(4).enqueue(5)

    def test_queue_turn_2(self):
        expected_queue = Queue().enqueue(3).enqueue(4).enqueue(5).enqueue(2).enqueue(1)

        test_queue = turn_queue(self.queue, 2)

        self.assert_queues_equality(expected_queue, test_queue)

    def test_queue_turn_4(self):
        expected_queue = Queue().enqueue(5).enqueue(4).enqueue(3).enqueue(2).enqueue(1)

        test_queue = turn_queue(self.queue, 4)

        self.assert_queues_equality(expected_queue, test_queue)

    def test_queue_turn_all(self):
        expected_queue = Queue().enqueue(5).enqueue(4).enqueue(3).enqueue(2).enqueue(1)

        test_queue = turn_queue(self.queue, 5)

        self.assert_queues_equality(expected_queue, test_queue)

    def test_queue_turn_greater_than_length(self):
        test_queue = turn_queue(self.queue, 6)

        self.assertEqual(None, test_queue)


class TestStackQueue(unittest.TestCase):

    def test_enqueue_one_item(self):
        queue = StackQueue()

        queue.enqueue(1)

        self.assertEqual([1], queue.stack_out.stack)

    def test_enqueue_few_items(self):
        queue = StackQueue().enqueue(1).enqueue(2).enqueue(3)

        self.assertEqual([2, 3], queue.stack_in.stack)
        self.assertEqual([1], queue.stack_out.stack)

    def test_dequeue_one_item(self):
        queue = StackQueue().enqueue(1).enqueue(2).enqueue(3)

        item = queue.dequeue()

        self.assertEqual(1, item)
        self.assertEqual([3, 2], queue.stack_out.stack)

    def test_dequeue_few_items(self):
        queue = StackQueue().enqueue(1).enqueue(2).enqueue(3)

        item_1 = queue.dequeue()
        item_2 = queue.dequeue()

        self.assertEqual(1, item_1)
        self.assertEqual(2, item_2)
        self.assertEqual([3], queue.stack_out.stack)

    def test_dequeue_empty_queue(self):
        self.assertEqual(None, StackQueue().dequeue())

    def test_get_queue_size_with_3_items(self):
        queue = StackQueue().enqueue(1).enqueue(2).enqueue(3)

        self.assertEqual(3, queue.size())

    def test_get_queue_size_with_1_item(self):
        queue = StackQueue().enqueue(1)

        self.assertEqual(1, queue.size())

    def test_get_empty_queue_size(self):
        queue = StackQueue()

        self.assertEqual(0, queue.size())
