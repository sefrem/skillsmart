import {BoundedStack} from "./task_1_stack";


describe('BoundedStack', () => {
  const POP_INIT_STATUS = 0;
  const POP_OK_STATUS = 1;
  const POP_ERR_STATUS = 2;
  const PUSH_INIT_STATUS = 0;
  const PUSH_OK_STATUS = 1;
  const PUSH_ERR_STATUS = 2;
  const PEEK_INIT_STATUS = 0;
  const PEEK_OK_STATUS = 1;
  const PEEK_ERR_STATUS = 2;
  const PEEK_ERR_RETURN_VALUE = 0;
  const TEST_VALUE_NUMBER = 1;
  const ANOTHER_TEST_VALUE_NUMBER = 2;
  const TEST_VALUE_STRING = '1';
  const ANOTHER_TEST_VALUE_STRING = '2';

  it('should create stack with the correct initial statuses', () => {
    const stack = new BoundedStack();

    expect(stack.get_pop_status()).toEqual(POP_INIT_STATUS);
    expect(stack.get_peek_status()).toEqual(PEEK_INIT_STATUS);
    expect(stack.get_push_status()).toEqual(PUSH_INIT_STATUS);

  })

  it('should correctly handle push in a full stack', () => {
    const stack = new BoundedStack<number>(1);

    stack.push(TEST_VALUE_NUMBER);
    expect(stack.get_push_status()).toEqual(PUSH_OK_STATUS);

    stack.push(TEST_VALUE_NUMBER);
    expect(stack.get_push_status()).toEqual(PUSH_ERR_STATUS)
  });

  it('should peek a correct value and set a correct status on non-empty stack', () => {
    const stack = new BoundedStack<number>();
    stack.push(TEST_VALUE_NUMBER)
    stack.push(ANOTHER_TEST_VALUE_NUMBER)

    expect(stack.peek()).toEqual(ANOTHER_TEST_VALUE_NUMBER);
    expect(stack.get_peek_status()).toEqual(PEEK_OK_STATUS)
  });

  it('should peek a correct value and set a correct status on an empty stack', () => {
    const stack = new BoundedStack<string>();

    expect(stack.peek()).toEqual(PEEK_ERR_RETURN_VALUE);
    expect(stack.get_peek_status()).toEqual(PEEK_ERR_STATUS)
  });

  it('should pop a correct value from non-empty stack', () => {
    const stack = new BoundedStack<string>();
    stack.push(TEST_VALUE_STRING);
    stack.push(ANOTHER_TEST_VALUE_STRING);

    stack.pop();

    expect(stack.get_pop_status()).toEqual(POP_OK_STATUS);
    expect(stack.peek()).toEqual(TEST_VALUE_STRING)
  });

  it('should correctly handle popping from an empty stack', () => {
    const stack = new BoundedStack();

    stack.pop();

    expect(stack.get_pop_status()).toEqual(POP_ERR_STATUS);
  });

  it('should correctly clear stack', () => {
    const stack = new BoundedStack<number>();
    stack.push(TEST_VALUE_NUMBER);
    stack.push(ANOTHER_TEST_VALUE_NUMBER);

    stack.clear();

    expect(stack.size()).toEqual(0)
  })
})
