import unittest

from data_structures_pt_2.balanced_bst.balanced_bst import BalancedBST, BSTNode


class TestBalancedBST(unittest.TestCase):

    def test_generate_tree_with_one_node(self):
        tree = BalancedBST().GenerateTree([1])

        self.assertIsInstance(tree, BSTNode)
        self.assertEqual(1, tree.NodeKey)
        self.assertEqual(0, tree.Level)
        self.assertIsNone(tree.Parent)
        self.assertIsNone(tree.LeftChild)
        self.assertIsNone(tree.RightChild)

    def test_generate_tree_with_three_nodes(self):
        tree = BalancedBST().GenerateTree([10, 5, 15])

        self.assertEqual(10, tree.NodeKey)
        self.assertEqual(0, tree.Level)
        self.assertEqual(5, tree.LeftChild.NodeKey)
        self.assertEqual(1, tree.LeftChild.Level)
        self.assertEqual(15, tree.RightChild.NodeKey)
        self.assertEqual(1, tree.RightChild.Level)

    def test_generate_tree_with_3_full_levels(self):
        tree = BalancedBST().GenerateTree([10, 5, 15, 8, 3, 18, 12])

        self.assertEqual(10, tree.NodeKey)
        self.assertEqual(0, tree.Level)

        self.assertEqual(5, tree.LeftChild.NodeKey)
        self.assertEqual(1, tree.LeftChild.Level)
        self.assertEqual(10, tree.LeftChild.Parent.NodeKey)

        self.assertEqual(15, tree.RightChild.NodeKey)
        self.assertEqual(1, tree.RightChild.Level)
        self.assertEqual(10, tree.RightChild.Parent.NodeKey)

        self.assertEqual(3, tree.LeftChild.LeftChild.NodeKey)
        self.assertEqual(2, tree.LeftChild.LeftChild.Level)
        self.assertEqual(5, tree.LeftChild.LeftChild.Parent.NodeKey)

        self.assertEqual(8, tree.LeftChild.RightChild.NodeKey)
        self.assertEqual(2, tree.LeftChild.RightChild.Level)
        self.assertEqual(5, tree.LeftChild.RightChild.Parent.NodeKey)

        self.assertEqual(12, tree.RightChild.LeftChild.NodeKey)
        self.assertEqual(2, tree.RightChild.LeftChild.Level)
        self.assertEqual(15, tree.RightChild.LeftChild.Parent.NodeKey)

        self.assertEqual(18, tree.RightChild.RightChild.NodeKey)
        self.assertEqual(2, tree.RightChild.RightChild.Level)
        self.assertEqual(15, tree.RightChild.RightChild.Parent.NodeKey)

    def test_is_balanced_tree_from_non_existent_node(self):
        balancedBst = BalancedBST()
        balancedBst.GenerateTree([10])

        self.assertFalse(balancedBst.IsBalanced(BSTNode(99, None)))

    def test_is_balanced_tree_only_root(self):
        balancedBst = BalancedBST()
        balancedBst.GenerateTree([10])

        self.assertTrue(balancedBst.IsBalanced(BSTNode(10, None)))

    def test_is_balanced_tree_one_child(self):
        balancedBst = BalancedBST()
        balancedBst.GenerateTree([10, 5])

        self.assertTrue(balancedBst.IsBalanced(BSTNode(10, None)))


    def test_is_balanced_tree_one_level(self):
        balancedBst = BalancedBST()
        balancedBst.GenerateTree([10, 5, 15])

        self.assertTrue(balancedBst.IsBalanced(BSTNode(10, None)))

    def test_is_balanced_tree_one_level_unbalanced(self):
        balancedBst = BalancedBST()
        balancedBst.GenerateTree([5, 7, 8, 10, 12, 15])
        node = balancedBst.GetNode(balancedBst.Root, 5)
        new_node_1 = BSTNode(4, node)
        new_node_1.Level = 3
        node.LeftChild = new_node_1
        new_node_2 = BSTNode(2, new_node_1)
        new_node_2.Level = 4
        new_node_1.LeftChild = new_node_2


        self.assertFalse(balancedBst.IsBalanced(BSTNode(7, None)))