
'use server'

import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, serverTimestamp, query, where, orderBy, getDoc, doc, Timestamp } from "firebase/firestore";
import type { MaintenanceRequest, Tenant, Rental, Room } from "@/lib/types";
import { createMaintenanceRequestSchema } from "../schemas";
import { z } from "zod";

type MaintenanceRequestData = z.infer<typeof createMaintenanceRequestSchema>;

export async function createMaintenanceRequest(data: MaintenanceRequestData) {
    const requestCol = collection(db, 'maintenanceRequests');
    await addDoc(requestCol, {
        ...data,
        status: 'Pending',
        createdAt: serverTimestamp()
    });
}

export async function getMaintenanceRequestsForTenant(tenantId: string): Promise<MaintenanceRequest[]> {
    if (!tenantId) return [];

    const requestsCol = collection(db, 'maintenanceRequests');
    // Simplified query to avoid index requirement
    const q = query(requestsCol, where('tenantId', '==', tenantId));
    const requestSnapshot = await getDocs(q);

    const requestsWithDetails = await Promise.all(requestSnapshot.docs.map(async (d) => {
        const data = d.data();
        const rentalRef = doc(db, 'rentals', data.rentalId);
        const roomRef = doc(db, `rentals/${data.rentalId}/rooms/${data.roomId}`);

        const [rentalSnap, roomSnap] = await Promise.all([
            getDoc(rentalRef),
            getDoc(roomRef)
        ]);

        return {
            id: d.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            rentalName: rentalSnap.exists() ? rentalSnap.data().name : 'N/A',
            roomNumber: roomSnap.exists() ? roomSnap.data().roomNumber : 'N/A',
        } as MaintenanceRequest;
    }));

    // Sort in code instead of in the query
    requestsWithDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


    return requestsWithDetails;
}
