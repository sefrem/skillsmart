

13.3.1  
UPDATE [Order Details]  
SET Discount = 0.20  
WHERE Quantity > 50  
13.3.2  
UPDATE Contacts  
SET City = 'Piter', Country = 'Russia'  
WHERE City = 'Berlin'  
13.3.3  
DELETE FROM Shippers  
WHERE ShipperID=(SELECT MAX(ShipperID) FROM Shippers)  
