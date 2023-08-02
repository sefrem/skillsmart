// 17.1
let rec pow = function
    | (s: string, 0) -> s
    | (s: string, 1) -> s
    | (s, n) -> s + pow(s, n-1)

// 17.2
let rec isIthChar (s: string, n, c) = s.[n] = c

// 17.3
let rec occFromIth = function
    | (s, n, c) when n < String.length s && s.[n] = c -> 1 + occFromIth(s, n+1, c)
    | (s, n, c) when n < String.length s -> occFromIth(s, n+1, c)
    | _ -> 0
    