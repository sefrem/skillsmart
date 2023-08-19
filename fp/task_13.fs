// 39.1
let rec rmodd = function
    | _ :: (head :: tail) -> head :: rmodd tail
    | _ -> []

// 39.2
let rec del_even = function
    | head :: tail -> if head % 2 = 0 then del_even tail else head :: del_even tail
    | _ -> []

// 39.3
let rec multiplicity x xs = 
    match (x, xs) with
        | x, head :: tail when head = x -> 1 + multiplicity x tail 
        | x, _ :: tail -> multiplicity x tail
        | (_, []) -> 0

// 39.4
let rec split = function
    | head1 :: head2 :: tail -> let heada, headb = split tail 
                                head1::heada, head2::headb
    | [x] -> [x], []
    | [] -> [], []

// 39.5
let rec zip (xs1,xs2) = 
    match (xs1, xs2) with
    | list1, list2 when List.length list1 <> List.length list2 -> failwith "Lists are not of equal length"
    | head1 :: tail1, head2 :: tail2 -> (head1, head2) :: zip(tail1, tail2)                            
    | _ -> []


