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
let rec bigList n k =
    let acc = k []
    match n with
    | 0 -> acc
    | _ -> bigList (n-1) (fun res -> 1::acc)
