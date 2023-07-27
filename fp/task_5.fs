// 16.1
let notDivisible (n, m) = m % n = 0

// 16.2
let prime = function
    | 2 -> true
    | 3 -> true
    | n -> (n + 1) % 6 = 0 || (n - 1) % 6 = 0