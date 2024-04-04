import {LinkedList, TwoWayList} from "./task_3_two_way_list";


describe('LinkedList', () => {

    describe('add_to_empty', () => {
        it('should add node to an empty list and point cursor to it', () => {
            const list = new LinkedList<number>();
            list.add_to_empty(1);

            expect(list.is_head()).toEqual(true);
            expect(list.size()).toEqual(1);
            expect(list.get_add_to_empty_status()).toEqual(1)
        })

        it('should not add a node to a non-empty list with add_to_empty command', () => {
            const list = new LinkedList<number>();
            list.add_to_empty(1);
            list.add_to_empty(2);

            expect(list.is_head()).toEqual(true);
            expect(list.size()).toEqual(1);
            expect(list.get_add_to_empty_status()).toEqual(2)
        })
    })

    describe('add_tail', () => {
        it('should add new node to the tail of the list', () => {
            const list = new LinkedList<number>();
            list.add_to_empty(1);
            list.add_tail(2);
            list.add_tail(3);

            expect(list.size()).toEqual(3);
            expect(list.cursor.value).toEqual(1);
            list.cursor = list.cursor.next;
            expect(list.cursor.value).toEqual(2);
            list.cursor = list.cursor.next;
            expect(list.cursor.value).toEqual(3);
        })
    })

    describe('head', () => {
        it('should point cursor to the head of the list', () => {
            const list = new LinkedList<number>();
            list.add_tail(1);
            list.add_tail(2);
            list.add_tail(3);
            list.add_tail(4);
            list.right();
            list.right();

            list.head();

            expect(list.cursor.value).toEqual(1);
            expect(list.is_head()).toEqual(true);
            expect(list.is_value()).toEqual(true);
            expect(list.get_head_status()).toEqual(1)
        });

        it('should set a correct status if head() on an empty list', () => {
            const list = new LinkedList<number>();

            list.head();

            expect(list.get_head_status()).toEqual(2);
        })
    });

    describe('tail', () => {
        it('should point cursor to the tail of the list', () => {
            const list = new LinkedList<number>();
            list.add_tail(1);
            list.add_tail(2);
            list.add_tail(3);

            list.tail();

            expect(list.cursor.value).toEqual(3);
            expect(list.is_tail()).toEqual(true);
            expect(list.get_tail_status()).toEqual(1)
        });

        it('should set a correct status if tail() on an empty list', () => {
            const list = new LinkedList<number>();

            list.tail();

            expect(list.get_tail_status()).toEqual(2);
        })
    })

    describe('right', () => {
        it('should point cursor to the next node and set status correctly', () => {
            const list = new LinkedList<number>();
            list.add_to_empty(1);
            list.add_tail(2);
            list.add_tail(3);

            list.right();

            expect(list.cursor.value).toEqual(2);
            expect(list.get_right_status()).toEqual(1);
        });

        it('should not point the cursor past the last node and set the correct status', () => {
            const list = new LinkedList<number>();
            list.add_to_empty(1);

            list.right();

            expect(list.cursor.value).toEqual(1);
            expect(list.get_right_status()).toEqual(2);
        })
    });

    describe('put_right', () => {
        it('should put a new node to the right of the current one', () => {
            const list = new LinkedList<number>();
            list.add_to_empty(1);
            list.add_tail(2);
            list.add_tail(4);

            list.right()
            list.put_right(3);

            expect(list.size()).toEqual(4);
            expect(list.cursor.next.value).toEqual(3);
            expect(list.cursor.prev.value).toEqual(1)
            expect(list.cursor.next.next.value).toEqual(4);
            expect(list.get_put_right_status()).toEqual(1);
        });

        it('should correctly set status if the list is empty', () => {
            const list = new LinkedList<number>();
            list.put_right(2);

            expect(list.size()).toEqual(0);
            expect(list.get_put_right_status()).toEqual(2)
        })
    })

    describe('put_left', () => {

        it('should put a new node to the left of the current one', () => {
            const list = new LinkedList<number>();
            list.add_to_empty(1);
            list.add_tail(3);
            list.add_tail(4);
            list.right();

            list.put_left(2);

            expect(list.size()).toEqual(4);
            expect(list['head_pointer'].next.value === 2);
            expect(list.get_put_left_status()).toEqual(1);
        })

        it('should correctly set status if the list is empty', () => {
            const list = new LinkedList<number>();

            list.put_left(2);

            expect(list.size()).toEqual(0);
            expect(list.get_put_left_status()).toEqual(2)
        })

        it('should correctly set status if the list has 1 value', () => {
            const list = new LinkedList<number>();
            list.add_tail(2);

            list.put_left(1)

            expect(list.size()).toEqual(2);
            expect(list.get_put_left_status()).toEqual(1);
        })
    })

    describe('remove', () => {
        it('should remove node from the middle of the list and point the cursor to the next node', () => {
            const list = new LinkedList<number>();
            list.add_tail(1);
            list.add_tail(2);
            list.add_tail(3);
            list.right();

            list.remove();

            expect(list.size()).toEqual(2);
            expect(list.cursor.value).toEqual(3);
            expect(list.get_remove_status()).toEqual(1);
        });

        it('should remove node from the end of the list and point the cursor to the prev node', () => {
            const list = new LinkedList<number>();
            list.add_tail(1);
            list.add_tail(2);
            list.right();

            list.remove();

            expect(list.size()).toEqual(1);
            expect(list.cursor.value).toEqual(1);
        });

        it('should remove node from the start of the list and put the cursor on the next one ', () => {
            const list = new LinkedList<number>();
            list.add_tail(1);
            list.add_tail(2);

            list.remove();

            expect(list.size()).toEqual(1);
            expect(list.cursor.value).toEqual(2);
        });
    })

    describe('clear', () => {
        it('should clear the list', () => {
            const list = new LinkedList<number>();
            list.add_tail(1);
            list.add_tail(2);

            list.clear()

            expect(list.size()).toEqual(0);
        })
    });

    describe('replace', () => {
        it('should replace current value', () => {
            const list = new LinkedList<number>();
            list.add_tail(1);
            list.add_tail(2);
            list.right();

            list.replace(3);

            expect(list.cursor.value).toEqual(3)
            expect(list.get_replace_status()).toEqual(1)
        });
    })

    describe('find', () => {
        it('should point cursor to the searched value', () => {
            const list = new LinkedList<number>();
            list.add_tail(1);
            list.add_tail(2);

            list.find(2);

            expect(list.cursor.value).toEqual(2);
        });

        it('should point cursor to the next same value', () => {
            const list = new LinkedList<number>();
            list.add_tail(1);
            list.add_tail(2);
            list.add_tail(2);
            list.add_tail(2);

            list.find(2);
            list.find(2);
            list.find(2);

            expect(list.cursor.value).toEqual(2);
            expect(list.cursor.next).toEqual(null);
        })

        it('should correctly search in a list with one node', () => {
            const list = new LinkedList<number>();
            list.add_tail(1);

            list.find(1)
            list.find(1)
            list.find(1)

            expect(list.cursor.value).toEqual(1);
            expect(list.cursor.next).toEqual(null);
        })

        it('should correctly search in an empty list', () => {
            const list = new LinkedList<number>();

            list.find(1)
            list.find(1)

            expect(list.cursor).toEqual(null);
        })
    })

    describe('get', () => {
        it('should get value of a cursor', () => {
            const list = new LinkedList<number>();
            list.add_to_empty(1);
            list.add_tail(2);
            list.add_tail(3);

            list.right();
            expect(list.get()).toEqual(2);
            expect(list.get_get_status()).toEqual(1)

            list.right();
            expect(list.get()).toEqual(3);
        })
    })

    describe('remove_all', () => {
        it('should remove few elements from the middle of the list', () => {
            const list = new LinkedList<number>();
            list.add_to_empty(1);
            list.add_tail(2);
            list.add_tail(2);
            list.add_tail(3);

            list.remove_all(2);
            expect(list.cursor.value).toEqual(3)

            expect(list.size()).toEqual(2);
        })

        it('should remove few elements from the start of the list', () => {
            const list = new LinkedList<number>();
            list.add_to_empty(1);
            list.add_tail(1);
            list.add_tail(2);
            list.add_tail(3);

            list.remove_all(1);

            expect(list.cursor.value).toEqual(2)
            expect(list.size()).toEqual(2);
        })

        it('should remove few elements from the start and middle of the list', () => {
            const list = new LinkedList<number>();
            list.add_to_empty(1);
            list.add_tail(1);
            list.add_tail(2);
            list.add_tail(3);
            list.add_tail(1);
            list.add_tail(4);

            list.remove_all(1);

            expect(list.cursor.value).toEqual(4)
            expect(list.size()).toEqual(3);
        })

        it('should remove few elements from the end of the list', () => {
            const list = new LinkedList<number>();
            list.add_to_empty(1);
            list.add_tail(2);
            list.add_tail(3);
            list.add_tail(3);

            list.remove_all(3);

            expect(list.cursor.value).toEqual(2)
            expect(list.size()).toEqual(2);
        })

    })
})

describe('TwoWayList', () => {

    describe('left', () => {
        it('should point cursor to the prev node and set status correctly', () => {
            const list = new TwoWayList<number>();
            list.add_to_empty(1);
            list.add_tail(2);
            list.add_tail(3);
            list.right();

            list.left()

            expect(list.cursor.value).toEqual(1);
            expect(list.get_left_status()).toEqual(1);
        });

        it('should not point the cursor prev the first node and set the correct status', () => {
            const list = new TwoWayList<number>();
            list.add_to_empty(1);

            list.left();

            expect(list.cursor.value).toEqual(1);
            expect(list.get_left_status()).toEqual(2);
        })

    })

})
