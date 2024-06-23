
//Вариант 1 - метод публичен в родительском классе А и публичен в его потомке B;
class A1 {
    public method() {}
}

class A1_child extends A1 {
    public method() {}
}

// Варианты 2-4 в Typescript не поддерживаются
// Вариации метода 3 можно добиться, сделав родительский метод protected - он доступен только потомкам
class A3 {
    protected method() {}
}

class A3_child extends A3 {
    public method() {}
}
