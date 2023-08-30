// 41.4.1
let list_filter f xs = List.foldBack (fun x y -> if f x = true then x::y else y) xs []

// 41.4.2
let sum (p, xs) = List.fold (fun total x -> if p x then total + x else total) 0 xs

let rev xs = List.fold (fun head tail -> tail::head) [] xs
// 41.4.3
let revrev = fun xs -> List.fold (fun head tail -> rev tail::head) [] xs
