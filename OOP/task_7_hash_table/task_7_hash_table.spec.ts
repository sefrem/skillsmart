import {HashTable} from "./task_7_hash_table";

describe('hash_table', () => {

  describe('hash_func', () => {

    it('should get the same hash for the same values', () => {
      const TEST_VALUE = 'some_name';
      const table = new HashTable();

      const hash_1 = table.hash_fun(TEST_VALUE);
      const hash_2 = table.hash_fun(TEST_VALUE);
      expect(hash_1).toEqual(hash_2)
    })

    it('should get different hash for different values', () => {
      const TEST_VALUE_1 = 'some_name';
      const TEST_VALUE_2 = 'another_string';
      const table = new HashTable();

      const hash_1 = table.hash_fun(TEST_VALUE_1);
      const hash_2 = table.hash_fun(TEST_VALUE_2);
      const comparison = hash_1 === hash_2;
      expect(comparison).toEqual(false)
    })
  })

  describe('seek_slot', () => {

    it('should find a different slot for the same value', () => {
      const TEST_VALUE = 'some_name';
      const table = new HashTable();

      const slot_1 = table.seek_slot(TEST_VALUE);
      table.put(TEST_VALUE)
      table.put(TEST_VALUE)
      const slot_2 = table.seek_slot(TEST_VALUE);
      const comparison = slot_1 === slot_2;
      expect(comparison).toEqual(false);
    })
  })
})
