
'use server'

import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getDashboardStats(orgId: string) {
    if (!orgId) return { totalRentals: 0, totalTenants: 0, totalRooms: 0, occupiedRooms: 0 };
    
    const rentalsQuery = query(collection(db, 'rentals'), where('orgId', '==', orgId));
    const tenantsQuery = query(collection(db, 'tenants'), where('orgId', '==', orgId));
    
    // Room stats require manual counting per rental or a collectionGroup if indexed
    const rentalSnapshot = await getDocs(rentalsQuery);
    const tenantSnapshot = await getDocs(tenantsQuery);

    let totalRooms = 0;
    let occupiedRooms = 0;

    for (const rentalDoc of rentalSnapshot.docs) {
        const roomsCol = collection(db, `rentals/${rentalDoc.id}/rooms`);
        const roomsSnap = await getDocs(roomsCol);
        totalRooms += roomsSnap.size;
        occupiedRooms += roomsSnap.docs.filter(d => d.data().isOccupied).length;
    }

    return {
        totalRentals: rentalSnapshot.size,
        totalTenants: tenantSnapshot.size,
        totalRooms,
        occupiedRooms,
    };
}


export async function getStatsForRental(rentalId: string) {
    if (!rentalId) {
        return { tenantCount: 0, occupiedRooms: 0, totalRooms: 0 };
    }
    
    const assignmentsCol = collection(db, 'assignments');
    const q = query(assignmentsCol, where("rentalId", "==", rentalId));
    const assignmentsSnapshot = await getDocs(q);
    const tenantCount = assignmentsSnapshot.size;

    const roomsCol = collection(db, `rentals/${rentalId}/rooms`);
    const roomsSnapshot = await getDocs(roomsCol);
    const totalRooms = roomsSnapshot.size;
    const occupiedRooms = roomsSnapshot.docs.filter(doc => doc.data().isOccupied).length;

    return { tenantCount, occupiedRooms, totalRooms };
}
