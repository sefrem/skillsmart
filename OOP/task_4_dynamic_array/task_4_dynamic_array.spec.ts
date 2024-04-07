import {DynamicArray} from "./task_4_dynamic_array";


describe('DynamicArray', () => {

  describe('Append', () => {
    it('should append element to the end of an array', () => {
      const TEST_VALUE = 111;
      const TEST_INDEX = 0;
      const array= new DynamicArray<number>();

      array.append(TEST_VALUE);
      const item = array.get_item(TEST_INDEX);

      expect(item).toEqual(TEST_VALUE);
      expect(array.get_get_item()).toEqual(1)
    });

    it('should set a correct status on getting an out of range element', () => {
      const TEST_VALUE = 111;
      const TEST_INDEX = 1;
      const array= new DynamicArray<number>();

      array.append(TEST_VALUE);
      array.get_item(TEST_INDEX);

      expect(array.get_get_item()).toEqual(2)
    });
  })

  describe('Insert', () => {
    const TEST_VALUE_1 = 111;
    const TEST_VALUE_2 = 222;
    const TEST_VALUE_3 = 333;

    it('should insert element in an array where there is space', () => {
      const TEST_INDEX = 1;
      const array= new DynamicArray<number>();
      array.append(TEST_VALUE_1);
      array.append(TEST_VALUE_3);

      array.insert(TEST_VALUE_2, TEST_INDEX)

      const inserted_item = array.get_item(TEST_INDEX);
      const last_item = array.get_item(2);

      expect(inserted_item).toEqual(TEST_VALUE_2)
      expect(last_item).toEqual(TEST_VALUE_3)
      expect(array.get_insert_item()).toEqual(1)
    });

    it('should insert an item into a full array resizing it', () => {
      const array= new DynamicArray<number>([], 2);
      array.append(TEST_VALUE_1);
      array.append(TEST_VALUE_2);

      array.insert(TEST_VALUE_3, 2);

      const inserted_item = array.get_item(2)

      expect(inserted_item).toEqual(TEST_VALUE_3);
      expect(array.get_insert_item()).toEqual(1)
    })

    it('should not insert an item in an incorrect index', () => {
      const array= new DynamicArray<number>([], 2);
      array.append(TEST_VALUE_1);
      array.append(TEST_VALUE_2);

      array.insert(TEST_VALUE_3, 5);

      expect(array.get_insert_item()).toEqual(2)
    })
  })

  describe('Remove', () => {
    const TEST_VALUE_1 = 111;
    const TEST_VALUE_2 = 222;
    const TEST_VALUE_3 = 333;

    it('should remove an item from a full array', () => {
      const array= new DynamicArray<number>([], 2);
      array.append(TEST_VALUE_1);
      array.append(TEST_VALUE_2);
      array.append(TEST_VALUE_3);

      array.remove(1);
      array.remove(0);

      expect(array.get_item(1)).toBeFalsy()
      expect(array.get_remove()).toEqual(1);
    })

    it('should not remove an item from an incorrect index', () => {
      const array= new DynamicArray<number>([], 2);
      array.append(TEST_VALUE_1);

      array.remove(10);

      expect(array.get_remove()).toEqual(2);
    })
  })
})
