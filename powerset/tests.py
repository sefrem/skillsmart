import string
import unittest
import random
from unittest.mock import Mock

from powerset import PowerSet, hash_fun


class TestPowerSet(unittest.TestCase):

    @unittest.mock.patch(
        "powerset.hash_fun",
        Mock(return_value=7),
    )
    def test_put_value(self):
        power_set = PowerSet()

        power_set.put('key')

        self.assertEqual('key', power_set.set[7])

    @unittest.mock.patch(
        "powerset.hash_fun",
        Mock(return_value=7),
    )
    def test_cannot_put_same_value(self):
        power_set = PowerSet()

        power_set.put('key')

        self.assertEqual('key', power_set.set[7])
        self.assertIsNone(power_set.set.get(8))

    def test_put_value_with_collision(self):
        power_set = PowerSet()

        power_set.put('key')  # hash of key = 343
        power_set.put('pey')

        self.assertEqual('key', power_set.set[343])
        self.assertEqual('pey', power_set.set[343 + power_set.step])

    def test_union_2_big_sets_unique_values(self):
        set_1 = PowerSet()
        set_2 = PowerSet()

        for i in range(0, 10000):
            set_1.put(str(i))

        for j in range(10000, 20000):
            set_2.put(str(j))

        union_set = set_1.union(set_2)

        self.assertEqual(20000, len(union_set.set.keys()))

    def test_union_2_sets_random_values(self):
        set_1 = PowerSet()
        set_2 = PowerSet()

        set_1.set[250] = 'random_value'
        set_2.set[2500] = 'another_random_value'

        for i in range(0, 10000):
            value = random.choice(string.ascii_uppercase) + random.choice(string.ascii_uppercase) + str(
                random.randint(100, 999))
            set_1.put(value)

        for j in range(10000, 20000):
            value = random.choice(string.ascii_uppercase) + random.choice(string.ascii_uppercase) + str(
                random.randint(100, 999))
            set_2.put(value)

        union_set = set_1.union(set_2)

        self.assertIn(set_1.set[250], union_set.set.values())
        self.assertIn(set_1.set[2500], union_set.set.values())

    def test_union_of_empty_and_non_empty_set(self):
        set_1 = PowerSet()
        set_2 = PowerSet()
        expected_set = PowerSet()

        for i in range(0, 10000):
            set_1.put(str(i))
            expected_set.put(str(i))

        union_set = set_1.union(set_2)

        self.assertDictEqual(expected_set.set, union_set.set)

    def test_remove_existing_value(self):
        power_set = PowerSet()

        for i in range(0, 100):
            power_set.put(str(i))

        is_removed = power_set.remove('55')

        self.assertTrue(is_removed)

        for i in power_set.set.values():
            self.assertNotEqual('55', i)

    def test_remove_value_with_collisions(self):
        power_set = PowerSet()

        for i in range(0, 100):
            power_set.put(str(i))

        power_set.put('300')
        power_set.put('400')
        power_set.put('500')
        power_set.put('600')

        is_removed = power_set.remove('300')

        self.assertTrue(is_removed)
        for i in power_set.set.values():
            self.assertNotEqual('300', i)

        self.assertFalse(power_set.get('300'))
        self.assertTrue(power_set.get('400'))
        self.assertTrue(power_set.get('600'))
        self.assertTrue(power_set.get('500'))

    def test_remove_non_existent_value(self):
        power_set = PowerSet()

        for i in range(0, 100):
            power_set.put(str(i))

        power_set.put('300')
        power_set.put('400')
        power_set.put('500')

        is_removed = power_set.remove('600')

        self.assertFalse(is_removed)

    def test_remove_value_from_empty_set(self):
        self.assertFalse(PowerSet().remove('24'))

    def test_intersection(self):
        set_1 = PowerSet()
        set_2 = PowerSet()
        expected_set = PowerSet()

        for k in range(30, 50):
            expected_set.put(str(k))
        for i in range(10, 50):
            set_1.put(str(i))
        for j in range(30, 70):
            set_2.put(str(j))

        intersection_set = set_1.intersection(set_2)

        self.assertDictEqual(expected_set.set, intersection_set.set)

    def test_intersection_big_sets(self):
        set_1 = PowerSet()
        set_2 = PowerSet()
        expected_set = PowerSet()

        for k in range(8000, 10000):
            expected_set.put(str(k))
        for i in range(0, 10000):
            set_1.put(str(i))
        for j in range(8000, 20000):
            set_2.put(str(j))

        intersection_set = set_1.intersection(set_2)

        self.assertDictEqual(expected_set.set, intersection_set.set)

    def test_intersection_big_non_intersecting_sets(self):
        set_1 = PowerSet()
        set_2 = PowerSet()
        expected_set = PowerSet()

        for i in range(0, 10000):
            set_1.put(str(i))
        for j in range(11000, 20000):
            set_2.put(str(j))

        intersection_set = set_1.intersection(set_2)

        self.assertDictEqual(expected_set.set, intersection_set.set)

    def test_difference(self):
        set_1 = PowerSet()
        set_2 = PowerSet()
        expected_set = PowerSet()

        for i in range(0, 100):
            set_1.put(str(i))
        for j in range(50, 80):
            set_2.put(str(j))
        for k in range(0, 50):
            expected_set.put(str(k))
        for i in range(80, 100):
            expected_set.put(str(i))

        difference_set = set_1.difference(set_2)

        self.assertDictEqual(expected_set.set, difference_set.set)

    def test_difference_big_set(self):
        set_1 = PowerSet()
        set_2 = PowerSet()
        expected_set = PowerSet()

        for i in range(0, 10000):
            set_1.put(str(i))
        for j in range(5000, 8000):
            set_2.put(str(j))
        for k in range(0, 5000):
            expected_set.put(str(k))
        for i in range(8000, 10000):
            expected_set.put(str(i))

        difference_set = set_1.difference(set_2)

        self.assertDictEqual(expected_set.set, difference_set.set)

    def test_difference_returns_empty_set(self):
        set_1 = PowerSet()
        set_2 = PowerSet()
        expected_set = PowerSet()

        for i in range(0, 10000):
            set_1.put(str(i))
        for j in range(0, 10000):
            set_2.put(str(j))

        difference_set = set_1.difference(set_2)

        self.assertDictEqual(expected_set.set, difference_set.set)

    def test_is_subset(self):
        set_1 = PowerSet()
        set_2 = PowerSet()

        for i in range(0, 100):
            set_1.put(str(i))
        for j in range(20, 50):
            set_2.put(str(j))

        is_subset = set_1.issubset(set_2)

        self.assertTrue(is_subset)

    def test_is_not_subset(self):
        set_1 = PowerSet()
        set_2 = PowerSet()

        for i in range(0, 100):
            set_1.put(str(i))
        for j in range(90, 101):
            set_2.put(str(j))

        is_subset = set_1.issubset(set_2)

        self.assertFalse(is_subset)

    def test_is_subset_all_values_of_set_in_subset(self):
        set_1 = PowerSet()
        set_2 = PowerSet()

        for i in range(40, 50):
            set_1.put(str(i))
        for j in range(0, 100):
            set_2.put(str(j))

        is_subset_set_2 = set_1.issubset(set_2)
        is_subset_set_1 = set_2.issubset(set_1)

        self.assertFalse(is_subset_set_2)
        self.assertTrue(is_subset_set_1)

    def test_get_value(self):
        set = PowerSet()

        for i in range(40, 50):
            set.put(str(i))

        is_present = set.get('48')

        self.assertTrue(is_present)

    def test_get_value_big_set(self):
        set = PowerSet()

        for i in range(0, 50000):
            set.put(str(i))

        for i in range(0, 50000):
            self.assertTrue(set.get(str(i)))

        self.assertFalse(set.get('50001'))

    def test_get_value_not_in_set(self):
        set = PowerSet()

        for i in range(40, 50):
            set.put(str(i))

        is_present = set.get('296')

        self.assertFalse(is_present)

    def test_get_value_empty_set(self):
        set = PowerSet()

        is_present = set.get('296')

        self.assertFalse(is_present)

    def test_get_set_size(self):
        set = PowerSet()

        for i in range(0, 10000):
            set.put(str(i))

        size = set.size()

        self.assertEqual(10000, size)

    def test_get_size_of_empty_set(self):

        self.assertEqual(0, PowerSet().size())
