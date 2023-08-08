let curry f = fun (x: int) -> fun (y: int) -> f(x,y) :int

let uncurry f = fun (g: int, b: int) -> f g b : int