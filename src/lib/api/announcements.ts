
'use server'

import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, Timestamp, deleteDoc, doc, where } from "firebase/firestore";
import { z } from "zod";
import { announcementSchema } from "../schemas";
import type { Announcement } from "../types";

type AnnouncementData = z.infer<typeof announcementSchema>;

export async function createAnnouncement(data: AnnouncementData) {
    if (!data.orgId) throw new Error("orgId is required");
    const annCol = collection(db, 'announcements');
    await addDoc(annCol, {
        ...data,
        createdAt: serverTimestamp()
    });
}

export async function getAnnouncements(orgId: string): Promise<Announcement[]> {
    if (!orgId) return [];
    const annCol = collection(db, 'announcements');
    const q = query(annCol, where('orgId', '==', orgId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
    } as Announcement));
}

export async function deleteAnnouncement(id: string) {
    const annRef = doc(db, 'announcements', id);
    await deleteDoc(annRef);
}
