class Heap:

    def __init__(self):
        self.HeapArray = []

    def GetLeftChildIndex(self, index):
        return 2 * index + 1

    def GetRightChildIndex(self, index):
        return 2 * index + 2

    def GetParentIndex(self, index):
        return int((index - 1) / 2) if index % 2 != 0 else int((index - 2) / 2)

    def SwitchParent(self, childIndex):
        parentIndex = self.GetParentIndex(childIndex)
        if self.HeapArray[childIndex] < self.HeapArray[parentIndex]:
            return

        self.HeapArray[childIndex], self.HeapArray[parentIndex] = self.HeapArray[parentIndex], self.HeapArray[
            childIndex]
        if parentIndex == 0:
            return

        self.SwitchParent(parentIndex)

    def SwitchChild(self, index):
        left_child_index = self.GetLeftChildIndex(index)
        right_child_index = self.GetRightChildIndex(index)
        if left_child_index >= len(self.HeapArray) and right_child_index >= len(self.HeapArray):
            return
        current_element = self.HeapArray[index]
        left_child = self.HeapArray[left_child_index]
        right_child = self.HeapArray[right_child_index]
        if left_child < current_element and right_child < current_element:
            return

        if left_child > current_element and right_child > current_element:
            next_index = left_child_index if left_child > right_child else right_child_index
        if left_child > current_element > right_child:
            next_index = left_child_index
        if left_child < current_element < right_child:
            next_index = right_child_index

        self.HeapArray[index], self.HeapArray[next_index] = self.HeapArray[next_index], self.HeapArray[index]

        self.SwitchChild(next_index)

    def MakeHeap(self, a, depth):
        if len(a) == 0:
            self.HeapArray = []
            return self.HeapArray

        self.HeapArray = [None] * (2 ** (depth + 1) - 1)

        for index, i in enumerate(a):
            if index == 0:
                self.HeapArray[0] = i
                continue
            self.HeapArray[index] = i
            self.SwitchParent(index)

        return self.HeapArray

    def GetMax(self):
        if len(self.HeapArray) == 0:
            return -1

        max = self.HeapArray[0]
        self.HeapArray[0] = self.HeapArray[-1]
        self.HeapArray[-1] = None

        self.SwitchChild(0)

        return max

    def Add(self, key):
        for index, i in enumerate(self.HeapArray):
            if i is None:
                self.HeapArray[index] = key
                self.SwitchParent(index)
                break

        return False
