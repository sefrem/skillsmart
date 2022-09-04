
8.3.1 SELECT Products.ProductName, Categories.CategoryName  
        FROM Products, Categories  
        WHERE Products.CategoryID = Categories.CategoryID  
8.3.2 SELECT Products.ProductName, Products.UnitPrice   
        FROM Products, [Order Details]   
        WHERE [Order Details].ProductID = Products.ProductID   
        AND [Order Details].UnitPrice < 20  
8.3.3 SELECT Products.ProductName, Products.UnitPrice, Categories.CategoryName   
        FROM Products, [Order Details], Categories   
        WHERE [Order Details].ProductID = Products.ProductID   
        AND [Order Details].UnitPrice < 20   
        AND Products.CategoryID = Categories.CategoryID   
