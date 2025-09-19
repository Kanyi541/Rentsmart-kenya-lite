
'use server'

import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, query, where, Timestamp, orderBy, serverTimestamp, setDoc } from "firebase/firestore";
import type { Tenant, Assignment, Rental, Room, Payment } from "@/lib/types";
import { tenantSchema } from "@/lib/schemas";
import { z } from "zod";
import { revalidatePath } from "next/cache";

type TenantData = z.infer<typeof tenantSchema>;

export async function getTenants(): Promise<Tenant[]> {
    const tenantsCol = collection(db, 'tenants');
    const tenantsQuery = query(tenantsCol, orderBy('createdAt', 'desc'));
    const tenantSnapshot = await getDocs(tenantsQuery);
    const tenants = tenantSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || null,
        } as Tenant;
    });

    // Get all assignments
    const assignmentsCol = collection(db, 'assignments');
    const assignmentsSnapshot = await getDocs(assignmentsCol);
    const assignments = assignmentsSnapshot.docs.map(doc => doc.data() as Omit<Assignment, 'id'>);
    
    const tenantAssignmentMap = new Map<string, Omit<Assignment, 'id'>>();
    assignments.forEach(a => tenantAssignmentMap.set(a.tenantId, a));

    const assignedTenantIds = Array.from(tenantAssignmentMap.keys());

    // Fetch payments for assigned tenants
    let tenantIdToLastPaymentMap = new Map<string, Date>();
    if (assignedTenantIds.length > 0) {
        // Simplified query to avoid composite index requirement
        const paymentsCol = collection(db, 'payments');
        const paymentsQuery = query(paymentsCol, where("tenantId", "in", assignedTenantIds));
        const paymentsSnapshot = await getDocs(paymentsQuery);

        paymentsSnapshot.docs.forEach(doc => {
            const payment = doc.data();
            // Filter in code instead of in the query
            if (payment.type === 'Rent' && payment.status === 'Completed') {
                const paymentDate = (payment.createdAt as Timestamp).toDate();
                if (!tenantIdToLastPaymentMap.has(payment.tenantId) || paymentDate > tenantIdToLastPaymentMap.get(payment.tenantId)!) {
                    tenantIdToLastPaymentMap.set(payment.tenantId, paymentDate);
                }
            }
        });
    }

    const tenantsWithDetails = await Promise.all(tenants.map(async (tenant) => {
        const assignment = tenantAssignmentMap.get(tenant.id);
        if (assignment) {
            const rentalRef = doc(db, 'rentals', assignment.rentalId);
            const roomRef = doc(db, `rentals/${assignment.rentalId}/rooms/${assignment.roomId}`);

            const [rentalSnap, roomSnap] = await Promise.all([
                getDoc(rentalRef),
                getDoc(roomRef)
            ]);

            const rental = rentalSnap.exists() ? rentalSnap.data() as Rental : null;
            const room = roomSnap.exists() ? roomSnap.data() as Room : null;

            const lastPaymentDate = tenantIdToLastPaymentMap.get(tenant.id);
            let nextPaymentDue: string | undefined = undefined;
            if (lastPaymentDate) {
                const nextDueDate = new Date(lastPaymentDate);
                nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                nextPaymentDue = nextDueDate.toISOString().split('T')[0];
            }

            return {
                ...tenant,
                rentalName: rental?.name,
                roomNumber: room?.roomNumber,
                rent: room?.rent,
                nextPaymentDue
            };
        }
        return tenant;
    }));

    return tenantsWithDetails;
}

export async function getTenantById(tenantId: string): Promise<Tenant | null> {
    if (!tenantId) return null;

    const tenantRef = doc(db, 'tenants', tenantId);
    const tenantSnap = await getDoc(tenantRef);

    if (!tenantSnap.exists()) {
        console.log(`No tenant found with ID: ${tenantId}`);
        return null;
    }

    const tenantData = tenantSnap.data();
    const tenant = { 
        id: tenantSnap.id, 
        ...tenantData,
        createdAt: (tenantData.createdAt as Timestamp)?.toDate().toISOString() || null
    } as Tenant;

    // Check for assignment
    const assignmentsCol = collection(db, 'assignments');
    const assignmentQuery = query(assignmentsCol, where("tenantId", "==", tenantId));
    const assignmentSnapshot = await getDocs(assignmentQuery);

    if (!assignmentSnapshot.empty) {
        const assignment = assignmentSnapshot.docs[0].data() as Omit<Assignment, 'id'> & {id: string};
        assignment.id = assignmentSnapshot.docs[0].id;
        
        const rentalRef = doc(db, 'rentals', assignment.rentalId);
        const roomRef = doc(db, `rentals/${assignment.rentalId}/rooms/${assignment.roomId}`);

        const [rentalSnap, roomSnap] = await Promise.all([
            getDoc(rentalRef),
            getDoc(roomRef)
        ]);
        
        const rental = rentalSnap.exists() ? {id: rentalSnap.id, ...rentalSnap.data()} as Rental : null;
        const room = roomSnap.exists() ? {id: roomSnap.id, ...roomSnap.data()} as Room : null;

        tenant.rentalId = rental?.id
        tenant.rentalName = rental?.name;
        tenant.roomId = room?.id
        tenant.roomNumber = room?.roomNumber;
        tenant.rent = room?.rent;

        // Check for next payment due
        const paymentsCol = collection(db, 'payments');
        // Simplified query
        const paymentsQuery = query(paymentsCol, 
            where("tenantId", "==", tenantId),
            orderBy("createdAt", "desc")
        );
        const paymentsSnapshot = await getDocs(paymentsQuery);
        
        // Find the most recent completed rent payment in code
        for (const doc of paymentsSnapshot.docs) {
            const lastPayment = doc.data();
            if (lastPayment.type === 'Rent' && lastPayment.status === 'Completed') {
                const lastPaymentDate = (lastPayment.createdAt as Timestamp).toDate();
                const nextDueDate = new Date(lastPaymentDate);
                nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                tenant.nextPaymentDue = nextDueDate.toISOString().split('T')[0];
                break; // Exit loop once the latest is found
            }
        }
    }

    return tenant;
}
