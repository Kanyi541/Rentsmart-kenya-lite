
'use server'

import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, serverTimestamp, query, where, getDoc, doc, Timestamp, orderBy } from "firebase/firestore";
import type { Complaint } from "@/lib/types";
import { createComplaintSchema } from "../schemas";
import { z } from "zod";

type ComplaintData = z.infer<typeof createComplaintSchema>;

export async function createComplaint(data: ComplaintData) {
    const requestCol = collection(db, 'complaints');
    await addDoc(requestCol, {
        ...data,
        status: 'New',
        createdAt: serverTimestamp()
    });
}

export async function getComplaintsForTenant(tenantId: string): Promise<Complaint[]> {
    if (!tenantId) return [];

    const complaintsCol = collection(db, 'complaints');
    const q = query(complaintsCol, where('tenantId', '==', tenantId));
    const snapshot = await getDocs(q);

    const complaintsWithDetails = await Promise.all(snapshot.docs.map(async (d) => {
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
        } as Complaint;
    }));
    
    complaintsWithDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return complaintsWithDetails;
}


export async function getAllComplaints(): Promise<Complaint[]> {
    const complaintsCol = collection(db, 'complaints');
    const q = query(complaintsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const complaintsWithDetails = await Promise.all(snapshot.docs.map(async (d) => {
        const data = d.data();
        const tenantRef = doc(db, 'tenants', data.tenantId);
        const rentalRef = doc(db, 'rentals', data.rentalId);
        const roomRef = doc(db, `rentals/${data.rentalId}/rooms/${data.roomId}`);

        const [tenantSnap, rentalSnap, roomSnap] = await Promise.all([
            getDoc(tenantRef),
            getDoc(rentalRef),
            getDoc(roomRef)
        ]);

        const tenantData = tenantSnap.exists() ? tenantSnap.data() : null;

        return {
            id: d.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            tenantName: tenantData ? `${tenantData.firstName} ${tenantData.secondName}` : 'N/A',
            rentalName: rentalSnap.exists() ? rentalSnap.data().name : 'N/A',
            roomNumber: roomSnap.exists() ? roomSnap.data().roomNumber : 'N/A',
        } as Complaint;
    }));
    
    return complaintsWithDetails;
}
