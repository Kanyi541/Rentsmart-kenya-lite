
'use server'

import { mockTenants } from "@/lib/mock-data";
import type { Tenant } from "@/lib/types";
import { tenantSchema } from "@/lib/schemas";
import { z } from "zod";
import { revalidatePath } from "next/cache";

type TenantData = z.infer<typeof tenantSchema>;

export async function getTenants(): Promise<Tenant[]> {
    return Promise.resolve(mockTenants);
}

export async function addTenant(tenantData: TenantData) {
    const newId = new Date().getTime();
    const newTenant: Tenant = {
        ...tenantData,
        id: newId,
    };
    mockTenants.push(newTenant);
    revalidatePath('/tenants');
    return { id: newId };
}
