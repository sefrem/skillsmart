

class Car {
    getCar(): Car {
        console.log('Getting a car')
        return this
    }
}

class Mercedes extends Car {
    getCar(): Mercedes {
        console.log('Getting Mercedes')
        return this;
    }
}

class Audi extends Car {
    getCar(): Audi {
        console.log('Getting Audi');
        return this;
    }
}

function getCar(car: Car): Car {
    return car.getCar()
}

const mercedes = new Mercedes();
getCar(mercedes); // Getting Mercedes

const audi = new Audi();
getCar(audi); // Getting Audi
