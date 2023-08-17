
let rec rmodd = function
    | [] -> []
    | [x] -> [x]
    | _ :: (head :: tail) -> head :: rmodd tail

let rec del_even = function
    | head :: tail -> if head % 2 = 0 then del_even tail else head :: del_even tail
    | _ -> []