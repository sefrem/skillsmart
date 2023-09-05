let getMapKey key m = if Map.count m = 1 then Some m.[key] else None

// 43.3
let try_find key m = m |> Map.filter (fun k v -> k = key) |> getMapKey key