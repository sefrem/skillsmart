// 48.4.1
let rec fibo1 n n1 n2 =
    let rec f x a b =
        if x = 1 then a
        else f (x-1) (a+b) a
    f n n1 n2

// 48.4.2
let rec fibo2 n c =
    if n <= 2 then c 1 
    else fibo2(n-1) (fun x -> fibo2(n-2) (fun y -> c x+y))

// 48.4.3
let rec bigList n =
    let rec f x acc = 
        if x = 0 then acc
        else f (x-1) (1::acc)
    f n []

let rec bigList1 n id =
    let rec f n acc =
        match n with
        | n when n > 0 -> f(n-1) (fun res -> acc(1::res))
        | 0 -> acc []
    f n id