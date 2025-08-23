
import { query } from '@/lib/db';
import type { Tenant } from '@/lib/types';
import { tenantSchema } from '../schemas';
import { z } from 'zod';

type TenantData = z.infer<typeof tenantSchema>;


export async function getTenants(): Promise<Tenant[]> {
    const result: any = await query('SELECT * FROM tenants', []);
    return result as Tenant[];
}

export async function addTenant(tenantData: TenantData) {
    const result: any = await query(
        'INSERT INTO tenants (firstName, secondName, thirdName, idNumber, phone, email, maritalStatus, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
            tenantData.firstName,
            tenantData.secondName,
            tenantData.thirdName,
            tenantData.idNumber,
            tenantData.phone,
            tenantData.email,
            tenantData.maritalStatus,
            tenantData.gender,
        ]
    );
    return { id: result.insertId };
}
