// 17.1
let rec pow = function
    | (_, 0) -> ""
    | (s, 1) -> s
    | (s, n) -> s + pow(s, n-1)

// 17.2
let rec isIthChar = function
    | (s, n, _) when n < 0 || n >= String.length s -> false 
    | (s, n, c) -> s.[n] = c 

// 17.3
let rec occFromIth = function
    | (s, n, c) when n < String.length s && s.[n] = c -> 1 + occFromIth(s, n+1, c)
    | (s, n, c) when n < String.length s -> occFromIth(s, n+1, c)
    | _ -> 0
    