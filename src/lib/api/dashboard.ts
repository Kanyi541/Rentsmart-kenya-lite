'use server'

import { query } from '@/lib/db';

export async function getDashboardStats() {
    const [totalRentals] = await query("SELECT COUNT(*) as count FROM rentals", []) as any[];
    const [totalTenants] = await query("SELECT COUNT(*) as count FROM tenants", []) as any[];
    const [totalRooms] = await query("SELECT COUNT(*) as count FROM rooms", []) as any[];
    const [occupiedRooms] = await query("SELECT COUNT(*) as count FROM rooms WHERE isOccupied = true", []) as any[];

    return {
        totalRentals: totalRentals.count,
        totalTenants: totalTenants.count,
        totalRooms: totalRooms.count,
        occupiedRooms: occupiedRooms.count
    }
}
