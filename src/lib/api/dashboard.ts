
'use server'

import { collection, getDocs, collectionGroup, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getDashboardStats() {
    const rentalsCol = collection(db, 'rentals');
    const tenantsCol = collection(db, 'tenants');
    const roomsQuery = query(collectionGroup(db, 'rooms'));

    const [rentalSnapshot, tenantSnapshot, roomsSnapshot] = await Promise.all([
        getDocs(rentalsCol),
        getDocs(tenantsCol),
        getDocs(roomsQuery),
    ]);

    const totalRentals = rentalSnapshot.size;
    const totalTenants = tenantSnapshot.size;
    const totalRooms = roomsSnapshot.size;
    const occupiedRooms = roomsSnapshot.docs.filter(doc => doc.data().isOccupied).length;

    return {
        totalRentals,
        totalTenants,
        totalRooms,
        occupiedRooms,
    };
}


export async function getStatsForRental(rentalId: string) {
    if (!rentalId) {
        return {
            tenantCount: 0,
            occupiedRooms: 0,
            totalRooms: 0
        };
    }
    
    // Get tenant count for the specific rental
    const assignmentsCol = collection(db, 'assignments');
    const q = query(assignmentsCol, where("rentalId", "==", rentalId));
    const assignmentsSnapshot = await getDocs(q);
    const tenantCount = assignmentsSnapshot.size;

    // Get room stats for the specific rental
    const roomsCol = collection(db, `rentals/${rentalId}/rooms`);
    const roomsSnapshot = await getDocs(roomsCol);
    const totalRooms = roomsSnapshot.size;
    const occupiedRooms = roomsSnapshot.docs.filter(doc => doc.data().isOccupied).length;

    return {
        tenantCount,
        occupiedRooms,
        totalRooms
    };
}
