import unittest

from data_structures_pt_2.bst.bst import BST, BSTNode, BSTFind


class TestBST(unittest.TestCase):

    def setUp(self):
        self.tree = BST(BSTNode(10, 10, None))

    def test_find_node_in_empty_tree(self):
        tree = BST(None)

        found_node = tree.FindNodeByKey(10)

        self.assertIsNone(found_node.Node)
        self.assertFalse(found_node.NodeHasKey)
        self.assertFalse(found_node.ToLeft)

    def test_find_node_in_tree_with_one_node(self):
        found_node = self.tree.FindNodeByKey(10)

        self.assertIsInstance(found_node, BSTFind)
        self.assertEqual(10, found_node.Node.NodeKey)
        self.assertEqual(10, found_node.Node.NodeValue)
        self.assertIsNone(found_node.Node.Parent)
        self.assertTrue(found_node.NodeHasKey)
        self.assertFalse(found_node.ToLeft)

    def test_find_node_in_tree_with_multiple_nodes(self):
        left_child = BSTNode(5, 5, self.tree.Root)
        right_child = BSTNode(15, 15, self.tree.Root)
        self.tree.Root.LeftChild = left_child
        self.tree.Root.RightChild = right_child

        found_node = self.tree.FindNodeByKey(5)

        self.assertEqual(5, found_node.Node.NodeKey)
        self.assertEqual(5, found_node.Node.NodeValue)
        self.assertTrue(10, found_node.Node.Parent.NodeValue)
        self.assertTrue(found_node.NodeHasKey)
        self.assertFalse(found_node.ToLeft)

    def test_do_not_find_node_add_left(self):
        found_node = self.tree.FindNodeByKey(8)

        self.assertIsInstance(found_node, BSTFind)
        self.assertEqual(10, found_node.Node.NodeValue)
        self.assertEqual(10, found_node.Node.NodeKey)
        self.assertIsNone(found_node.Node.Parent)
        self.assertFalse(found_node.NodeHasKey)
        self.assertTrue(found_node.ToLeft)

    def test_do_not_find_node_add_right(self):
        found_node = self.tree.FindNodeByKey(12)

        self.assertIsInstance(found_node, BSTFind)
        self.assertEqual(10, found_node.Node.NodeValue)
        self.assertEqual(10, found_node.Node.NodeKey)
        self.assertIsNone(found_node.Node.Parent)
        self.assertFalse(found_node.NodeHasKey)
        self.assertFalse(found_node.ToLeft)

    def test_add_key_that_is_not_in_tree_on_left(self):
        self.assertFalse(self.tree.FindNodeByKey(5).NodeHasKey)

        self.tree.AddKeyValue(5, 5)

        found_node = self.tree.FindNodeByKey(5)
        self.assertIsInstance(found_node, BSTFind)
        self.assertEqual(5, found_node.Node.NodeValue)
        self.assertEqual(5, found_node.Node.NodeKey)
        self.assertEqual(10, found_node.Node.Parent.NodeValue)

    def test_add_key_that_is_not_in_tree_on_right(self):
        self.assertFalse(self.tree.FindNodeByKey(15).NodeHasKey)

        self.tree.AddKeyValue(15, 15)

        found_node = self.tree.FindNodeByKey(15)
        self.assertIsInstance(found_node, BSTFind)
        self.assertEqual(15, found_node.Node.NodeValue)
        self.assertEqual(15, found_node.Node.NodeKey)
        self.assertEqual(10, found_node.Node.Parent.NodeValue)

    def test_add_node_that_is_in_tree(self):
        self.assertFalse(self.tree.AddKeyValue(10, 10))

    def test_find_min_key_search_from_root(self):
        self.tree.AddKeyValue(5, 5)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(4, 4)
        self.tree.AddKeyValue(2, 2)
        self.tree.AddKeyValue(20, 20)

        min_node = self.tree.FinMinMax(None, False)

        self.assertEqual(2, min_node.Node.NodeValue)
        self.assertEqual(2, min_node.Node.NodeKey)
        self.assertEqual(4, min_node.Node.Parent.NodeValue)

    def test_find_max_key_search_from_root(self):
        self.tree.AddKeyValue(5, 5)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(4, 4)
        self.tree.AddKeyValue(2, 2)
        self.tree.AddKeyValue(20, 20)

        min_node = self.tree.FinMinMax(None, True)

        self.assertEqual(20, min_node.Node.NodeValue)
        self.assertEqual(20, min_node.Node.NodeKey)
        self.assertEqual(15, min_node.Node.Parent.NodeValue)

    def test_find_min_search_from_node(self):
        self.tree.AddKeyValue(9, 9)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(7, 7)
        self.tree.AddKeyValue(8, 8)
        self.tree.AddKeyValue(3, 3)
        self.tree.AddKeyValue(5, 5)
        self.tree.AddKeyValue(4, 4)
        self.tree.AddKeyValue(6, 6)

        min_node = self.tree.FinMinMax(5, False)

        self.assertEqual(4, min_node.Node.NodeValue)
        self.assertEqual(4, min_node.Node.NodeKey)
        self.assertEqual(5, min_node.Node.Parent.NodeValue)

    def test_find_max_search_from_node(self):
        self.tree.AddKeyValue(3, 3)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(12, 12)
        self.tree.AddKeyValue(11, 11)
        self.tree.AddKeyValue(13, 13)
        self.tree.AddKeyValue(14, 14)
        self.tree.AddKeyValue(18, 18)
        self.tree.AddKeyValue(16, 16)

        min_node = self.tree.FinMinMax(13, True)

        self.assertEqual(14, min_node.Node.NodeValue)
        self.assertEqual(14, min_node.Node.NodeKey)
        self.assertEqual(13, min_node.Node.Parent.NodeValue)

    def test_remove_node_with_zero_children(self):
        self.tree.AddKeyValue(5, 5)

        found_node_before = self.tree.FindNodeByKey(5)
        self.assertEqual(5, found_node_before.Node.NodeValue)

        result = self.tree.DeleteNodeByKey(5)
        self.assertTrue(result)
        found_node = self.tree.FindNodeByKey(5)
        self.assertEqual(10, found_node.Node.NodeValue)
        self.assertFalse(found_node.NodeHasKey)
        self.assertTrue(found_node.ToLeft)

    def test_remove_node_with_one_child(self):
        self.tree.AddKeyValue(5, 5)
        self.tree.AddKeyValue(4, 4)

        found_node_before = self.tree.FindNodeByKey(5)
        self.assertEqual(5, found_node_before.Node.NodeValue)

        result = self.tree.DeleteNodeByKey(5)
        self.assertTrue(result)

        found_node_after = self.tree.FindNodeByKey(5)
        self.assertEqual(4, found_node_after.Node.NodeValue)
        self.assertFalse(found_node_after.NodeHasKey)
        self.assertFalse(found_node_after.ToLeft)

        found_new_child = self.tree.FindNodeByKey(4)
        self.assertEqual(4, found_new_child.Node.NodeValue)
        self.assertEqual(found_node_before.Node.Parent.NodeValue, found_new_child.Node.Parent.NodeValue)

    def test_remove_node_with_two_children(self):
        self.tree.AddKeyValue(3, 3)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(12, 12)
        self.tree.AddKeyValue(11, 11)
        self.tree.AddKeyValue(13, 13)
        self.tree.AddKeyValue(14, 14)
        self.tree.AddKeyValue(18, 18)
        self.tree.AddKeyValue(16, 16)

        found_node = self.tree.FindNodeByKey(15)
        self.assertTrue(found_node.NodeHasKey)

        result = self.tree.DeleteNodeByKey(15)
        self.assertTrue(result)

        deleted_node = self.tree.FindNodeByKey(15)
        self.assertFalse(deleted_node.NodeHasKey)

        replacing_node = self.tree.FindNodeByKey(16)
        self.assertEqual(16, replacing_node.Node.NodeValue)
        self.assertEqual(10, replacing_node.Node.Parent.NodeValue)
        self.assertEqual(18, replacing_node.Node.RightChild.NodeValue)

    def test_remove_node_with_one_right_child(self):
        self.tree.AddKeyValue(3, 3)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(11, 11)
        self.tree.AddKeyValue(19, 19)
        self.tree.AddKeyValue(17, 17)
        self.tree.AddKeyValue(14, 14)
        self.tree.AddKeyValue(18, 18)
        self.tree.AddKeyValue(12, 12)
        self.tree.AddKeyValue(13, 13)

        found_node = self.tree.FindNodeByKey(15)
        self.assertTrue(found_node.NodeHasKey)

        result = self.tree.DeleteNodeByKey(15)
        self.assertTrue(result)

        deleted_node = self.tree.FindNodeByKey(15)
        self.assertFalse(deleted_node.NodeHasKey)

        replacing_node = self.tree.FindNodeByKey(17)
        self.assertEqual(17, replacing_node.Node.NodeValue)
        self.assertEqual(10, replacing_node.Node.Parent.NodeValue)
        self.assertEqual(19, replacing_node.Node.RightChild.NodeValue)

    def test_remove_non_existent_node(self):
        self.tree.AddKeyValue(3, 3)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(11, 11)

        result = self.tree.DeleteNodeByKey(20)

        self.assertFalse(result)

    def test_remove_some_node(self):
        self.tree.AddKeyValue(3, 3)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(11, 11)
        self.tree.AddKeyValue(19, 19)
        self.tree.AddKeyValue(17, 17)
        self.tree.AddKeyValue(14, 14)
        self.tree.AddKeyValue(18, 18)
        self.tree.AddKeyValue(12, 12)
        self.tree.AddKeyValue(13, 13)

        result = self.tree.DeleteNodeByKey(11)
        self.assertTrue(result)

        deleted_node = self.tree.FindNodeByKey(11)
        self.assertFalse(deleted_node.NodeHasKey)

    def test_delete_root_from_tree_with_only_root(self):
        result = self.tree.DeleteNodeByKey(10)
        self.assertTrue(result)
        self.assertFalse(self.tree.FindNodeByKey(10).NodeHasKey)

    def test_delete_root_from_tree(self):
        self.tree.AddKeyValue(5, 5)
        self.tree.AddKeyValue(4, 4)

        result = self.tree.DeleteNodeByKey(10)

        self.assertTrue(result)

        self.assertEqual(5, self.tree.Root.NodeValue)
        self.assertIsNone(self.tree.Root.Parent)

    def test_delete_root_from_tree_with_one_right_child(self):
        self.tree.AddKeyValue(5, 5)

        result = self.tree.DeleteNodeByKey(10)

        self.assertTrue(result)

        self.assertEqual(5, self.tree.Root.NodeValue)
        self.assertIsNone(self.tree.Root.Parent)
        self.assertIsNone(self.tree.Root.LeftChild)
        self.assertIsNone(self.tree.Root.RightChild)

    def test_delete_root_from_balanced_tree(self):
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(5, 5)

        result = self.tree.DeleteNodeByKey(10)

        self.assertTrue(result)

        self.assertEqual(15, self.tree.Root.NodeValue)

        self.assertIsNone(self.tree.Root.RightChild)
        self.assertEqual(5, self.tree.Root.LeftChild.NodeKey)
        self.assertEqual(2, self.tree.Count())

    def test_delete_root_from_tree_with_2_nodes_on_right(self):
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(25, 25)

        result = self.tree.DeleteNodeByKey(10)

        self.assertTrue(result)

        self.assertEqual(15, self.tree.Root.NodeValue)

        self.assertEqual(25, self.tree.Root.RightChild.NodeValue)

    def test_delete_root_from_tree_with_multiple_levels_of_right_children(self):
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(14, 14)
        self.tree.AddKeyValue(16, 16)
        self.tree.AddKeyValue(13, 13)

        result = self.tree.DeleteNodeByKey(10)

        self.assertTrue(result)

        self.assertEqual(15, self.tree.Root.NodeKey)

        self.assertEqual(4, self.tree.Count())

    def test_delete_root_from_tree_with_multiple_levels_of_right_children_and_a_left_child(self):
        self.tree.AddKeyValue(5, 5)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(14, 14)
        self.tree.AddKeyValue(16, 16)
        self.tree.AddKeyValue(13, 13)

        result = self.tree.DeleteNodeByKey(10)

        self.assertTrue(result)

        self.assertEqual(13, self.tree.Root.NodeKey)

        self.assertEqual(5, self.tree.Count())

    def test_delete_root_from_tree_with_multiple_levels_of_right_children_and_left(self):
        self.tree.AddKeyValue(5, 5)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(14, 14)
        self.tree.AddKeyValue(16, 16)
        self.tree.AddKeyValue(13, 13)

        result = self.tree.DeleteNodeByKey(10)

        self.assertTrue(result)

        self.assertEqual(13, self.tree.Root.NodeValue)
        self.assertEqual(5, self.tree.Count())

    def test_count_tree_with_zero_nodes(self):
        tree = BST(None)

        self.assertEqual(0, tree.Count())

    def test_count_tree_with_one_node(self):
        self.assertEqual(1, self.tree.Count())

    def test_count_tree_with_two_nodes(self):
        self.tree.AddKeyValue(15, 15)
        self.assertEqual(2, self.tree.Count())

    def test_count_tree_with_multiple_nodes(self):
        self.tree.AddKeyValue(3, 3)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(11, 11)
        self.tree.AddKeyValue(19, 19)
        self.tree.AddKeyValue(17, 17)
        self.tree.AddKeyValue(14, 14)
        self.tree.AddKeyValue(18, 18)
        self.tree.AddKeyValue(12, 12)
        self.tree.AddKeyValue(13, 13)

        self.assertEqual(10, self.tree.Count())

    def test_count_tree_after_deletion(self):
        self.tree.AddKeyValue(3, 3)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(11, 11)
        self.tree.AddKeyValue(19, 19)
        self.tree.AddKeyValue(17, 17)
        self.tree.AddKeyValue(14, 14)
        self.tree.AddKeyValue(18, 18)
        self.tree.AddKeyValue(12, 12)
        self.tree.AddKeyValue(13, 13)

        self.assertEqual(10, self.tree.Count())

        self.assertTrue(self.tree.DeleteNodeByKey(11))

        self.assertEqual(9, self.tree.Count())

    def test_delete_node_and_add_values(self):
        self.tree.AddKeyValue(5, 5)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(14, 14)
        self.tree.AddKeyValue(3, 3)
        self.tree.AddKeyValue(2, 2)
        self.tree.AddKeyValue(16, 16)

        self.assertEqual(7, self.tree.Count())

        self.assertTrue(self.tree.DeleteNodeByKey(5))
        self.assertEqual(6, self.tree.Count())
        self.assertTrue(self.tree.DeleteNodeByKey(10))
        self.assertEqual(5, self.tree.Count())
        self.assertEqual(14, self.tree.Root.NodeKey)

        self.tree.AddKeyValue(10, 10)

        self.assertEqual(6, self.tree.Count())






