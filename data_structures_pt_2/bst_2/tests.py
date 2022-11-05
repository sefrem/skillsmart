import unittest

from data_structures_pt_2.bst_2.bst_2 import aBST


class TestABST(unittest.TestCase):

    def setUp(self):
        self.treeOneLvl = aBST(1)
        self.treeOneLvl.Tree = [50, 25, 75]
        self.treeTwoLvls = aBST(2)
        self.treeTwoLvls.Tree = [50, 25, 75, None, 37, 62, 84]

    def test_init_abst_with_only_root(self):
        tree = aBST(0)

        self.assertEqual(1, len(tree.Tree))

    def test_init_abst_for_depth_1(self):
        tree = aBST(1)

        self.assertEqual(3, len(tree.Tree))

    def test_init_abst_for_depth_2(self):
        tree = aBST(2)

        self.assertEqual(7, len(tree.Tree))

    def test_init_abst_for_depth_3(self):
        tree = aBST(3)

        self.assertEqual(15, len(tree.Tree))

    def test_find_left_child_on_level_1(self):
        index = self.treeOneLvl.FindKeyIndex(25)

        self.assertEqual(1, index)

    def test_find_right_child_on_level_1(self):
        index = self.treeOneLvl.FindKeyIndex(75)

        self.assertEqual(2, index)

    def test_find_non_existent_node(self):
        index = self.treeOneLvl.FindKeyIndex(99)

        self.assertIsNone(index)

    def test_find_place_for_left_child_on_level_1(self):
        tree = aBST(1)
        tree.Tree = [10, None, 15]

        index = tree.FindKeyIndex(5)
        self.assertEqual(index, -1)

    def test_find_place_for_right_child_on_level_1(self):
        tree = aBST(1)
        tree.Tree = [10, 5, None]

        index = tree.FindKeyIndex(15)
        self.assertEqual(index, -2)

    def test_find_left_child_on_level_2(self):
        index = self.treeTwoLvls.FindKeyIndex(62)

        self.assertEqual(5, index)

    def test_find_right_child_on_level_2(self):
        index = self.treeTwoLvls.FindKeyIndex(84)

        self.assertEqual(6, index)

    def test_find_place_for_left_child_level_2(self):
        index = self.treeTwoLvls.FindKeyIndex(14)

        self.assertEqual(-3, index)

    def test_find_non_existent_node_level_2(self):
        index = self.treeTwoLvls.FindKeyIndex(26)

        self.assertIsNone(index)

    def test_find_node_in_empty_tree(self):
        tree = aBST(0)

        index = tree.FindKeyIndex(10)

        self.assertEqual(0, index)

    def test_add_key_that_does_not_exist(self):
        index = self.treeTwoLvls.AddKey(24)

        self.assertEqual(3, index)
        self.assertEqual([50, 25, 75, 24, 37, 62, 84], self.treeTwoLvls.Tree)

    def test_add_key_as_root(self):
        tree = aBST(0)
        index = tree.AddKey(10)

        self.assertEqual(0, index)
        self.assertEqual([10], tree.Tree)

    def test_add_keys_out_of_range(self):
        index_1 = self.treeTwoLvls.AddKey(24)
        index_2 = self.treeTwoLvls.AddKey(36)
        index_3 = self.treeTwoLvls.AddKey(12)

        self.assertEqual(3, index_1)
        self.assertEqual(-1, index_2)
        self.assertEqual(-1, index_3)

    def test_build_3_lvl_tree(self):
        tree = aBST(3)

        tree.AddKey(50)
        tree.AddKey(75)
        tree.AddKey(25)
        tree.AddKey(84)
        tree.AddKey(37)
        tree.AddKey(62)
        tree.AddKey(92)
        tree.AddKey(31)
        tree.AddKey(55)
        tree.AddKey(43)

        expected_tree = [50, 25, 75, None, 37, 62, 84, None, None, 31, 43, 55, None, None, 92]
        self.assertEqual(expected_tree, tree.Tree)

    def test_add_existing_key(self):
        index_1 = self.treeTwoLvls.AddKey(50)
        index_2 = self.treeTwoLvls.AddKey(75)

        self.assertEqual(0, index_1)
        self.assertEqual(2, index_2)
