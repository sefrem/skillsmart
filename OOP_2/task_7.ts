
class Shape {

    draw() {
        console.log('Drawing a shape')
    }
}

class Square extends Shape {

    draw() {
        console.log('Drawing a square')
    }
}

class Triangle extends Shape {

    draw() {
        console.log('Drawing a triangle')
    }
}

const shape1: Shape = new Square();
const shape2: Shape = new Triangle();

// Конкретные методы фигур будут динамически определены во время исполнения.
shape1.draw(); //Drawing a square
shape2.draw(); //Drawing a triangle
