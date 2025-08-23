
'use server';

import type { Rental, Tenant, Assignment, Room } from "./types";

// Mock data store
const MOCK_DATA = {
    rentals: [
        {
            id: '1',
            name: 'K-Heights Apartments',
            location: 'Kileleshwa, Nairobi',
            ownerName: 'John Doe',
            ownerNumber: '0712345678',
            rooms: [
                { id: '101', rentalId: '1', roomNumber: 'A101', roomType: '1 Bedroom', rent: 45000, isOccupied: true },
                { id: '102', rentalId: '1', roomNumber: 'A102', roomType: '1 Bedroom', rent: 45000, isOccupied: false },
                { id: '103', rentalId: '1', roomNumber: 'B201', roomType: '2 Bedroom', rent: 60000, isOccupied: true },
            ]
        },
        {
            id: '2',
            name: 'Green-Span Gardens',
            location: 'Donholm, Nairobi',
            ownerName: 'Jane Smith',
            ownerNumber: '0722334455',
            rooms: [
                { id: '201', rentalId: '2', roomNumber: 'G01', roomType: 'Bedsitter', rent: 15000, isOccupied: false },
                { id: '202', rentalId: '2', roomNumber: 'G02', roomType: 'Bedsitter', rent: 15000, isOccupied: false },
            ]
        }
    ] as Rental[],
    tenants: [
        { id: '1', firstName: 'Alice', secondName: 'Wanjiru', idNumber: '12345678', phone: '0787654321', email: 'alice@example.com', maritalStatus: 'Single', gender: 'Female' },
        { id: '2', firstName: 'Bob', secondName: 'Otieno', idNumber: '87654321', phone: '0711223344', email: 'bob@example.com', maritalStatus: 'Married', gender: 'Male' }
    ] as Tenant[],
    assignments: [
        { id: '1', tenantId: '1', rentalId: '1', roomId: '101' },
        { id: '2', tenantId: '2', rentalId: '1', roomId: '103' },
    ] as Assignment[]
}

// Mock query function
export async function query(sql: string, params: any[]): Promise<any> {
    console.log("Mock DB Query:", sql, params);

    // This is a simplified mock. We'll determine the operation based on the SQL string.
    
    if (sql.startsWith('SELECT COUNT(*) as count FROM rentals')) {
        return [{ count: MOCK_DATA.rentals.length }];
    }
    if (sql.startsWith('SELECT COUNT(*) as count FROM tenants')) {
        return [{ count: MOCK_DATA.tenants.length }];
    }
    if (sql.startsWith('SELECT COUNT(*) as count FROM rooms WHERE isOccupied')) {
        const occupiedCount = MOCK_DATA.rentals.flatMap(r => r.rooms).filter(room => room.isOccupied).length;
        return [{ count: occupiedCount }];
    }
    if (sql.startsWith('SELECT COUNT(*) as count FROM rooms')) {
        const totalRooms = MOCK_DATA.rentals.flatMap(r => r.rooms).length;
        return [{ count: totalRooms }];
    }
    if (sql.startsWith('SELECT * FROM rentals')) {
        return MOCK_DATA.rentals;
    }
     if (sql.startsWith('SELECT * FROM rooms WHERE rentalId')) {
        const rentalId = params[0];
        const allRooms = MOCK_DATA.rentals.flatMap(r => r.rooms);
        return allRooms.filter(room => room.rentalId === rentalId);
    }
    if (sql.startsWith('SELECT * FROM tenants')) {
        return MOCK_DATA.tenants;
    }
    if (sql.startsWith('INSERT INTO rentals')) {
        const newRental = {
            id: String(new Date().getTime()),
            name: params[0],
            location: params[1],
            ownerName: params[2],
            ownerNumber: params[3],
            rooms: []
        };
        MOCK_DATA.rentals.push(newRental as Rental);
        return { insertId: newRental.id };
    }
    if (sql.startsWith('INSERT INTO rooms')) {
         const rental = MOCK_DATA.rentals.find(r => r.id === params[0]);
         if(rental) {
            const newRoom: Room = {
                id: String(new Date().getTime()),
                rentalId: params[0],
                roomNumber: params[1],
                roomType: params[2],
                rent: params[3],
                isOccupied: params[4]
            };
            rental.rooms.push(newRoom);
         }
        return { insertId: new Date().getTime() };
    }
    if (sql.startsWith('INSERT INTO tenants')) {
        const newTenant: Tenant = {
            id: String(new Date().getTime()),
            firstName: params[0],
            secondName: params[1],
            thirdName: params[2],
            idNumber: params[3],
            phone: params[4],
            email: params[5],
            maritalStatus: params[6],
            gender: params[7],
        };
        MOCK_DATA.tenants.push(newTenant);
        return { insertId: newTenant.id };
    }
    if (sql.startsWith('INSERT INTO assignments')) {
        const newAssignment: Assignment = {
            id: String(new Date().getTime()),
            tenantId: params[0],
            rentalId: params[1],
            roomId: params[2],
        };
        MOCK_DATA.assignments.push(newAssignment);
        return { insertId: newAssignment.id };
    }
    if (sql.startsWith('UPDATE rooms SET isOccupied')) {
        const roomId = params[1];
        MOCK_DATA.rentals.forEach(rental => {
            const room = rental.rooms.find(r => r.id === roomId);
            if (room) {
                room.isOccupied = params[0];
            }
        });
        return {};
    }
    
    return [];
}
