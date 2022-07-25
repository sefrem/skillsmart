import ctypes


class DynArray:

    def __init__(self):
        self.count = 0
        self.capacity = 16
        self.array = self.make_array(self.capacity)

    def __len__(self):
        return self.count

    def make_array(self, new_capacity):
        return (new_capacity * ctypes.py_object)()

    def __getitem__(self, i):
        if i < 0 or i >= self.count:
            raise IndexError('Index is out of bounds')
        return self.array[i]

    def resize(self, new_capacity):
        new_array = self.make_array(new_capacity)
        for i in range(self.count):
            new_array[i] = self.array[i]
        self.array = new_array
        self.capacity = new_capacity

    def append(self, itm):
        if self.count == self.capacity:
            self.resize(2 * self.capacity)
        self.array[self.count] = itm
        self.count += 1
        return self

    def insert(self, i, itm):
        if i < 0 or i > self.count:
            raise IndexError('Index is out of bounds')
        if self.count == self.capacity:
            self.capacity *= 2
        new_array = self.make_array(self.capacity)

        for k in range(self.count + 1):
            if k == i:
                new_array[i] = itm
                continue
            if k > i:
                new_array[k] = self.array[k - 1]
            else:
                new_array[k] = self.array[k]

        self.array = new_array
        self.count += 1

    def delete(self, i):
        if i < 0 or i > self.count or self.count == 0:
            raise IndexError('Index is out of bounds')
        new_array = self.make_array(self.capacity)
        for k in range(self.count):
            if k == i:
                continue
            if k > i:
                new_array[k - 1] = self.array[k]
            else:
                new_array[k] = self.array[k]

        self.count -= 1
        self.array = new_array

        if self.count < self.capacity / 2:
            new_capacity = int(self.capacity / 1.5)
            self.capacity = new_capacity if new_capacity > 16 else 16
