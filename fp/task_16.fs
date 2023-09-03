let rec powerset xs =
    match xs with
    | [] -> [ [] ]
    | head :: tail -> List.fold (fun acc a -> (head :: a) :: a :: acc) [] (powerset tail)

// 42.3
let rec allSubsets n k = List.filter (fun x -> List.length x = k) (powerset [1..n]) |> List.map Set.ofList  |> Set.ofList

