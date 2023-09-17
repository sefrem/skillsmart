// 49.5.1
let even_seq = Seq.initInfinite (fun i -> i*2)

let rec factorial = function
    | 0 -> 1
    | x -> x * factorial(x-1) 

// 49.5.2
let fac_seq = Seq.initInfinite factorial |> Seq.cache

// 49.5.3
let seq_seq = 0 |> Seq.unfold (fun i -> if i < 0 then Some(i, -i) else Some(i, -(i+1))) 