class NativeDictionary:
    def __init__(self, sz):
        self.size = sz
        self.slots = [None] * self.size
        self.values = [None] * self.size

    def hash_fun(self, key):
        val = 0
        for i, char in enumerate(key):
            val += ord(char) * i

        return val % self.size

    def is_key(self, key):
        slot = init_slot = self.hash_fun(key)

        while True:
            if self.values[slot] == key:
                return True
            if self.values[slot] is not None:
                slot = slot + 1 if slot < len(self.values) - 1 else 0
            if self.values[slot] is None or slot == init_slot:
                return False

    def put(self, key, value):
        slot = self.hash_fun(key)

        while True:
            if self.values[slot] is None:
                self.values[slot] = key
                self.slots[slot] = value
                return

            if self.values[slot] is not None and self.values[slot] == key:
                self.slots[slot] = value
                return
            else:
                slot = slot + 1 if slot < len(self.values)-1 else 0

    def get(self, key):
        slot = init_slot = self.hash_fun(key)

        while True:
            if self.values[slot] == key:
                return self.slots[slot]
            if self.values[slot] is not None:
                slot = slot + 1 if slot < len(self.values) - 1 else 0
            if self.values[slot] is None or slot == init_slot:
                return None
