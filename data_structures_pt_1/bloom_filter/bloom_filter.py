
class BloomFilter:

    def __init__(self, f_len):
        self.filter_len = f_len
        self.bit_list = [0] * self.filter_len

    def hash1(self, str1):
        hash = 0
        for i, c in enumerate(str1):
            hash = (hash * i) + ord(c)
        return hash % self.filter_len

    def hash2(self, str1):
        hash = 0
        for i, c in enumerate(str1):
            hash = (hash * i) + ord(c)
        return hash % self.filter_len

    def add(self, str1):
        self.bit_list[self.hash1(str1)] = 1
        self.bit_list[self.hash2(str1)] = 1

    def is_value(self, str1) -> bool:
        return bool(self.bit_list[self.hash1(str1)] and self.bit_list[self.hash1(str1)])

