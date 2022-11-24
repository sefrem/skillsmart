import unittest

from tree import SimpleTree, SimpleTreeNode


class TestEvenTrees(unittest.TestCase):

    def setUp(self):
        self.tree = SimpleTree(SimpleTreeNode(1, None))
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(2, None))
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(3, None))
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(6, None))
        self.tree.AddChild(SimpleTreeNode(2, None), SimpleTreeNode(5, None))
        self.tree.AddChild(SimpleTreeNode(2, None), SimpleTreeNode(7, None))
        self.tree.AddChild(SimpleTreeNode(3, None), SimpleTreeNode(4, None))
        self.tree.AddChild(SimpleTreeNode(6, None), SimpleTreeNode(8, None))
        self.tree.AddChild(SimpleTreeNode(8, None), SimpleTreeNode(9, None))
        self.tree.AddChild(SimpleTreeNode(8, None), SimpleTreeNode(10, None))

    def get_values(self, tree):
        result = []
        for node in tree:
            result.append(node.NodeValue)
        return result

    def test_even_trees(self):
        edges_to_remove = self.tree.EvenTrees()

        self.assertEqual([1, 3, 1, 6], self.get_values(edges_to_remove))

    def test_even_trees_2(self):
        self.tree = SimpleTree(SimpleTreeNode(1, None))
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(2, None))
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(3, None))
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(6, None))
        self.tree.AddChild(SimpleTreeNode(2, None), SimpleTreeNode(5, None))
        self.tree.AddChild(SimpleTreeNode(2, None), SimpleTreeNode(7, None))
        self.tree.AddChild(SimpleTreeNode(6, None), SimpleTreeNode(8, None))
        self.tree.AddChild(SimpleTreeNode(8, None), SimpleTreeNode(9, None))
        self.tree.AddChild(SimpleTreeNode(8, None), SimpleTreeNode(10, None))

        edges_to_remove = self.tree.EvenTrees()

        self.assertEqual([1, 6], self.get_values(edges_to_remove))

    def test_event_trees_3(self):
        self.tree.AddChild(SimpleTreeNode(4, None), SimpleTreeNode(11, None))

        edges_to_remove = self.tree.EvenTrees()

        self.assertEqual([3, 4, 1, 6], self.get_values(edges_to_remove))

    def test_event_trees_4(self):
        self.tree.AddChild(SimpleTreeNode(9, None), SimpleTreeNode(11, None))

        edges_to_remove = self.tree.EvenTrees()

        self.assertEqual([8, 9, 6, 8, 1, 3], self.get_values(edges_to_remove))
