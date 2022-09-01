

6.3.1 SELECT ContactType FROM Contacts GROUP BY ContactType  
6.3.2 SELECT CategoryId, AVG(UnitPrice) as AVG_UNIT_PRICE  
        FROM Products    
        GROUP BY CategoryId  
        ORDER BY AVG_UNIT_PRICE    
