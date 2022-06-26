import unittest

from stack_head import Stack as StackHeadTop
from stack_tail import Stack as StackTailTop


class TestStackTailTop(unittest.TestCase):

    def test_push_to_stack(self):
        test_stack = StackTailTop()
        expected_stack = [1, 2, 3]

        test_stack.push(1).push(2).push(3)

        for i in range(len(expected_stack)):
            self.assertEqual(expected_stack[i], test_stack.stack[i])

    def test_pop_from_stack(self):
        test_stack = StackTailTop().push(1).push(2).push(3)
        expected_stack = [1, 2]

        item = test_stack.pop()

        self.assertEqual(item, 3)
        for i in range(len(expected_stack)):
            self.assertEqual(expected_stack[i], test_stack.stack[i])

    def test_pop_empty_stack(self):
        test_stack = StackTailTop()

        item = test_stack.pop()

        self.assertEqual(None, item)

    def test_peek_stack(self):
        test_stack = StackTailTop().push(1).push(2).push(3)
        expected_stack = [1, 2, 3]

        self.assertEqual(3, test_stack.peek())
        for i in range(len(expected_stack)):
            self.assertEqual(expected_stack[i], test_stack.stack[i])

    def test_peek_empty_stack(self):
        test_stack = StackTailTop()

        self.assertEqual(None, test_stack.peek())

class TestStackHeadTop(unittest.TestCase):

    def test_push_to_stack(self):
        test_stack = StackHeadTop()
        expected_stack = [3, 2, 1]

        test_stack.push(1).push(2).push(3)

        for i in range(len(expected_stack)):
            self.assertEqual(expected_stack[i], test_stack.stack[i])

    def test_pop_from_stack(self):
        test_stack = StackHeadTop().push(1).push(2).push(3)
        expected_stack = [2, 1]

        item = test_stack.pop()

        self.assertEqual(item, 3)
        for i in range(len(expected_stack)):
            self.assertEqual(expected_stack[i], test_stack.stack[i])

    def test_pop_empty_stack(self):
        test_stack = StackHeadTop()

        item = test_stack.pop()

        self.assertEqual(None, item)

    def test_peek_stack(self):
        test_stack = StackHeadTop().push(1).push(2).push(3)
        expected_stack = [3, 2, 1]

        self.assertEqual(3, test_stack.peek())
        for i in range(len(expected_stack)):
            self.assertEqual(expected_stack[i], test_stack.stack[i])

    def test_peek_empty_stack(self):
        test_stack = StackHeadTop()

        self.assertEqual(None, test_stack.peek())