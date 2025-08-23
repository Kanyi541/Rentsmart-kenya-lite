
import type { Rental, Tenant, Assignment } from './types';

export const mockRentals: Rental[] = [
    {
        id: 1,
        name: 'Green Valley Apartments',
        location: 'Kilimani, Nairobi',
        ownerName: 'John Doe',
        ownerNumber: '0712345678',
        rooms: [
            { id: 101, roomNumber: 'A101', roomType: '1 Bedroom', rent: 25000, isOccupied: true },
            { id: 102, roomNumber: 'A102', roomType: '1 Bedroom', rent: 25000, isOccupied: false },
            { id: 103, roomNumber: 'B201', roomType: 'Bedsitter', rent: 15000, isOccupied: true },
        ]
    },
    {
        id: 2,
        name: 'Sunset Towers',
        location: 'Westlands, Nairobi',
        ownerName: 'Jane Smith',
        ownerNumber: '0798765432',
        rooms: [
            { id: 201, roomNumber: '1A', roomType: '2 Bedroom', rent: 45000, isOccupied: true },
            { id: 202, roomNumber: '1B', roomType: '2 Bedroom', rent: 45000, isOccupied: true },
        ]
    }
];

export const mockTenants: Tenant[] = [
    {
        id: 1,
        firstName: 'Alice',
        secondName: 'Wanjiru',
        idNumber: '12345678',
        phone: '0722000001',
        email: 'alice@example.com',
        maritalStatus: 'Single',
        gender: 'Female'
    },
    {
        id: 2,
        firstName: 'Bob',
        secondName: 'Odhiambo',
        idNumber: '87654321',
        phone: '0722000002',
        email: 'bob@example.com',
        maritalStatus: 'Married',
        gender: 'Male'
    }
];

export const mockAssignments: Assignment[] = [
    { id: 1, tenantId: '1', rentalId: '1', roomId: '101' },
    { id: 2, tenantId: '2', rentalId: '1', roomId: '103' },
];
