
10.4.1  
SELECT Products.ProductName, [Order Details].UnitPrice     
FROM Products INNER JOIN [Order Details]     
ON [Order Details].ProductID = Products.ProductID     
AND [Order Details].UnitPrice < 20    
10.4.2  
Операция FULL JOIN соединила все поля обеих таблиц, и поля, для которых
в другой таблице не было соответствия, оказались заполнены как NULL.  
10.4.3  
SELECT Employees.FirstName, Employees.LastName, Orders.Freight  
FROM Employees CROSS JOIN Orders  
WHERE Employees.EmployeeID = Orders.EmployeeID  


Данный CROSS JOIN запрос работает как этот INNER JOIN  


SELECT Employees.FirstName, Employees.LastName, Orders.Freight
FROM Employees INNER JOIN Orders
ON Employees.EmployeeID = Orders.EmployeeID  


Т.е. чтобы CROSS JOIN работал как INNER JOIN нужно в WHERE добавить условие
аналогичное условию в ON в INNER JOIN.  
10.4.4   
SELECT Products.ProductName, [Order Details].UnitPrice  
FROM Products INNER JOIN [Order Details]   
ON Products.ProductID = [Order Details].ProductID  

