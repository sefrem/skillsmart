import unittest

from data_structures_pt_2.bbst.bbst import GenerateBBSTArray


class TestGenerateBBst(unittest.TestCase):


    def test_generate_bbst(self):
        test_tree = [82, 31, 50, 64, 75, 43, 92, 62, 37, 55, 25, 22, 84, 20, 15]
        expected_tree = [50, 25, 75, 20, 37, 62, 84, 15, 22, 31, 43, 55, 64, 82, 92]

        self.assertEqual(expected_tree, GenerateBBSTArray(test_tree))

    def test_generate_bbst_from_empty_array(self):
        self.assertEqual([], GenerateBBSTArray([]))

    def test_generate_bbst_from_array_with_one_node(self):
        self.assertEqual([1], GenerateBBSTArray([1]))

    def test_generate_bbst_from_array_with_two_nodes(self):
        self.assertEqual([50, 25], GenerateBBSTArray([25, 50]))

    def test_generate_bbst_from_array_with_three_nodes(self):
        self.assertEqual([50, 25, 75], GenerateBBSTArray([25, 50, 75]))

    def test_generate_bbst_from_array_with_four_nodes(self):
        self.assertEqual([50, 25, 75, 15, 30, 60, 85], GenerateBBSTArray([25, 50, 15, 75, 85, 30, 60]))