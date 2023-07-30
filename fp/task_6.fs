// 17.1
let rec pow = function
    | (s, 1) -> string s
    | (s, n) -> s + pow(s, n-1)

// 17.2
let isIthChar (s: string, n, c) = s.[n] = c

// 17.3
let occFromIth (s, n, c) =
    let rec loop = function
        | (str, i, count) when String.length str = i -> count
        | (str, i, count) when i >= n && str.[i] = c -> loop(str, i+1, count+1)
        | (str, i, count) -> loop(str, i+1, count)
    
    loop (s, n, 0)