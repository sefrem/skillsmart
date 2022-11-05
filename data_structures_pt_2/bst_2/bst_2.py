class aBST:

    def __init__(self, depth):
        tree_size = 2 ** (depth + 1) - 1
        self.Tree = [None] * tree_size

    def GetLeftChildIndex(self, index):
        return 2 * index + 1

    def GetRightChildIndex(self, index):
        return 2 * index + 2

    def FindKeyIndex(self, key):

        def traverseTree(index):
            if index >= len(self.Tree):
                return None
            if self.Tree[index] is None:
                return -index
            if key == self.Tree[index]:
                return index
            if key < self.Tree[index]:
                return traverseTree(self.GetLeftChildIndex(index))
            if key > self.Tree[index]:
                return traverseTree(self.GetRightChildIndex(index))

        return traverseTree(0)

    def AddKey(self, key):
        index = self.FindKeyIndex(key)
        if index is None:
            return -1
        if index > 0:
            return index
        if index <= 0:
            self.Tree[abs(index)] = key
            return abs(index)
