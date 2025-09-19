
'use server'

import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, serverTimestamp, query, where, getDoc, doc, Timestamp, orderBy, updateDoc } from "firebase/firestore";
import type { MoveOutNotice } from "@/lib/types";
import { createMoveOutNoticeSchema } from "../schemas";
import { z } from "zod";

type MoveOutNoticeData = z.infer<typeof createMoveOutNoticeSchema>;

export async function createMoveOutNotice(data: MoveOutNoticeData) {
    const noticeCol = collection(db, 'moveOutNotices');
    await addDoc(noticeCol, {
        ...data,
        status: 'Pending',
        createdAt: serverTimestamp()
    });
}

export async function getNoticesForTenant(tenantId: string): Promise<MoveOutNotice[]> {
    if (!tenantId) return [];

    const noticesCol = collection(db, 'moveOutNotices');
    const q = query(noticesCol, where('tenantId', '==', tenantId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: (d.data().createdAt as Timestamp)?.toDate().toISOString(),
        moveOutDate: (d.data().moveOutDate as Timestamp)?.toDate(),
    } as MoveOutNotice));
}


export async function getAllNotices(): Promise<MoveOutNotice[]> {
    const noticesCol = collection(db, 'moveOutNotices');
    const q = query(noticesCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const noticesWithDetails = await Promise.all(snapshot.docs.map(async (d) => {
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
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString(),
            moveOutDate: (data.moveOutDate as Timestamp)?.toDate(),
            tenantName: tenantData ? `${tenantData.firstName} ${tenantData.secondName}` : 'N/A',
            rentalName: rentalSnap.exists() ? rentalSnap.data().name : 'N/A',
            roomNumber: roomSnap.exists() ? roomSnap.data().roomNumber : 'N/A',
        } as MoveOutNotice;
    }));
    
    return noticesWithDetails;
}


export async function updateNoticeStatus(id: string, status: 'Pending' | 'Processed'): Promise<{success: true}> {
    const noticeRef = doc(db, 'moveOutNotices', id);
    await updateDoc(noticeRef, { status });
    return { success: true };
}

