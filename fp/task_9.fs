// 23.4.1
let (.+.) x y = 
    let (a, b, c) = x
    let (d, e, f) = y

    let rec calc = function
        | (g, s, z) when z > 11 -> calc(g, s + (z / 12), z % 12) 
        | (g, s, z) when s > 19 -> calc(g + (s / 20), s % 20, z) 
        | (g, s, z) -> (g, s, z)

    calc (a + d, b + e, c + f)

let (.-.) x y = 
    let (a, b, c) = x
    let (d, e, f) = y

    let rec calc = function
        | (g, s, z) when z < 0 && s = 0 -> calc(g-1, s+19, z+12) 
        | (g, s, z) when z < 0 && s > 0 -> calc(g, s-1, z+12) 
        | (g, s, z) when s < 0 && g > 0 -> calc(g-1, s+20, z) 
        | (g, s, z) -> (g, s, z)

    calc (a - d, b - e, c - f)

// 23.4.2
let (.+) x y = 
    let (a, b) = x
    let (c, d) = y

    (a + c, b + d)

let (.*) x y = 
    let (a, b) = x
    let (c, d) = y

    (a*c - b*d, b*c + a*d)

let (.-) x y =
    let (a, b) = x
    let (c, d) = y

    (a - c, b - d)

let (./) x y = 
    let (a, b) = x
    let (c, d) = y

    ((a*c + b*d)/(c*c + d*d), (b*c - a*d)/(c*c + d*d))