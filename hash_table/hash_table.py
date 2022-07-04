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
        slot = self.hash_fun(value)
        if not self.slots[slot]:
            return slot
        else:
            next_slot = slot + self.step

            while True:
                if next_slot > self.size:
                    next_slot = 0
                    self.step += 1

                if self.step >= self.size:
                    return None

                if not self.slots[next_slot]:
                    return next_slot

                if self.slots[next_slot]:
                    next_slot += self.step

    def put(self, value):
        slot = self.seek_slot(value)
        if slot:
            self.slots[slot] = value

        return slot

    def find(self, value):

        for i, val in enumerate(self.slots):
            if val == value:
                return i

        return None
