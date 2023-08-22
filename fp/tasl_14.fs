/40.1. Напишите функцию sum(p, xs), где p -- предикат int -> bool, и xs -- список целых. 
//Функция возвращает сумму тех элементов xs, для которых предикат истинен.

let rec sum (p, xs) = 
    match (p, xs) with
    | (p, head :: tail) -> if p head then head + sum (p, tail) else sum (p, tail)
    | (_, []) -> 0

let testP a = a % 2 = 0

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

// 40.2.1. Напишите функцию count: int list * int -> int, 
// которая подсчитывает количество вхождений числа в список.

let countFromIndex (listA: list<int>, startIndex) =
    let startValue = listA[startIndex]
    let rec iter (index, acc) = 
        match () with
        | () when index = List.length listA -> acc
        | () when listA[index] = startValue -> iter(index+1, acc+1)
        | () -> acc
    
    iter(startIndex, 0)

let rec count (xs, n) = 
    let index = binary_search(n, xs, 0,List.length xs - 1, false)
    if index = -1 then 0 else
    let start = find_first(xs, n, index)
    
    countFromIndex(xs, start)


//40.2.2. Напишите функцию insert: int list * int -> int list, которая добавляет новый элемент в список.
let rec insert (xs, n) = 
    let insertIndex = binary_search(n, xs, 0, List.length xs - 1, true)
    xs |> List.insertAt insertIndex n 

let test_list = [3; 3; 4; 5; 6; 7]
let test_list_2 = [1; 2; 3; 5]

//40.2.3. Напишите функцию intersect: int list * int list -> int list, 
//которая находит общие элементы в обоих списках, включая повторяющиеся.

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

//40.2.4. Напишите функцию plus: int list * int list -> int list, 
//которая формирует список, объединяющий все элементы входных списков, включая повторяющиеся.

let rec plus (xs1: list<int>, xs2: list<int>) =
    // let rec iter (index, result) = 
    //     if index >= List.length xs1 then result else
    //     let q2 = count(xs2, xs1[index])
    //     let q1 = countFromIndex(xs1, index)

    //     match () with
    //     | () when index > List.length xs1 - 1 -> result
    //     | () when q2 > 0 -> iter (index+q1, result @ List.init (q2+q1) (fun _ -> xs1[index]) )
    //     | () -> iter (index+1, result @ List.init (q1) (fun _ -> xs1[index]))
    let lastIndex1 =  List.length xs1-1
    let lastIndex2 =  List.length xs2-1
    
    let rec iter (index1, index2, result) =   
        printfn "%A" (result, index1, index2)
        match () with
        // | () when (lastIndex1 = index1 && lastIndex2 >= index2) -> iter(index1, index2+1, result @ [xs2[index2]])
        // | () when (lastIndex2 = index2 && lastIndex1 >= index1) -> iter(index1+1, index2, result @ [xs1[index1]])
        | () when xs1[index1] <= xs2[index2] || (lastIndex2 = index2 && lastIndex1 >= index1) -> iter(index1+1, index2, result @ [xs1[index1]])
        | () when xs1[index1] > xs2[index2] || (lastIndex1 = index1 && lastIndex2 >= index2) -> iter(index1, index2+1, result @ [xs2[index2]])
        | () when lastIndex1 <= index1 && lastIndex2 <= index2 -> result
        
        | () -> result


    iter (0, 0, [])

printfn "%A" (plus (test_list, test_list_2))
