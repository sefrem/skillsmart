
// В Javascript миксины добавляются в прототип объекта, чтобы быть доступными во всех экземплярах данного объекта (класса)
// и в его наследниках. Например:

class User {
    constructor(name) {
        this.name = name;
    }
}

class System {
    users = [];
    addUser(user) {
        this.users.push(user);
    };
}

const mixin = {
    sayHello() {
        console.log(`Hello, ${this.users.at(-1)?.name}`)
    }
}

Object.assign(System.prototype, mixin);

const system = new System();
const user1 = new User('John');
const user2 = new User('Ivan');

system.addUser(user1);
system.sayHello();
system.addUser(user2);
system.sayHello();

// Результат
// Hello, John
// Hello, Ivan