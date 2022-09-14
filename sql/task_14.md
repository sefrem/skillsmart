
15.7  
CREATE DATABASE MyTest 


USE MyTest


CREATE TABLE Territories (TerritoryID nvarchar(20) NOT NULL,  
TerritoryDescription nchar(50) NOT NULL,  
PRIMARY KEY (TerritoryID),  
RegionID int NOT NULL  
)  


CREATE TABLE Region (RegionID int NOT NULL,  
RegionDescription nchar(50) NOT NULL,  
PRIMARY KEY(RegionID)  
)  

ALTER TABLE Territories  
ADD FOREIGN KEY (RegionID) REFERENCES Region(RegionID)


INSERT INTO Region (RegionID, RegionDescription)  
VALUES (1, 'WEST')    


INSERT INTO Region VALUES (2, 'EAST')  


INSERT INTO Territories (TerritoryID, TerritoryDescription, RegionID)  
VALUES (1, 'WEST', 1)


INSERT INTO Territories VALUES (2, 'Moscow', 2) 

