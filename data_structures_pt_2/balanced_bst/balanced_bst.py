class BSTNode:

    def __init__(self, key, parent):
        self.NodeKey = key
        self.Parent = parent
        self.LeftChild = None
        self.RightChild = None
        self.Level = 0


class BalancedBST:

    def __init__(self):
        self.Root = None

    def GenerateTree(self, a):
        a.sort()
        center = len(a) // 2
        self.Root = BSTNode(a[center], None)

        def GenerateBranches(arr, node, level):
            if len(arr) == 0:
                return
            center = len(arr) // 2
            node = BSTNode(arr[center], node)
            node.Level = level
            if len(arr) == 1:
                return node

            node.LeftChild = GenerateBranches(arr[:center], node, level + 1)
            node.RightChild = GenerateBranches(arr[center + 1:], node, level + 1)
            return node

        self.Root.LeftChild = GenerateBranches(a[:center], self.Root, 1)
        self.Root.RightChild = GenerateBranches(a[center + 1:], self.Root, 1)

        return self.Root

    def GetNode(self, node, key):
        if node is None:
            return None
        if node.NodeKey == key:
            return node
        return self.GetNode(node.LeftChild if key < node.NodeKey else node.RightChild, key)

    def GetNodeChildrenDepth(self, node, max):
        if node is None:
            return max
        new_max = max

        if node.Level > max:
            new_max = node.Level

        if node.LeftChild:
            new_max = self.GetNodeChildrenDepth(node.LeftChild, new_max)

        if node.RightChild:
            new_max = self.GetNodeChildrenDepth(node.LeftChild, new_max)

        return new_max

    def IsBalanced(self, root_node):
        node = self.GetNode(self.Root, root_node.NodeKey)
        if node is None:
            return False

        left = self.GetNodeChildrenDepth(node.LeftChild, 0)
        right = self.GetNodeChildrenDepth(node.RightChild, 0)

        print(left, right)

        return abs(left - right) <= 1
