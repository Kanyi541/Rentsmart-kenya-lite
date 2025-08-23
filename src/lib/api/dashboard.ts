
'use server'

import { collection, getDocs, collectionGroup, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getDashboardStats() {
    const rentalsCol = collection(db, 'rentals');
    const tenantsCol = collection(db, 'tenants');

    const rentalSnapshot = await getDocs(rentalsCol);
    const tenantSnapshot = await getDocs(tenantsCol);

    const totalRentals = rentalSnapshot.size;
    const totalTenants = tenantSnapshot.size;

    const roomsQuery = query(collectionGroup(db, 'rooms'));
    const roomsSnapshot = await getDocs(roomsQuery);
    
    const totalRooms = roomsSnapshot.size;
    const occupiedRooms = roomsSnapshot.docs.filter(doc => doc.data().isOccupied).length;

    return {
        totalRentals,
        totalTenants,
        totalRooms,
        occupiedRooms,
    };
}
