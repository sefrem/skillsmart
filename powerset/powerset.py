
def hash_fun(value):
    val = 0
    for i, char in enumerate(value):
        val += ord(char) * i

    return val


class PowerSet:

    def __init__(self):
        self.set = dict()
        self.step = 50

    def size(self):
        return len(self.set.keys())

    def put(self, value):
        slot = hash_fun(value)

        if self.set.get(slot) == value:
            return

        while True:
            value_in_slot = self.set.get(slot)
            if value_in_slot is not None and value_in_slot != value:
                slot += self.step
                continue

            self.set[slot] = value
            break

    def get(self, value):
        slot = hash_fun(value)
        keys = list(self.set.keys())
        if len(keys) > 0:
            last_key = keys[-1]
        else:
            return False

        while slot <= last_key:
            if self.set.get(slot) == value:
                return True
            else:
                slot += self.step

        return False

    def remove(self, value):
        slot = hash_fun(value)

        while self.set.get(slot) is not None:
            if self.set.get(slot) == value:
                self.set.pop(slot)
                return True
            else:
                slot += self.step

        return False

    def intersection(self, set2):
        intersected_set = PowerSet()

        for value in self.set.values():
            slot = hash_fun(value)

            while set2.set.get(slot) is not None:
                if set2.set.get(slot) == value:
                    intersected_set.put(value)
                    break
                else:
                    slot += set2.step

        return intersected_set

    def union(self, set2):
        union_set = PowerSet()
        for i in self.set.values():
            union_set.put(i)
        for j in set2.set.values():
            union_set.put(j)

        return union_set

    def difference(self, set2):
        difference_set = PowerSet()

        for value in self.set.values():
            slot = hash_fun(value)

            while True:
                if set2.set.get(slot) is None:
                    difference_set.put(value)
                    break
                if set2.set.get(slot) == value:
                    break
                else:
                    slot += set2.step

        return difference_set

    def issubset(self, set2):

        for value in set2.set.values():
            slot = hash_fun(value)

            while True:
                if self.set.get(slot) is None:
                    return False
                if set2.set.get(slot) == value:
                    break
                else:
                    slot += set2.step

        return True
