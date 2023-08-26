
let rec binary_search (x, list: list<int>, startIndex, endIndex, isInsert) = 
    let index = startIndex + (endIndex - startIndex ) / 2
    match () with
    | () when startIndex > endIndex -> if isInsert then startIndex else -1
    | () when x = list[index] -> index
    | () when x < list[index] -> binary_search (x, list, startIndex, index-1, isInsert)
    | () when x > list[index] -> binary_search (x, list, index+1, endIndex, isInsert)
    | () -> -1

let rec find_first (list: list<int>, value, index) = 
    match () with
    | () when index < 0 || list[index] <> value -> index+1
    | () when list[index] = value -> find_first (list, value, index-1)
    | () -> index

let countFromIndex (listA: list<int>, startIndex) =
    let startValue = listA[startIndex]
    let rec iter (index, acc) = 
        match () with
        | () when index = List.length listA -> acc
        | () when listA[index] = startValue -> iter(index+1, acc+1)
        | () -> acc
    
    iter(startIndex, 0)

// 40.1
let rec sum (p, xs) = 
    match (p, xs) with
    | (p, head :: tail) -> if p head then head + sum (p, tail) else sum (p, tail)
    | (_, []) -> 0

// 40.2.1
let rec count (xs, n) = 
    let index = binary_search(n, xs, 0,List.length xs - 1, false)
    if index = -1 then 0 else
    let start = find_first(xs, n, index)
    
    countFromIndex(xs, start)

// 40.2.2
let rec insert (xs, n) = 
    let insertIndex = binary_search(n, xs, 0, List.length xs - 1, true)
    xs |> List.insertAt insertIndex n 

// 40.2.3
let rec intersect (xs1, xs2) =
    let rec iter (index, result) = 
        if index >= List.length xs1 then result else
        let q2 = count(xs2, xs1[index])
        let q1 = if q2 > 0 then countFromIndex(xs1, index) else 1

        match () with
        | () when index > List.length xs1 - 1 -> result
        | () when q2 > 0 -> iter (index+q1, result @ List.init (q2+q1) (fun _ -> xs1[index]))
        | () -> iter (index+1, result)

    iter (0, [])

// 40.2.4
let rec plus (xs1, xs2) =
    let lastIndex1 =  List.length xs1-1
    let lastIndex2 =  List.length xs2-1
    
    let rec iter (index1, index2, result) =   
        match () with
        | () when (lastIndex2 < index2 && lastIndex1 >= index1) || (index1 <= lastIndex1 && xs1[index1] <= xs2[index2]) -> iter(index1+1, index2, result @ [xs1[index1]])
        | () when (lastIndex1 < index1 && lastIndex2 >= index2) || (index2 <= lastIndex2 && xs1[index1] > xs2[index2] )-> iter(index1, index2+1, result @ [xs2[index2]])
        | () when lastIndex1 < index1 && lastIndex2 < index2 -> result
        | () -> result

    iter (0, 0, [])

// 40.2.5
let rec minus (xs1, xs2) = 
    let rec iter(index, result) = 
        match () with
        | () when index = List.length xs1 -> result
        | () when binary_search(xs1[index], xs2, 0, List.length xs2-1, false) <> -1 -> iter(index+1, result)
        | () -> iter(index+1, result @ [xs1[index]])
    
    iter(0, [])

// 40.3.1
let rec smallest (xs) = 
    let rec iter(index, smallest) = 
        match () with
        | () when index = List.length xs -> Some smallest
        | () when xs[index] < smallest -> iter(index+1, xs[index])
        | () -> iter(index+1, smallest)
    
    iter(0, xs[0])

// 40.3.2
let rec delete (n, xs) = 
    let rec iter(index, result, isRemoved) = 
        match () with
        | () when index = List.length xs -> result
        | () when xs[index] <> n -> iter(index+1, result@[xs[index]], isRemoved)
        | () when xs[index] = n -> if isRemoved then iter(index+1, result@[xs[index]], isRemoved) else iter(index+1, result, true)
        | () -> result

    iter(0, [], false)

// 40.3.3
let rec sort (xs) = 
    match () with
    | () when List.length xs = 0 -> [] 
    | () -> let smallest = Option.get(smallest(xs))
            smallest :: sort(delete(smallest, xs)) 

// 40.4
let rec revrev (xs) = xs |> List.map (fun x -> List.rev x) |> List.rev
