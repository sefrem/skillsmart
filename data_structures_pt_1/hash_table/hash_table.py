class HashTable:
    def __init__(self, sz, stp):
        self.size = sz
        self.step = stp
        self.slots = [None] * self.size

    def hash_fun(self, value):
        val = 0
        for i, char in enumerate(value):
            val += ord(char) * i

        return val % self.size

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
                continue

            if self.step >= self.size:
                return None

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
