
'use server'

import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import type { Tenant } from "@/lib/types";
import { tenantSchema } from "@/lib/schemas";
import { z } from "zod";
import { revalidatePath } from "next/cache";

type TenantData = z.infer<typeof tenantSchema>;

export async function getTenants(): Promise<Tenant[]> {
    const tenantsCol = collection(db, 'tenants');
    const tenantSnapshot = await getDocs(tenantsCol);
    return tenantSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));
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
