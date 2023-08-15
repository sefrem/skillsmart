
let rec iter = function
            | a, n when List.length a < n -> iter((List.length a)+1 :: a, n)
            | a, _ -> a

let rec iterEven = function
            | a, n, start when List.length a < n && start % 2 = 0 -> iterEven(start :: a, n, start+2)
            | a, _, _ -> a

// 34.1
let rec upto = function        
    | n -> List.rev (iter([], n))

// 34.2
let rec dnto = function        
    | n -> iter([], n)

// 34.3
let rec evenn = function
     n -> List.rev (iterEven([], n, 0))