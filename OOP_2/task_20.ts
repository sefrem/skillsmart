
// 1. Наследование реализации

abstract class IAnimal {
    abstract move()

    abstract eat()

    abstract sleep()
}

class Animal implements IAnimal {
    private isFull: boolean;
    private isRested: boolean;
    protected position: number[] = [0, 0];

    eat() {
        this.isFull = true;
    }

    move() {
        this.position = [this.position[0] + 1, this.position[1] + 1];
    }

    sleep() {
        this.isRested = true;
    }
}

class Tiger extends Animal {
    private isHungry: boolean;

    move() {
        super.move();
        this.position = [this.position[0] + 1, this.position[1] + 1];
    }

    sleep() {
        super.sleep();
        this.isHungry = true;
    }
}

// 2. Льготное наследование

class CustomIterator {

    iterate(value: any, action: () => {}) {
        console.log('iterating')
    }
}

class LinearIterator extends CustomIterator {
    iterate(value: any[], action: (arg0: any) => void) {
        console.log('iterates over linear structure and applying action to every member')
    }
}

class TreeIterator extends CustomIterator {
    iterate(value: any) {
        console.log('iterates over tree structure')
    }
}

class Main extends LinearIterator {
    private data = [];

    action() {
        this.iterate(this.data, (a) => a + 1)
    }
}


