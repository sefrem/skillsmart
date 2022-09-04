
9.4.1  
SELECT t1.ContactName, t2.ContactName, t2.Region  
FROM Customers t1, Customers t2  
WHERE t1.CustomerID <> t2.CustomerID  
AND (t1.Region IS NULL) AND (t2.Region IS NULL)  
9.4.2  
SELECT Orders.OrderID, Customers.Region  
FROM Orders, Customers  
WHERE Customers.Region = ANY (  
SELECT Region FROM Customers)  
9.4.3  
SELECT * FROM Orders  
WHERE Orders.Freight > ALL (  
SELECT UnitPrice FROM Products) 



