import unittest

from tree import SimpleTreeNode, SimpleTree


def get_node(tree: SimpleTree, value):
    if tree.Root.NodeValue == value:
        return tree.Root

    index = 0
    nodes_to_visit = tree.Root.Children.copy()
    while index < len(nodes_to_visit):
        current_node = nodes_to_visit[index]
        if current_node.NodeValue == value:
            return current_node
        nodes_to_visit.extend(current_node.Children)
        index += 1

    return None


class TestSimpleTree(unittest.TestCase):
    def setUp(self):
        self.tree = SimpleTree(SimpleTreeNode(1, None))

    def test_creating_tree_node(self):
        test_value = 1
        test_parent = None
        node = SimpleTreeNode(test_value, test_parent)

        self.assertEqual(node.NodeValue, test_value)
        self.assertEqual(node.Parent, test_parent)
        self.assertEqual(node.Children, [])

    def test_creating_simple_tree(self):
        self.assertEqual(self.tree.Root.NodeValue, 1)
        self.assertEqual(self.tree.Root.Parent, None)
        self.assertEqual(self.tree.Root.Children, [])

    def test_adding_child(self):
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(2, None))

        parent_node = get_node(self.tree, 1)
        child_node = get_node(self.tree, 2)

        self.assertEqual(parent_node.NodeValue, 1)
        self.assertEqual(child_node.NodeValue, 2)
        self.assertEqual(parent_node.Children[0], child_node)
        self.assertEqual(child_node.Parent, parent_node)

    def test_adding_2_children_to_same_node(self):
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(2, None))
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(3, None))

        parent_node = get_node(self.tree, 1)
        child_node_1 = get_node(self.tree, 2)
        child_node_2 = get_node(self.tree, 3)

        self.assertEqual(child_node_1.Parent, parent_node)
        self.assertEqual(child_node_2.Parent, parent_node)
        for child in parent_node.Children:
            self.assertIn(child, (child_node_1, child_node_2))

    def test_adding_2_consecutive_nodes(self):
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(2, None))
        self.tree.AddChild(SimpleTreeNode(2, None), SimpleTreeNode(3, None))

        root_node = get_node(self.tree, 1)
        child_node_1 = get_node(self.tree, 2)
        child_node_2 = get_node(self.tree, 3)

        self.assertEqual(root_node.Children[0], child_node_1)
        self.assertEqual(child_node_1.Children[0], child_node_2)
        self.assertEqual(child_node_1.Parent, root_node)
        self.assertEqual(child_node_2.Parent, child_node_1)

    def test_removing_non_root_node(self):
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(2, None))
        self.tree.AddChild(SimpleTreeNode(2, None), SimpleTreeNode(3, None))

        self.tree.DeleteNode(SimpleTreeNode(2, None))

        self.assertIsNotNone(get_node(self.tree, 1))
        self.assertIsNone(get_node(self.tree, 2))
        self.assertIsNone(get_node(self.tree, 3))
        self.assertEqual(len(get_node(self.tree, 1).Children), 0)

    def test_get_nodes_of_single_root_tree(self):
        nodes = self.tree.GetAllNodes()

        self.assertEqual(nodes, [1])

    def test_get_nodes_one_child(self):
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(2, None))

        self.assertEqual(self.tree.GetAllNodes(), [1, 2])

    def test_get_nodes_two_children(self):
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(2, None))
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(3, None))

        self.assertEqual([1, 2, 3], self.tree.GetAllNodes())

    def test_get_multiple_nested_nodes(self):
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(2, None))
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(3, None))
        self.tree.AddChild(SimpleTreeNode(2, None), SimpleTreeNode(4, None))
        self.tree.AddChild(SimpleTreeNode(4, None), SimpleTreeNode(5, None))

        self.assertEqual([1, 2, 3, 4, 5], self.tree.GetAllNodes())

    def test_find_nodes_with_same_values(self):
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(2, None))
        self.tree.AddChild(SimpleTreeNode(2, None), SimpleTreeNode(4, None))
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(4, None))
        self.tree.AddChild(SimpleTreeNode(4, None), SimpleTreeNode(5, None))

        for node in self.tree.FindNodesByValue(4):
            self.assertEqual(4, node.NodeValue)

    def test_moving_node(self):
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(2, None))
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(3, None))
        self.tree.AddChild(SimpleTreeNode(2, None), SimpleTreeNode(4, None))
        self.tree.AddChild(SimpleTreeNode(4, None), SimpleTreeNode(5, None))

        self.tree.MoveNode(SimpleTreeNode(4, None), SimpleTreeNode(3, None))

        former_parent_node = get_node(self.tree, 2)
        parent_node = get_node(self.tree, 3)
        child_node = get_node(self.tree, 4)

        self.assertEqual(parent_node.NodeValue, child_node.Parent.NodeValue)
        self.assertEqual([], former_parent_node.Children)

    def test_nodes_count(self):
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(2, None))
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(3, None))
        self.tree.AddChild(SimpleTreeNode(2, None), SimpleTreeNode(4, None))
        self.tree.AddChild(SimpleTreeNode(4, None), SimpleTreeNode(5, None))

        self.assertEqual(5, self.tree.Count())

    def test_nodes_count_after_move(self):
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(2, None))
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(3, None))
        self.tree.AddChild(SimpleTreeNode(2, None), SimpleTreeNode(4, None))
        self.tree.AddChild(SimpleTreeNode(4, None), SimpleTreeNode(5, None))

        self.tree.MoveNode(SimpleTreeNode(4, None), SimpleTreeNode(3, None))

        self.assertEqual(5, self.tree.Count())

    def test_nodes_count_after_add_and_delete(self):
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(2, None))
        self.assertEqual(2, self.tree.Count())
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(3, None))
        self.assertEqual(3, self.tree.Count())
        self.tree.DeleteNode(SimpleTreeNode(3, None))
        self.assertEqual(2, self.tree.Count())

    def test_leaf_nodes_count(self):
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(2, None))
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(3, None))
        self.assertEqual(2, self.tree.LeafCount())
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(4, None))
        self.assertEqual(3, self.tree.LeafCount())
        self.tree.DeleteNode(SimpleTreeNode(3, None))
        self.assertEqual(2, self.tree.LeafCount())

    def test_leaf_count_of_single_element_tree(self):
        self.assertEqual(1, self.tree.LeafCount())

    def test_adding_level_to_nodes(self):
        self.tree.AddChild(SimpleTreeNode(1, None), SimpleTreeNode(2, None))
        self.tree.AddChild(SimpleTreeNode(2, None), SimpleTreeNode(3, None))
        self.tree.AddChild(SimpleTreeNode(3, None), SimpleTreeNode(4, None))
        self.tree.AddChild(SimpleTreeNode(4, None), SimpleTreeNode(5, None))

        self.tree.AddLevel()

        node_1 = get_node(self.tree, 1)
        node_2 = get_node(self.tree, 2)
        node_3 = get_node(self.tree, 3)
        node_4 = get_node(self.tree, 4)
        node_5 = get_node(self.tree, 5)

        self.assertEqual((1, 1), (node_1.NodeValue, node_1.Level))
        self.assertEqual((2, 2), (node_2.NodeValue, node_2.Level))
        self.assertEqual((3, 3), (node_3.NodeValue, node_3.Level))
        self.assertEqual((4, 4), (node_4.NodeValue, node_4.Level))
        self.assertEqual((5, 5), (node_5.NodeValue, node_5.Level))