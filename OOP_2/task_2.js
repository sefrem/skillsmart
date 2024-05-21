//Пример 1. Специализация
// Родитель
class Vehicle {
    wheels;
    doors;

    constructor(wheels, doors) {
        this.wheels = wheels;
        this.doors = doors;
    }

    drive() {
        console.log('this is vehicle driving');
    }

    fillUp() {
        console.log('filling up the gas tank');
    }
}

//Наследник - более специализированный случай. В конструктор переданы
// конкретные значения для этого класса транспортных средств. Переопределен
// метод drive(), добавлен уникальный для данного транспортного средства способ передвижения
class Bike extends Vehicle {

    constructor() {
        super(2, 0);
    }

    drive() {
        console.log('this is bike driving')
    }

    rearUp() {
        console.log('rear wheel driving because I can')
    }
}


//Пример 2. Расширение

class Shape {

    constructor() {
    }

    draw() {
        console.log('draws black and white shape')
    }
}

//Дочерний класс расширяет возможности родительского класса
class ColoredShape extends Shape {
    constructor() {
        super()
    }

    draw(color) {
        console.log(`draws ${color} shape`)
    }
}