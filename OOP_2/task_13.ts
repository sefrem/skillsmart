
import {General} from "./task_9";

class T extends General {
    constructor(public value: any) {
        super();
    }

    add(value: T) {
        this.value += value;
    }
}


class Vector<M extends T[]> {
    constructor(private value: M) {}

    add(value: M): T[] | null {
        if (value.length !== this.value.length) {
            return null
        }
        return value.map((val, index) => {
            return new T(val.value + this.value[index].value)
        })
    }
}

const arr1: T[] = [new T(123), new T(234)]
const arr2: T[] = [new T(345), new T(345)]

const a = new Vector(arr1);

a.add(arr2); //[ T { value: 468 }, T { value: 579 } ]

// Данный вариант не будет работать для объектов типа Vector<Vector<T>>