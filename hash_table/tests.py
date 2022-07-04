import unittest
from unittest.mock import Mock

from hash_table import HashTable


class TestHashTable(unittest.TestCase):

    def test_hash_func(self):
        value_1 = 'kasklds'
        value_2 = 'A long string with white spaces'
        value_3 = 'And some even longer stiring с русскими символами потому что почему бы и нет'
        value_4 = ' '
        values = [value_1, value_2, value_3, value_4]

        hash_table = HashTable(17, 2)

        for value in values:
            value_hash = hash_table.hash_fun(value)
            self.assertIsInstance(value_hash, int)
            self.assertLessEqual(value_hash, hash_table.size)

    def test_seek_slot_in_empty_table(self):
        value = 'random'
        hash_table = HashTable(17, 2)

        slot = hash_table.seek_slot(value)

        self.assertEqual(8, slot)

    def test_seek_slot_with_collision(self):
        value = 'random'
        hash_table = HashTable(17, 2)
        hash_table.slots[8] = 'test_value'

        slot = hash_table.seek_slot(value)

        self.assertEqual(10, slot)

    @unittest.mock.patch(
        "hash_table.HashTable.hash_fun",
        Mock(return_value=16),
    )
    def test_step_increase_when_go_over_table_size(self):
        hash_table = HashTable(17, 2)
        hash_table.slots[16] = 'test_value'

        slot = hash_table.seek_slot('random')

        self.assertEqual(3, hash_table.step)
        self.assertEqual(0, slot)

    @unittest.mock.patch(
        "hash_table.HashTable.hash_fun",
        Mock(return_value=16),
    )
    def test_collision_with_step_increase(self):
        hash_table = HashTable(17, 2)
        hash_table.slots[16] = 'test_value'
        hash_table.slots[0] = 'test_value'

        slot = hash_table.seek_slot('random')

        self.assertEqual(3, hash_table.step)
        self.assertEqual(3, slot)

    @unittest.mock.patch(
        "hash_table.HashTable.hash_fun",
        Mock(return_value=2),
    )
    def test_put_value_into_slot(self):
        hash_table = HashTable(17, 2)

        slot = hash_table.put('random')

        self.assertEqual('random', hash_table.slots[2])
        self.assertEqual(2, slot)

    def test_put_failed(self):
        hash_table = HashTable(3, 2)

        hash_table.slots[0] = 'value'
        hash_table.slots[2] = 'value'

        slot = hash_table.put('something')

        self.assertEqual(None, slot)

    def test_find_success(self):
        hash_table = HashTable(17, 2)

        slot_1 = hash_table.put('value')
        slot_2 = hash_table.put('lavue')

        slot = hash_table.find('value')

        self.assertEqual(14, slot_1)
        self.assertEqual(0, slot_2)
        self.assertEqual(14, slot)
        self.assertEqual(slot_1, slot)
        self.assertEqual('value', hash_table.slots[slot_1])
        self.assertEqual('lavue', hash_table.slots[slot_2])

    def test_find_fail(self):
        hash_table = HashTable(17, 2)

        hash_table.slots[8] = 'value'

        slot = hash_table.find('some_random val')

        self.assertEqual(None, slot)

