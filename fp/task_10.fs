type TimeOfDay = { hours: int; minutes: int; f: string }

let (.>.) x y = if x.f = "PM" && y.f = "AM" then true elif x.f = "AM" && y.f = "PM" then false else x > y
