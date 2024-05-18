

class Animal {

    constructor() {}

    eat() {
        console.log('Animal eats')
    }

    sleep() {
        console.log('Animal sleeps')
    }

    walk() {
        console.log('Animal walks')
    }
}

//Наследование - класс Dog наследуется от класса Animal
class Dog extends Animal {

    //Полиморфизм - метод walk переопределен в классе Dog
    walk() {
        console.log('The dog walks as a dog')
    }

    bark() {
        console.log('The dog barks')
    }
}

//Композиция - функция addRunToAnimal добавляет поведение к классу
function addRunToAnimal(obj) {
    obj['run'] = () => console.log('The animal runs');
}


//Пример
const dog = new Dog();
dog.bark();
dog.walk();
dog.sleep();
addRunToAnimal(dog);
dog.run()
