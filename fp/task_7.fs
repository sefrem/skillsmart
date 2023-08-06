// 20.3.1
let vat n x = x * (1. + (float n / 100.))

// 20.3.2
let unvat n x = x / (1. + (float n / 100.))

// 20.3.3
let rec min f = 
    let rec iter n = if f n = 0 then n else iter (n+1)

    iter 1