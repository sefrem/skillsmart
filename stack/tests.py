import unittest

from stack import Stack


class TestStack(unittest.TestCase):

    def test_push_to_stack(self):
        test_stack = Stack()
        expected_stack = [1, 2, 3]

        test_stack.push(1).push(2).push(3)

        for i in range(len(expected_stack)):
            self.assertEqual(expected_stack[i], test_stack.stack[i])


    def test_pop_from_stack(self):
        test_stack = Stack().push(1).push(2).push(3)
        expected_stack = [1, 2]

        item = test_stack.pop()

        self.assertEqual(item, 3)
        for i in range(len(expected_stack)):
            self.assertEqual(expected_stack[i], test_stack.stack[i])