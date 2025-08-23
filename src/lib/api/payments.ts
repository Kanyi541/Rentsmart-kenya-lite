
'use server'

import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, query, orderBy, getDoc } from "firebase/firestore";
import type { Payment, Tenant } from "@/lib/types";
import { z } from "zod";
import { paymentSchema } from "../schemas";

type PaymentData = Omit<z.infer<typeof paymentSchema>, 'createdAt' | 'id'>;

export async function createPayment(data: PaymentData): Promise<string> {
    const paymentCol = collection(db, 'payments');
    const docRef = await addDoc(paymentCol, {
        ...data,
        createdAt: serverTimestamp()
    });
    return docRef.id;
}

export async function updatePaymentStatus(paymentId: string, status: 'Completed' | 'Failed'): Promise<void> {
    const paymentRef = doc(db, 'payments', paymentId);
    await updateDoc(paymentRef, { status });
}

export async function getPayments(): Promise<Payment[]> {
    const paymentsCol = collection(db, 'payments');
    const q = query(paymentsCol, orderBy('createdAt', 'desc'));
    const paymentSnapshot = await getDocs(q);
    
    const paymentsList = await Promise.all(paymentSnapshot.docs.map(async (paymentDoc) => {
        const paymentData = paymentDoc.data() as Payment;

        // Fetch tenant details
        const tenantRef = doc(db, 'tenants', paymentData.tenantId);
        const tenantSnap = await getDoc(tenantRef);
        const tenant = tenantSnap.exists() ? tenantSnap.data() as Tenant : undefined;
        
        // Fetch rental details
        const rentalRef = doc(db, 'rentals', paymentData.rentalId);
        const rentalSnap = await getDoc(rentalRef);
        const rentalName = rentalSnap.exists() ? rentalSnap.data().name : 'N/A';

        // Fetch room details
        const roomRef = doc(db, `rentals/${paymentData.rentalId}/rooms/${paymentData.roomId}`);
        const roomSnap = await getDoc(roomRef);
        const roomNumber = roomSnap.exists() ? roomSnap.data().roomNumber : 'N/A';


        return {
            id: paymentDoc.id,
            ...paymentData,
            tenant: tenant ? { firstName: tenant.firstName, secondName: tenant.secondName } : undefined,
            rental: { name: rentalName },
            room: { roomNumber: roomNumber }
        } as Payment;
    }));

    return paymentsList;
}
