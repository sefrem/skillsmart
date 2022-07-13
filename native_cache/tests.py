import unittest
from unittest.mock import Mock

from native_cache import NativeCache


class TestNativeCache(unittest.TestCase):

    def setUp(self):
        self.test_full_cache = NativeCache(4)
        self.test_full_cache.put('key', 'value')
        self.test_full_cache.put('tey', 'value')
        self.test_full_cache.put('rey', 'value')
        self.test_full_cache.put('qey', 'value')

    @unittest.mock.patch("native_cache.NativeCache.hash_fun",
                         Mock(return_value=2))
    def test_getting_value_updates_hits_count(self):
        cache = NativeCache(8)

        cache.put('key', 'value')

        cache.get('key')
        cache.get('key')

        self.assertEqual(2, cache.hits[2])

        cache.get('key')

        self.assertEqual(3, cache.hits[2])

    def test_put_value_in_full_cache(self):
        self.test_full_cache.get('key')
        self.test_full_cache.get('tey')
        self.test_full_cache.get('rey')

        self.test_full_cache.put('none_key', 'none_value')

        self.assertTrue(self.test_full_cache.is_key('none_key'))
        self.assertTrue(self.test_full_cache.is_key('key'))
        self.assertTrue(self.test_full_cache.is_key('tey'))
        self.assertTrue(self.test_full_cache.is_key('rey'))
        self.assertFalse(self.test_full_cache.is_key('qey'))

    def test_put_value_in_full_cache_no_get(self):
        self.test_full_cache.put('none_key', 'none_value')

        self.assertTrue('none_key', self.test_full_cache.values[0])
        self.assertTrue('none_value', self.test_full_cache.slots[0])

    def test_put_few_values_in_empty_cache(self):
        self.test_full_cache.put('new_key_1', 'new_val_1')
        self.test_full_cache.get('new_key_1')

        self.test_full_cache.put('new_key_2', 'new_val_2')
        self.test_full_cache.get('new_key_2')

        self.test_full_cache.put('new_key_3', 'new_val_3')
        self.test_full_cache.get('new_key_3')

        self.test_full_cache.put('new_key_4', 'new_val_4')
        self.test_full_cache.get('new_key_4')

        self.assertTrue(self.test_full_cache.is_key('new_key_1'))
        self.assertTrue(self.test_full_cache.is_key('new_key_2'))
        self.assertTrue(self.test_full_cache.is_key('new_key_3'))
        self.assertTrue(self.test_full_cache.is_key('new_key_4'))
        self.assertFalse(self.test_full_cache.is_key('key'))
        self.assertFalse(self.test_full_cache.is_key('tey'))
        self.assertFalse(self.test_full_cache.is_key('rey'))
        self.assertFalse(self.test_full_cache.is_key('qey'))
