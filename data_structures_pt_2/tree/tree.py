class SimpleTreeNode:
    Level = 0

    def __init__(self, val, parent):
        self.NodeValue = val
        self.Parent = parent
        self.Children = []


class SimpleTree:

    def __init__(self, root):
        self.Root = root

    def AddChild(self, ParentNode, NewChild):
        parent_node = self.FindNodesByValue(ParentNode.NodeValue)[0]
        NewChild.Parent = parent_node
        parent_node.Children.append(NewChild)

    def DeleteNode(self, NodeToDelete):
        node_to_delete = self.FindNodesByValue(NodeToDelete.NodeValue)[0]
        node_to_delete.Parent.Children = [item for item in node_to_delete.Parent.Children if
                                          item.NodeValue != NodeToDelete.NodeValue]

    def GetAllNodes(self):
        nodes_list = [self.Root.NodeValue]

        index = 0
        nodes_to_visit = self.Root.Children.copy()
        while index < len(nodes_to_visit):
            current_node = nodes_to_visit[index]
            nodes_list.append(current_node.NodeValue)
            nodes_to_visit.extend(current_node.Children)
            index += 1

        return nodes_list

    def FindNodesByValue(self, val):
        if self.Root.NodeValue == val:
            return [self.Root]

        nodes = []
        index = 0
        nodes_to_visit = self.Root.Children.copy()
        while index < len(nodes_to_visit):
            current_node = nodes_to_visit[index]
            if current_node.NodeValue == val:
                nodes.append(current_node)
            nodes_to_visit.extend(current_node.Children)
            index += 1

        return nodes

    def MoveNode(self, OriginalNode, NewParent):
        original_node = self.FindNodesByValue(OriginalNode.NodeValue)[0]
        new_parent = self.FindNodesByValue(NewParent.NodeValue)[0]

        new_parent.Children.append(original_node)
        original_node.Parent.Children = [item for item in original_node.Parent.Children if
                                         item.NodeValue != original_node.NodeValue]
        original_node.Parent = new_parent

    def Count(self):
        return len(self.GetAllNodes())

    def LeafCount(self):
        leaf_nodes = 1 if len(self.Root.Children) == 0 else 0
        index = 0
        nodes_to_visit = self.Root.Children.copy()
        while index < len(nodes_to_visit):
            current_node = nodes_to_visit[index]
            if len(current_node.Children) == 0:
                leaf_nodes += 1
            nodes_to_visit.extend(current_node.Children)
            index += 1

        return leaf_nodes

    def AddLevel(self):
        self.Root.Level = 1

        index = 0
        nodes_to_visit = self.Root.Children.copy()
        while index < len(nodes_to_visit):
            current_node = nodes_to_visit[index]
            current_node.Level = current_node.Parent.Level+1
            nodes_to_visit.extend(current_node.Children)
            index += 1
