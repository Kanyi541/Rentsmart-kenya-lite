
'use server'

import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, query, orderBy, getDoc, Timestamp } from "firebase/firestore";
import type { Payment, Tenant, GroupedPayment } from "@/lib/types";
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


export async function getGroupedPayments(): Promise<GroupedPayment[]> {
    const paymentsCol = collection(db, 'payments');
    const q = query(paymentsCol, orderBy('createdAt', 'desc'));
    const paymentSnapshot = await getDocs(q);

    const groupedByTransaction = new Map<string, Payment[]>();

    // Group payments by transactionId
    for (const paymentDoc of paymentSnapshot.docs) {
        const payment = { id: paymentDoc.id, ...paymentDoc.data() } as Payment;
        if (payment.transactionId) {
            if (!groupedByTransaction.has(payment.transactionId)) {
                groupedByTransaction.set(payment.transactionId, []);
            }
            groupedByTransaction.get(payment.transactionId)!.push(payment);
        }
    }
    
    const result: GroupedPayment[] = [];

    for (const [transactionId, payments] of groupedByTransaction.entries()) {
        const rentPayment = payments.find(p => p.type === 'Rent');
        const depositPayment = payments.find(p => p.type === 'Deposit');
        
        // We are only interested in initial assignment payments which have both rent and deposit
        if (rentPayment && depositPayment) {
            // Fetch common details from the rent payment
            const tenantRef = doc(db, 'tenants', rentPayment.tenantId);
            const rentalRef = doc(db, 'rentals', rentPayment.rentalId);
            const roomRef = doc(db, `rentals/${rentPayment.rentalId}/rooms/${rentPayment.roomId}`);

            const [tenantSnap, rentalSnap, roomSnap] = await Promise.all([
                getDoc(tenantRef), getDoc(rentalRef), getDoc(roomRef)
            ]);

            const tenant = tenantSnap.exists() ? tenantSnap.data() as Tenant : undefined;
            const rentalName = rentalSnap.exists() ? rentalSnap.data().name : 'N/A';
            const roomNumber = roomSnap.exists() ? roomSnap.data().roomNumber : 'N/A';
            const createdAt = (rentPayment.createdAt as any)?.toDate().toISOString() || new Date().toISOString();

            result.push({
                id: transactionId,
                createdAt: createdAt,
                tenantName: tenant ? `${tenant.firstName} ${tenant.secondName}` : 'N/A',
                rentalName: rentalName,
                roomNumber: roomNumber,
                rentPaid: rentPayment.amount,
                depositPaid: depositPayment.amount,
                totalPaid: rentPayment.amount + depositPayment.amount,
                status: rentPayment.status === 'Completed' && depositPayment.status === 'Completed' ? 'Completed' : 'Failed'
            });
        }
    }

    return result;
}


export async function getPayments(): Promise<Payment[]> {
    const paymentsCol = collection(db, 'payments');
    const q = query(paymentsCol, orderBy('createdAt', 'desc'));
    const paymentSnapshot = await getDocs(q);
    
    const paymentsList = await Promise.all(paymentSnapshot.docs.map(async (paymentDoc) => {
        const paymentData = paymentDoc.data()

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

        // Convert Firestore Timestamp to a serializable format (ISO string)
        const createdAt = (paymentData.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();

        return {
            id: paymentDoc.id,
            ...paymentData,
            createdAt,
            tenant: tenant ? { firstName: tenant.firstName, secondName: tenant.secondName, email: tenant.email } : undefined,
            rental: { name: rentalName },
            room: { roomNumber: roomNumber }
        } as Payment;
    }));

    return paymentsList;
}

