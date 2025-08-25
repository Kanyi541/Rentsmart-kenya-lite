
'use server'

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Room, Tenant } from "@/lib/types";

export interface OccupancyDetails extends Room {
    tenantName?: string;
    nextPaymentDue?: string;
}

export async function getOccupancyDetailsForRental(rentalId: string): Promise<OccupancyDetails[]> {
    if (!rentalId) return [];

    // 1. Fetch all rooms for the rental
    const roomsCol = collection(db, `rentals/${rentalId}/rooms`);
    const roomsSnapshot = await getDocs(roomsCol);
    const rooms: Room[] = roomsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Room));

    // 2. Fetch all assignments for the rental to find tenants
    const assignmentsCol = collection(db, 'assignments');
    const assignmentsQuery = query(assignmentsCol, where("rentalId", "==", rentalId));
    const assignmentsSnapshot = await getDocs(assignmentsQuery);
    
    // Create maps for easy lookup
    const tenantIdToRoomIdMap = new Map<string, string>(); // tenantId -> roomId
    const roomIdToTenantIdMap = new Map<string, string>(); // roomId -> tenantId
    assignmentsSnapshot.docs.forEach(doc => {
        const assignment = doc.data();
        tenantIdToRoomIdMap.set(assignment.tenantId, assignment.roomId);
        roomIdToTenantIdMap.set(assignment.roomId, assignment.tenantId);
    });
    
    if (assignmentsSnapshot.empty) {
        // Still sort vacant rooms by room number
        return rooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
    }

    // 3. Fetch all tenant details for this rental
    const tenantIds = Array.from(tenantIdToRoomIdMap.keys());
    if(tenantIds.length === 0) {
        return rooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
    }
    const tenantsCol = collection(db, 'tenants');
    const tenantsQuery = query(tenantsCol, where("__name__", "in", tenantIds));
    const tenantsSnapshot = await getDocs(tenantsQuery);
    const tenantIdToNameMap = new Map<string, string>();
    tenantsSnapshot.docs.forEach(doc => {
        const tenant = doc.data() as Tenant;
        tenantIdToNameMap.set(doc.id, `${tenant.firstName} ${tenant.secondName}`);
    });
    
    // 4. Fetch the most recent 'Rent' payment for each tenant
    const paymentsCol = collection(db, 'payments');
    const paymentsQuery = query(paymentsCol, 
        where("tenantId", "in", tenantIds),
        where("type", "==", "Rent"),
        where("status", "==", "Completed")
    );
    const paymentsSnapshot = await getDocs(paymentsQuery);
    const tenantIdToLastPaymentMap = new Map<string, Date>();
    
    paymentsSnapshot.docs.forEach(doc => {
        const payment = doc.data();
        const paymentDate = payment.createdAt.toDate();
        if (!tenantIdToLastPaymentMap.has(payment.tenantId) || paymentDate > tenantIdToLastPaymentMap.get(payment.tenantId)!) {
            tenantIdToLastPaymentMap.set(payment.tenantId, paymentDate);
        }
    });

    // 5. Combine all data
    let occupancyDetails: OccupancyDetails[] = rooms.map(room => {
        const tenantId = roomIdToTenantIdMap.get(room.id);
        if (room.isOccupied && tenantId) {
            const lastPaymentDate = tenantIdToLastPaymentMap.get(tenantId);
            let nextPaymentDue: string | undefined = undefined;
            if (lastPaymentDate) {
                const nextDueDate = new Date(lastPaymentDate);
                nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                nextPaymentDue = nextDueDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
            } else {
                // If no payment found, maybe they just moved in. Could set to start of next month.
                // For simplicity, we'll leave it undefined.
            }
            
            return {
                ...room,
                tenantName: tenantIdToNameMap.get(tenantId) || 'Unknown Tenant',
                nextPaymentDue,
            };
        }
        return room;
    });

    // 6. Sort the results
    occupancyDetails.sort((a, b) => {
        // Sort by isOccupied (true comes first)
        if (a.isOccupied !== b.isOccupied) {
            return a.isOccupied ? -1 : 1;
        }
        // Then sort by roomNumber alphabetically
        return a.roomNumber.localeCompare(b.roomNumber);
    });


    return occupancyDetails;
}
