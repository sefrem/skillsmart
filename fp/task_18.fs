// 47.4.1
let f n =
    let mutable n = n
    let mutable r = 1
    while n > 0 do
        r <- r * n
        n <- n - 1
    r

// 47.4.2
let fibo n =
    let mutable count = n
    let mutable prev = 0
    let mutable last = 1
    let mutable current = 0

    while count > 1 do
        current <- prev + last
        prev <- last
        last <- current
        count <- count-1
    current