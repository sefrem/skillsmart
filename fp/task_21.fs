let rec factorial = function
    | 0 -> 1
    | x -> x * factorial(x-1) 
// 50.2.1
let fac_seq = seq {
        for i in 0. ..infinity do
        yield factorial(int i) 
}

// 50.2.2
let seq_seq = seq {
    for i in 0. ..infinity do
        if int i % 2 = 0 then yield int i/2 else yield (-1) * (int i + 1)/2
}
