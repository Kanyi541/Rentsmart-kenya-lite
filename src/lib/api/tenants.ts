
'use server'

import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, doc, getDoc, query, where, Timestamp } from "firebase/firestore";
import type { Tenant, Assignment, Rental, Room, Payment } from "@/lib/types";
import { tenantSchema } from "@/lib/schemas";
import { z } from "zod";
import { revalidatePath } from "next/cache";

type TenantData = z.infer<typeof tenantSchema>;

export async function getTenants(): Promise<Tenant[]> {
    const tenantsCol = collection(db, 'tenants');
    const tenantSnapshot = await getDocs(tenantsCol);
    const tenants = tenantSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));

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
        const paymentsQuery = query(paymentsCol, 
            where("tenantId", "in", assignedTenantIds),
            where("type", "==", "Rent"),
            where("status", "==", "Completed")
        );
        const paymentsSnapshot = await getDocs(paymentsQuery);

        paymentsSnapshot.docs.forEach(doc => {
            const payment = doc.data();
            const paymentDate = (payment.createdAt as Timestamp).toDate();
            if (!tenantIdToLastPaymentMap.has(payment.tenantId) || paymentDate > tenantIdToLastPaymentMap.get(payment.tenantId)!) {
                tenantIdToLastPaymentMap.set(payment.tenantId, paymentDate);
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

export async function addTenant(tenantData: TenantData) {
    try {
        const tenantsCol = collection(db, 'tenants');
        const docRef = await addDoc(tenantsCol, tenantData);
        revalidatePath('/tenants');
        revalidatePath('/');
        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error("Error adding tenant to Firestore:", error);
        return { error: "Failed to add tenant due to a database error." };
    }
}
