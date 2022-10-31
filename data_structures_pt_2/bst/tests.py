import unittest

from data_structures_pt_2.bst.bst import BST, BSTNode, BSTFind


class TestBST(unittest.TestCase):

    def setUp(self):
        self.tree = BST(BSTNode(10, 10, None))
        self.tree_from_pic = BST(BSTNode(8, 8, None))
        self.tree_from_pic.AddKeyValue(4, 4)
        self.tree_from_pic.AddKeyValue(12, 12)
        self.tree_from_pic.AddKeyValue(2, 2)
        self.tree_from_pic.AddKeyValue(6, 6)
        self.tree_from_pic.AddKeyValue(10, 10)
        self.tree_from_pic.AddKeyValue(14, 14)
        self.tree_from_pic.AddKeyValue(1, 1)
        self.tree_from_pic.AddKeyValue(3, 3)
        self.tree_from_pic.AddKeyValue(5, 5)
        self.tree_from_pic.AddKeyValue(7, 7)
        self.tree_from_pic.AddKeyValue(9, 9)
        self.tree_from_pic.AddKeyValue(11, 11)
        self.tree_from_pic.AddKeyValue(13, 13)
        self.tree_from_pic.AddKeyValue(15, 15)

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
        self.assertEqual(10, found_node.Node.NodeKey)
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
        self.assertEqual(5, found_node.Node.NodeKey)
        self.assertTrue(10, found_node.Node.Parent.NodeKey)
        self.assertTrue(found_node.NodeHasKey)
        self.assertFalse(found_node.ToLeft)

    def test_do_not_find_node_add_left(self):
        found_node = self.tree.FindNodeByKey(8)

        self.assertIsInstance(found_node, BSTFind)
        self.assertEqual(10, found_node.Node.NodeKey)
        self.assertEqual(10, found_node.Node.NodeKey)
        self.assertIsNone(found_node.Node.Parent)
        self.assertFalse(found_node.NodeHasKey)
        self.assertTrue(found_node.ToLeft)

    def test_do_not_find_node_add_right(self):
        found_node = self.tree.FindNodeByKey(12)

        self.assertIsInstance(found_node, BSTFind)
        self.assertEqual(10, found_node.Node.NodeKey)
        self.assertEqual(10, found_node.Node.NodeKey)
        self.assertIsNone(found_node.Node.Parent)
        self.assertFalse(found_node.NodeHasKey)
        self.assertFalse(found_node.ToLeft)

    def test_add_key_to_empty_tree(self):
        tree = BST(None)

        tree.AddKeyValue(10, 10)

        self.assertEqual(10, tree.Root.NodeKey)
        self.assertIsNone(tree.Root.Parent)
        self.assertIsNone(tree.Root.LeftChild)
        self.assertIsNone(tree.Root.RightChild)

    def test_add_three_nodes_to_empty_tree(self):
        tree = BST(None)

        tree.AddKeyValue(10, 10)
        tree.AddKeyValue(5, 5)
        tree.AddKeyValue(15, 15)

        self.assertEqual(10, tree.Root.NodeKey)
        self.assertEqual(5, tree.Root.LeftChild.NodeKey)
        self.assertEqual(15, tree.Root.RightChild.NodeKey)

    def test_add_key_that_is_not_in_tree_on_left(self):
        self.assertFalse(self.tree.FindNodeByKey(5).NodeHasKey)

        self.tree.AddKeyValue(5, 5)

        found_node = self.tree.FindNodeByKey(5)
        self.assertIsInstance(found_node, BSTFind)
        self.assertEqual(5, found_node.Node.NodeKey)
        self.assertEqual(5, found_node.Node.NodeKey)
        self.assertEqual(10, found_node.Node.Parent.NodeKey)

    def test_add_key_that_is_not_in_tree_on_right(self):
        self.assertFalse(self.tree.FindNodeByKey(15).NodeHasKey)

        self.assertTrue(self.tree.AddKeyValue(15, 15))

        found_node = self.tree.FindNodeByKey(15)
        self.assertIsInstance(found_node, BSTFind)
        self.assertEqual(15, found_node.Node.NodeKey)
        self.assertEqual(15, found_node.Node.NodeKey)
        self.assertEqual(10, found_node.Node.Parent.NodeKey)

    def test_add_node_that_is_in_tree(self):
        self.assertFalse(self.tree.AddKeyValue(10, 10))

    def test_find_min_in_empty_tree(self):
        tree = BST(None)

        min_node = tree.FinMinMax(None, False)

        self.assertIsNone(min_node)

    def test_find_min_in_empty_tree_passed_root(self):
        tree = BST(None)

        min_node = tree.FinMinMax(BSTNode(20, 20, None), False)

        self.assertIsNone(min_node)

    def test_find_max_in_empty_tree(self):
        tree = BST(None)

        max_node = tree.FinMinMax(None, True)

        self.assertIsNone(max_node)

    def test_find_max_in_empty_tree_passed_root(self):
        tree = BST(None)

        max_node = tree.FinMinMax(BSTNode(10, 10, None), True)

        self.assertIsNone(max_node)

    def test_find_min_key_search_from_root(self):
        self.tree.AddKeyValue(5, 5)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(4, 4)
        self.tree.AddKeyValue(2, 2)
        self.tree.AddKeyValue(20, 20)

        min_node = self.tree.FinMinMax(None, False)

        self.assertEqual(2, min_node.NodeKey)
        self.assertEqual(4, min_node.Parent.NodeKey)

    def test_find_min_key_search_from_passed_root(self):
        self.tree.AddKeyValue(5, 5)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(4, 4)
        self.tree.AddKeyValue(2, 2)
        self.tree.AddKeyValue(20, 20)

        min_node = self.tree.FinMinMax(BSTNode(10, 10, None), False)

        self.assertEqual(2, min_node.NodeKey)
        self.assertEqual(4, min_node.Parent.NodeKey)

    def test_find_max_key_search_from_root(self):
        self.tree.AddKeyValue(5, 5)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(4, 4)
        self.tree.AddKeyValue(2, 2)
        self.tree.AddKeyValue(20, 20)

        max_node = self.tree.FinMinMax(None, True)

        self.assertEqual(20, max_node.NodeKey)
        self.assertEqual(15, max_node.Parent.NodeKey)

    def test_find_max_search_from_passed_root(self):
        max_node = self.tree_from_pic.FinMinMax(BSTNode(8, 8, None), True)

        self.assertEqual(15, max_node.NodeKey)

    def test_find_min_in_tree_from_pic_search_from_root(self):
        min_node = self.tree_from_pic.FinMinMax(None, False)

        self.assertEqual(1, min_node.NodeKey)
        self.assertEqual(2, min_node.Parent.NodeKey)

    def test_find_min_in_tree_from_pic_search_from_root_passed_as_node(self):
        min_node = self.tree_from_pic.FinMinMax(BSTNode(8, 8, None), False)

        self.assertEqual(1, min_node.NodeKey)
        self.assertEqual(2, min_node.Parent.NodeKey)

    def test_find_max_in_tree_from_pic_search_from_root(self):
        max_node = self.tree_from_pic.FinMinMax(None, True)

        self.assertEqual(15, max_node.NodeKey)
        self.assertEqual(14, max_node.Parent.NodeKey)

    def test_find_max_in_tree_from_pic_search_from_root_passed_as_node(self):
        max_node = self.tree_from_pic.FinMinMax(BSTNode(8, 8, None), True)

        self.assertEqual(15, max_node.NodeKey)
        self.assertEqual(14, max_node.Parent.NodeKey)

    def test_find_min_pic_tree_search_from_node(self):
        min_node = self.tree_from_pic.FinMinMax(BSTNode(12, 12, None), False)

        self.assertEqual(9, min_node.NodeKey)
        self.assertEqual(10, min_node.Parent.NodeKey)

    def test_find_min_pic_tree_search_from_non_existent_node(self):
        min_node = self.tree_from_pic.FinMinMax(BSTNode(100, 100, None), False)

        self.assertIsNone(min_node)

    def test_find_max_pic_tree_search_from_node(self):
        max_node = self.tree_from_pic.FinMinMax(BSTNode(4, 4, None), True)

        self.assertEqual(7, max_node.NodeKey)
        self.assertEqual(6, max_node.Parent.NodeKey)

    def test_find_max_pic_tree_search_from_non_existent_node(self):
        max_node = self.tree_from_pic.FinMinMax(BSTNode(400, 400, None), True)

        self.assertIsNone(max_node)

    def test_find_min_search_from_node(self):
        self.tree.AddKeyValue(9, 9)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(7, 7)
        self.tree.AddKeyValue(8, 8)
        self.tree.AddKeyValue(3, 3)
        self.tree.AddKeyValue(5, 5)
        self.tree.AddKeyValue(4, 4)
        self.tree.AddKeyValue(6, 6)

        min_node = self.tree.FinMinMax(BSTNode(5, 5, BSTNode(3, 3, None)), False)

        self.assertEqual(4, min_node.NodeKey)
        self.assertEqual(5, min_node.Parent.NodeKey)

    def test_find_min_search_from_node_with_wrong_parent(self):
        self.tree.AddKeyValue(9, 9)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(7, 7)
        self.tree.AddKeyValue(8, 8)
        self.tree.AddKeyValue(3, 3)
        self.tree.AddKeyValue(5, 5)
        self.tree.AddKeyValue(4, 4)
        self.tree.AddKeyValue(6, 6)

        min_node = self.tree.FinMinMax(BSTNode(5, 5, BSTNode(14, 14, None)), False)

        self.assertEqual(4, min_node.NodeKey)
        self.assertEqual(5, min_node.Parent.NodeKey)

    def test_find_max_search_from_node(self):
        self.tree.AddKeyValue(3, 3)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(12, 12)
        self.tree.AddKeyValue(11, 11)
        self.tree.AddKeyValue(13, 13)
        self.tree.AddKeyValue(14, 14)
        self.tree.AddKeyValue(18, 18)
        self.tree.AddKeyValue(16, 16)

        min_node = self.tree.FinMinMax(BSTNode(13, 13, None), True)

        self.assertEqual(14, min_node.NodeKey)
        self.assertEqual(13, min_node.Parent.NodeKey)

    def test_find_max_search_from_node_with_wrong_parent(self):
        self.tree.AddKeyValue(3, 3)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(12, 12)
        self.tree.AddKeyValue(11, 11)
        self.tree.AddKeyValue(13, 13)
        self.tree.AddKeyValue(14, 14)
        self.tree.AddKeyValue(18, 18)
        self.tree.AddKeyValue(16, 16)

        min_node = self.tree.FinMinMax(BSTNode(13, 13, BSTNode(99, 99, None)), True)

        self.assertEqual(14, min_node.NodeKey)
        self.assertEqual(13, min_node.Parent.NodeKey)

    def test_find_min_from_non_existent_node(self):
        self.tree.AddKeyValue(3, 3)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(18, 18)

        min_node = self.tree.FinMinMax(BSTNode(22, 22, BSTNode(13, 13, None)), False)

        self.assertIsNone(min_node)

    def test_find_msx_from_non_existent_node(self):
        self.tree.AddKeyValue(3, 3)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(18, 18)

        max_node = self.tree.FinMinMax(BSTNode(22, 22, None), False)

        self.assertIsNone(max_node)

    def test_find_node_from_node_passed_with_wrong_parent(self):
        self.tree.AddKeyValue(3, 3)
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(12, 12)
        self.tree.AddKeyValue(11, 11)
        self.tree.AddKeyValue(13, 13)
        self.tree.AddKeyValue(14, 14)
        self.tree.AddKeyValue(18, 18)
        self.tree.AddKeyValue(16, 16)

        min_node = self.tree.FinMinMax(BSTNode(13, 13, BSTNode(12, 12, BSTNode(99, 99, None))), True)

        self.assertEqual(14, min_node.NodeKey)
        self.assertEqual(13, min_node.Parent.NodeKey)

    def test_remove_node_from_empty_tree(self):
        tree = BST(None)

        self.assertFalse(tree.DeleteNodeByKey(10))

    def test_remove_node_with_zero_children(self):
        self.tree.AddKeyValue(5, 5)

        found_node_before = self.tree.FindNodeByKey(5)
        self.assertEqual(5, found_node_before.Node.NodeKey)

        result = self.tree.DeleteNodeByKey(5)
        self.assertTrue(result)
        found_node = self.tree.FindNodeByKey(5)
        self.assertEqual(10, found_node.Node.NodeKey)
        self.assertFalse(found_node.NodeHasKey)
        self.assertTrue(found_node.ToLeft)
        self.assertIsNone(self.tree.Root.LeftChild)
        self.assertIsNone(self.tree.Root.RightChild)
        self.assertEqual(1, self.tree.Count())

    def test_remove_node_with_one_child(self):
        self.tree.AddKeyValue(5, 5)
        self.tree.AddKeyValue(4, 4)

        found_node_before = self.tree.FindNodeByKey(5)
        self.assertEqual(5, found_node_before.Node.NodeKey)

        result = self.tree.DeleteNodeByKey(5)
        self.assertTrue(result)

        found_node_after = self.tree.FindNodeByKey(5)
        self.assertEqual(4, found_node_after.Node.NodeKey)
        self.assertFalse(found_node_after.NodeHasKey)
        self.assertFalse(found_node_after.ToLeft)

        found_new_child = self.tree.FindNodeByKey(4)
        self.assertEqual(4, found_new_child.Node.NodeKey)
        self.assertEqual(found_node_before.Node.Parent.NodeKey, found_new_child.Node.Parent.NodeKey)
        self.assertEqual(self.tree.Root.LeftChild.NodeKey, found_new_child.Node.NodeKey)

    def test_remove_node_with_two_children_from_tree_from_pic(self):
        self.tree_from_pic.AddKeyValue(16, 16)
        remove = self.tree_from_pic.DeleteNodeByKey(14)
        self.assertTrue(remove)

        replacing_node = self.tree_from_pic.FindNodeByKey(15)
        self.assertEqual(13, replacing_node.Node.LeftChild.NodeKey)
        self.assertEqual(15, replacing_node.Node.LeftChild.Parent.NodeKey)
        self.assertEqual(16, replacing_node.Node.RightChild.NodeKey)
        self.assertEqual(15, replacing_node.Node.RightChild.Parent.NodeKey)
        self.assertEqual(15, self.tree_from_pic.Count())

    def test_remove_node_from_tree_from_pic(self):
        removed = self.tree_from_pic.DeleteNodeByKey(12)

        self.assertTrue(removed)

        self.assertFalse(self.tree_from_pic.FindNodeByKey(12).NodeHasKey)
        self.assertEqual(13, self.tree_from_pic.Root.RightChild.NodeKey)
        self.assertEqual(8, self.tree_from_pic.Root.RightChild.Parent.NodeKey)

        replacing_node = self.tree_from_pic.FindNodeByKey(13)
        self.assertEqual(14, replacing_node.Node.RightChild.NodeKey)
        self.assertEqual(13, replacing_node.Node.RightChild.Parent.NodeKey)
        self.assertFalse(replacing_node.Node.RightChild.LeftChild)
        self.assertEqual(14, self.tree_from_pic.Count())

    def test_remove_root_from_tree_from_pic(self):
        removed = self.tree_from_pic.DeleteNodeByKey(8)

        self.assertTrue(removed)
        self.assertEqual(14, self.tree_from_pic.Count())
        self.assertIsNone(self.tree_from_pic.Root.Parent)
        self.assertEqual(4, self.tree_from_pic.Root.LeftChild.NodeKey)
        self.assertEqual(12, self.tree_from_pic.Root.RightChild.NodeKey)
        self.assertEqual(9, self.tree_from_pic.Root.LeftChild.Parent.NodeKey)
        self.assertEqual(9, self.tree_from_pic.Root.RightChild.Parent.NodeKey)

        self.assertIsNone(self.tree_from_pic.FindNodeByKey(10).Node.LeftChild)

    def test_remove_non_existing_node_from_tree_with_only_root(self):
        tree = BST(BSTNode(10, 10, None))

        removed = tree.DeleteNodeByKey(99)

        self.assertFalse(removed)

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
        self.assertEqual(16, replacing_node.Node.NodeKey)
        self.assertEqual(10, replacing_node.Node.Parent.NodeKey)
        self.assertEqual(18, replacing_node.Node.RightChild.NodeKey)
        self.assertEqual(10, self.tree.Root.NodeKey)

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
        self.assertEqual(17, replacing_node.Node.NodeKey)
        self.assertEqual(10, replacing_node.Node.Parent.NodeKey)
        self.assertEqual(19, replacing_node.Node.RightChild.NodeKey)

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

        replacing_node = self.tree.FindNodeByKey(14)
        self.assertEqual(15, replacing_node.Node.Parent.NodeKey)
        self.assertEqual(14, self.tree.FindNodeByKey(15).Node.LeftChild.NodeKey)

    def test_delete_root_from_tree_with_only_root(self):
        result = self.tree.DeleteNodeByKey(10)
        self.assertTrue(result)
        self.assertFalse(self.tree.FindNodeByKey(10).NodeHasKey)

    def test_delete_root_from_tree(self):
        self.tree.AddKeyValue(5, 5)
        self.tree.AddKeyValue(4, 4)

        result = self.tree.DeleteNodeByKey(10)

        self.assertTrue(result)

        self.assertEqual(5, self.tree.Root.NodeKey)
        self.assertEqual(4, self.tree.Root.LeftChild.NodeKey)
        self.assertEqual(5, self.tree.Root.LeftChild.Parent.NodeKey)
        self.assertIsNone(self.tree.Root.Parent)

    def test_delete_root_from_tree_with_one_right_child(self):
        self.tree.AddKeyValue(5, 5)

        result = self.tree.DeleteNodeByKey(10)

        self.assertTrue(result)

        self.assertEqual(5, self.tree.Root.NodeKey)
        self.assertIsNone(self.tree.Root.Parent)
        self.assertIsNone(self.tree.Root.LeftChild)
        self.assertIsNone(self.tree.Root.RightChild)

    def test_delete_root_from_balanced_tree(self):
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(5, 5)

        result = self.tree.DeleteNodeByKey(10)

        self.assertTrue(result)

        self.assertEqual(15, self.tree.Root.NodeKey)

        self.assertIsNone(self.tree.Root.RightChild)
        self.assertEqual(5, self.tree.Root.LeftChild.NodeKey)
        self.assertEqual(2, self.tree.Count())

    def test_delete_root_from_tree_with_2_nodes_on_right(self):
        self.tree.AddKeyValue(15, 15)
        self.tree.AddKeyValue(25, 25)

        result = self.tree.DeleteNodeByKey(10)

        self.assertTrue(result)

        self.assertEqual(15, self.tree.Root.NodeKey)

        self.assertEqual(25, self.tree.Root.RightChild.NodeKey)

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

        self.assertEqual(13, self.tree.Root.NodeKey)
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
