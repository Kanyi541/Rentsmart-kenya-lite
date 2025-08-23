
'use server'

import { mockRentals, mockTenants } from "@/lib/mock-data";

export async function getDashboardStats() {
    const totalRentals = mockRentals.length;
    const totalTenants = mockTenants.length;
    
    const totalRooms = mockRentals.reduce((acc, rental) => acc + rental.rooms.length, 0);
    const occupiedRooms = mockRentals.reduce((acc, rental) => {
        return acc + rental.rooms.filter(room => room.isOccupied).length;
    }, 0);

    return {
        totalRentals,
        totalTenants,
        totalRooms,
        occupiedRooms,
    };
}
