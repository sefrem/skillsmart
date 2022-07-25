import unittest
from unittest.mock import Mock

from native_dictionary import NativeDictionary


class TestNativeDictionary(unittest.TestCase):

    @unittest.mock.patch(
        "native_dictionary.NativeDictionary.hash_fun",
        Mock(return_value=2),
    )
    def test_put_one_key_value_pair(self):
        native_dict = NativeDictionary(12)

        native_dict.put('key', 'value')

        self.assertEqual('key', native_dict.values[2])
        self.assertEqual('value', native_dict.slots[2])

    def test_adding_different_value_with_existing_key(self):
        native_dict = NativeDictionary(12)

        native_dict.put('key', 'value')
        native_dict.put('key', 'new_value')

        self.assertEqual('key', native_dict.values[7])
        self.assertEqual('new_value', native_dict.slots[7])

    def test_keys_hash_collision(self):
        native_dict = NativeDictionary(12)

        native_dict.put('key', 'value')
        native_dict.put('pey', 'new_value')

        self.assertEqual('key', native_dict.values[7])
        self.assertEqual('value', native_dict.slots[7])
        self.assertEqual('pey', native_dict.values[8])
        self.assertEqual('new_value', native_dict.slots[8])

    def test_keys_hash_collision_on_dict_end(self):
        native_dict = NativeDictionary(8)

        native_dict.put('key', 'value')
        native_dict.put('pey', 'new_value')
        native_dict.put('rey', 'very_new_value')

        self.assertEqual('key', native_dict.values[7])
        self.assertEqual('value', native_dict.slots[7])
        self.assertEqual('pey', native_dict.values[0])
        self.assertEqual('new_value', native_dict.slots[0])
        self.assertEqual('rey', native_dict.values[1])
        self.assertEqual('very_new_value', native_dict.slots[1])

    def test_is_key_exist_for_existing_key(self):
        native_dict = NativeDictionary(8)
        native_dict.put('key', 'value')

        is_key = native_dict.is_key('key')

        self.assertTrue(is_key)

    def test_is_key_exists_for_non_existing_key(self):
        native_dict = NativeDictionary(8)
        native_dict.put('key', 'value')

        is_key = native_dict.is_key('anything')

        self.assertFalse(is_key)

    def test_is_key_exists_for_existing_key_with_collision(self):
        native_dict = NativeDictionary(8)
        native_dict.put('key', 'value')
        native_dict.put('pey', 'new_value')

        is_key = native_dict.is_key('pey')

        self.assertTrue(is_key)

    def test_is_key_exists_in_full_dict_for_non_existent_key(self):
        native_dict = NativeDictionary(4)
        native_dict.put('key', 'value')
        native_dict.put('qey', 'new_value')
        native_dict.put('rey', 'some_value')
        native_dict.put('tey', 'any_value')

        is_key = native_dict.is_key('pey')

        self.assertFalse(is_key)

    def test_is_key_exists_for_existing_key_with_long_collision(self):
        native_dict = NativeDictionary(8)
        native_dict.put('key', 'value')
        native_dict.put('pey', 'new_value')
        native_dict.put('rey', 'new_value')
        native_dict.put('wey', 'new_value')
        native_dict.put('zey', 'new_value')

        is_key = native_dict.is_key('zey')

        self.assertTrue(is_key)

    def test_get_existing_value(self):
        native_dict = NativeDictionary(8)
        native_dict.put('key', 'value')
        native_dict.put('another_key', 'new_value')

        value = native_dict.get('another_key')

        self.assertEqual('new_value', value)

    def test_get_existing_value_with_key_collisions(self):
        native_dict = NativeDictionary(8)
        native_dict.put('key', 'value')
        native_dict.put('pey', 'new_value')
        native_dict.put('rey', 'very_new_value')

        value = native_dict.get('rey')

        self.assertEqual('very_new_value', value)

    def test_get_non_existent_value(self):
        native_dict = NativeDictionary(8)
        native_dict.put('key', 'value')

        value = native_dict.get('none_key')

        self.assertIsNone(value)

    def test_get_non_existent_value_from_full_dict(self):
        native_dict = NativeDictionary(4)
        native_dict.put('key', 'value')
        native_dict.put('tey', 'value')
        native_dict.put('rey', 'value')
        native_dict.put('qey', 'value')

        value = native_dict.get('none_key')

        self.assertIsNone(value)
