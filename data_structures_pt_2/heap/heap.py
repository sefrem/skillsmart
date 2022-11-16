class Heap:

    def __init__(self):
        self.HeapArray = []

    def GetLeftChildIndex(self, index):
        return 2 * index + 1

    def GetRightChildIndex(self, index):
        return 2 * index + 2

    def MakeHeap(self, a, depth):
        a.sort(reverse=True)
        self.HeapArray = [None] * (2 ** (depth + 1) - 1)
        parent_index = 0
        isLeft = True

        for index, i in enumerate(a):
            if index == 0:
                self.HeapArray[0] = i
                continue
            if isLeft:
                child_index = self.GetLeftChildIndex(parent_index)
                self.HeapArray[child_index] = i
                isLeft = False
            else:
                child_index = self.GetRightChildIndex(parent_index)
                self.HeapArray[child_index] = i
                isLeft = True
                parent_index += 1

        return self.HeapArray

    def GetMax(self):
        if len(self.HeapArray) == 0:
            return -1

        max = self.HeapArray[0]
        self.HeapArray[0] = self.HeapArray[-1]
        self.HeapArray[-1] = None

        def MoveRoot(index):
            left_child = self.HeapArray[self.GetLeftChildIndex(index)]
            right_child = self.HeapArray[self.GetRightChildIndex(index)]

            while (left_child and left_child > self.HeapArray[index]) or (
                    right_child and right_child > self.HeapArray[index]):
                if left_child > self.HeapArray[index]:
                    left_child_index = self.GetLeftChildIndex(index)
                    self.HeapArray[index], self.HeapArray[left_child_index] = self.HeapArray[left_child_index], \
                                                                              self.HeapArray[index]
                    index = left_child_index
                    next_left_child_index = self.GetLeftChildIndex(index)
                    if next_left_child_index < len(self.HeapArray):
                        left_child = self.HeapArray[self.GetLeftChildIndex(index)]
                        right_child = self.HeapArray[self.GetRightChildIndex(index)]
                    else:
                        left_child = None
                        right_child = None
                    continue

                if right_child > self.HeapArray[index]:
                    right_child_index = self.GetRightChildIndex(index)
                    self.HeapArray[index], self.HeapArray[right_child_index] = self.HeapArray[right_child_index], \
                                                                               self.HeapArray[index]

                    index = right_child_index
                    next_right_child_index = self.GetRightChildIndex(index)
                    if next_right_child_index < len(self.HeapArray):
                        left_child = self.HeapArray[self.GetLeftChildIndex(index)]
                        right_child = self.HeapArray[self.GetRightChildIndex(index)]
                    else:
                        left_child = None
                        right_child = None
                    continue

        MoveRoot(0)

        return max

    def Add(self, key):
        return False
