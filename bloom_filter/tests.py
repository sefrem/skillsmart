import unittest
from unittest.mock import Mock

from bloom_filter import BloomFilter


class TestBloomFilter(unittest.TestCase):

    def setUp(self):
        self.test_strings_1 = '0123456789'
        self.test_strings_2 = '1234567890'
        self.test_strings_3 = '2345678901'
        self.test_strings_4 = '3456789012'
        self.test_strings_5 = '4567890123'
        self.test_strings_6 = '5678901234'
        self.test_strings_7 = '6789012345'
        self.test_strings_8 = '7890123456'
        self.test_strings_9 = '8901234567'
        self.test_strings_10 = '9012345678'

    @unittest.mock.patch("bloom_filter.BloomFilter.hash1",
                         Mock(return_value=5))
    @unittest.mock.patch("bloom_filter.BloomFilter.hash2",
                         Mock(return_value=8))
    def test_add_string(self):
        filter = BloomFilter(32)

        filter.add('234')

        self.assertEqual(1, filter.bit_list[5])
        self.assertEqual(1, filter.bit_list[8])

    def test_add_multiple_strings_1(self):
        filter = BloomFilter(32)

        filter.add(self.test_strings_1)
        filter.add(self.test_strings_2)
        filter.add(self.test_strings_3)
        filter.add(self.test_strings_4)
        filter.add(self.test_strings_5)

        self.assertTrue(filter.is_value(self.test_strings_1))
        self.assertTrue(filter.is_value(self.test_strings_2))
        self.assertTrue(filter.is_value(self.test_strings_3))
        self.assertTrue(filter.is_value(self.test_strings_4))
        self.assertTrue(filter.is_value(self.test_strings_5))
        self.assertFalse(filter.is_value(self.test_strings_6))
        self.assertFalse(filter.is_value(self.test_strings_7))
        self.assertFalse(filter.is_value(self.test_strings_8))
        self.assertFalse(filter.is_value(self.test_strings_9))
        self.assertFalse(filter.is_value(self.test_strings_10))

    def test_add_multiple_strings_2(self):
        filter = BloomFilter(32)

        filter.add(self.test_strings_1)
        filter.add(self.test_strings_2)
        filter.add(self.test_strings_3)
        filter.add(self.test_strings_4)
        filter.add(self.test_strings_5)
        filter.add(self.test_strings_6)
        filter.add(self.test_strings_7)
        filter.add(self.test_strings_8)

        self.assertTrue(filter.is_value(self.test_strings_1))
        self.assertTrue(filter.is_value(self.test_strings_2))
        self.assertTrue(filter.is_value(self.test_strings_3))
        self.assertTrue(filter.is_value(self.test_strings_4))
        self.assertTrue(filter.is_value(self.test_strings_5))
        self.assertTrue(filter.is_value(self.test_strings_6))
        self.assertTrue(filter.is_value(self.test_strings_7))
        self.assertTrue(filter.is_value(self.test_strings_8))
        self.assertFalse(filter.is_value(self.test_strings_9))
        self.assertFalse(filter.is_value(self.test_strings_10))

    def test_add_all_strings(self):
        filter = BloomFilter(32)

        filter.add(self.test_strings_1)
        filter.add(self.test_strings_2)
        filter.add(self.test_strings_3)
        filter.add(self.test_strings_4)
        filter.add(self.test_strings_5)
        filter.add(self.test_strings_6)
        filter.add(self.test_strings_7)
        filter.add(self.test_strings_8)
        filter.add(self.test_strings_9)
        filter.add(self.test_strings_10)

        self.assertTrue(filter.is_value(self.test_strings_1))
        self.assertTrue(filter.is_value(self.test_strings_2))
        self.assertTrue(filter.is_value(self.test_strings_3))
        self.assertTrue(filter.is_value(self.test_strings_4))
        self.assertTrue(filter.is_value(self.test_strings_5))
        self.assertTrue(filter.is_value(self.test_strings_6))
        self.assertTrue(filter.is_value(self.test_strings_7))
        self.assertTrue(filter.is_value(self.test_strings_8))
        self.assertTrue(filter.is_value(self.test_strings_9))
        self.assertTrue(filter.is_value(self.test_strings_10))
        self.assertFalse(filter.is_value("192.189.10.12"))
