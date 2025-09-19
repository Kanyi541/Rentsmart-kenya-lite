
'use server'

import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, query, where, Timestamp, orderBy, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import type { Tenant, Assignment, Rental, Room, Payment } from "@/lib/types";
import { tenantSchema, updateTenantSchema } from "@/lib/schemas";
import { z } from "zod";
import { revalidatePath } from "next/cache";

type TenantData = z.infer<typeof tenantSchema>;
type UpdateTenantData = z.infer<typeof updateTenantSchema>;


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
        const paymentsCol = collection(db, 'payments');
        // Simplified query
        const paymentsQuery = query(paymentsCol, where("tenantId", "in", assignedTenantIds));
        const paymentsSnapshot = await getDocs(paymentsQuery);

        paymentsSnapshot.docs.forEach(doc => {
            const payment = doc.data();
            // Filter in code
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
        const paymentsQuery = query(paymentsCol, where("tenantId", "==", tenantId));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        
        let lastPaymentDate: Date | null = null;
        paymentsSnapshot.docs.forEach(doc => {
            const payment = doc.data();
            if (payment.type === 'Rent' && payment.status === 'Completed') {
                const paymentDate = (payment.createdAt as Timestamp).toDate();
                 if (!lastPaymentDate || paymentDate > lastPaymentDate) {
                    lastPaymentDate = paymentDate;
                }
            }
        });
        
        if (lastPaymentDate) {
            const nextDueDate = new Date(lastPaymentDate);
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            tenant.nextPaymentDue = nextDueDate.toISOString().split('T')[0];
        }
    }

    return tenant;
}

export async function updateTenant(tenantId: string, data: UpdateTenantData) {
    if (!tenantId) {
        throw new Error("Tenant ID is required to update details.");
    }
    const tenantRef = doc(db, "tenants", tenantId);
    
    // Ensure that sensitive fields like email, ID number, etc., are not in the update object
    // The `updateTenantSchema` already takes care of this by only including allowed fields.
    const validatedData = updateTenantSchema.parse(data);

    await updateDoc(tenantRef, validatedData);
    
    revalidatePath(`/clients`); // Revalidate the client dashboard to show new data
}
