

class Animal {
    type: string;

    constructor(type: string) {
        this.type = '234'
    }
}

class Cat extends Animal {
    name: string;

    constructor() {
        super('cat');
        this.name = 'Billie'
    }
}

type IsSubtype<T, S> = T extends S ? true : false;

type T1 = IsSubtype<Cat, Animal>; // true
type T2 = IsSubtype<Promise<Cat>, Promise<Animal>>; // true
// Значит, типа Promise - ковариантный, потому что он повторяет иерархию типов


type Func<P> = (arg: P) => void;
type T3 = IsSubtype<Func<Cat>, Func<Animal>> //false
// Значит параметр функции должен быть контравариантом