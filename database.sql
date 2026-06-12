-- SQL statements to create the database and tables for the RentNode application.

-- Create the database
CREATE DATABASE IF NOT EXISTS RentNode_db;
USE RentNode_db;

-- Table for Rental Properties
-- This table stores the main details of each rental property.
CREATE TABLE rentals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    ownerName VARCHAR(255) NOT NULL,
    ownerNumber VARCHAR(20) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for Rooms
-- Each room belongs to a specific rental property.
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rental_id INT NOT NULL,
    roomNumber VARCHAR(50) NOT NULL,
    roomType ENUM('Single Room', 'Bedsitter', '1 Bedroom', '2 Bedroom', '3 Bedroom', '4 Bedroom') NOT NULL,
    rent DECIMAL(10, 2) NOT NULL,
    isOccupied BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE,
    UNIQUE KEY (rental_id, roomNumber) -- Ensures room numbers are unique within a rental
);

-- Table for Tenants
-- This table stores information about the tenants.
CREATE TABLE tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    secondName VARCHAR(100) NOT NULL,
    thirdName VARCHAR(100), -- Optional
    idNumber VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    maritalStatus ENUM('Single', 'Married', 'Divorced', 'Widowed') NOT NULL,
    gender ENUM('Male', 'Female') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for Assignments
-- This table links a tenant to a specific room in a rental property,
-- acting as the "lease" or "tenancy" record.
CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    rental_id INT NOT NULL,
    room_id INT NOT NULL,
    assignmentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
    FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE RESTRICT,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    UNIQUE KEY (room_id) -- Ensures a room can only be assigned to one tenant at a time
);

-- After creating an assignment, you should also run an UPDATE statement
-- to mark the corresponding room as occupied.
--
-- Example:
-- UPDATE rooms SET isOccupied = TRUE WHERE id = [the_room_id_from_the_assignment];
