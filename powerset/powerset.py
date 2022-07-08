class HashTable:
    def __init__(self, sz, stp):
        self.volume = sz
        self.step = stp
        self.slots = [None] * self.volume

    def hash_fun(self, value):
        val = 0
        for i, char in enumerate(value):
            val += ord(char) * i

        return val % self.volume

    def seek_slot(self, value):
        init_slot = next_slot = self.hash_fun(value)
        is_round = False

        while True:
            if is_round and next_slot >= init_slot:
                self.step += 1
                next_slot = 0
                is_round = False
                continue

            if next_slot >= len(self.slots):
                is_round = True
                next_slot -= len(self.slots)
                for i in range(self.volume, self.volume * 2):
                    self.slots.append(None)
                self.volume *= 2
                continue

            # if self.step >= self.volume:
            #     return None

            if self.slots[next_slot] is None:
                return next_slot

            if self.slots[next_slot]:
                next_slot += self.step

    def put(self, value):
        slot = self.seek_slot(value)
        if slot is not None:
            self.slots[slot] = value

        return slot

    def find(self, value):
        for i, val in enumerate(self.slots):
            if val == value:
                return i

        return None


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
        return 0
        # количество элементов в множестве

    def put(self, value):
        slot = hash_fun(value)

        if self.set.get(slot) == value:
            return

        while True:
            set_value = self.set.get(slot)
            if set_value is not None and set_value != value:
                slot += self.step
                continue

            self.set[slot] = value
            break

    def get(self, value):
        # возвращает True если value имеется в множестве,
        # иначе False
        return False

    def remove(self, value):
        slot = hash_fun(value)

        if self.set.get(slot) is None:
            return False

        while True:
            if self.set.get(slot) == value:
                self.set.pop(slot)
                return True
            if self.set.get(slot) is None:
                return False
            if self.set.get(slot) != value:
                slot += self.step

    def intersection(self, set2):
        intersected_set = PowerSet()

        for value in self.set.values():
            slot = hash_fun(value)

            while True:
                if set2.set.get(slot) is None:
                    break
                if set2.set.get(slot) == value:
                    intersected_set.put(value)
                    break
                if set2.set.get(slot) != value:
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
        # разница текущего множества и set2
        return None

    def issubset(self, set2):
        # возвращает True, если set2 есть
        # подмножество текущего множества,
        # иначе False
        return False
