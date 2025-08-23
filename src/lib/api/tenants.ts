
import { query } from '@/lib/db';
import type { Tenant } from '@/lib/types';
import { tenantSchema } from '../schemas';
import { z } from 'zod';

type TenantData = z.infer<typeof tenantSchema>;


export async function getTenants(): Promise<Tenant[]> {
    const result: any = await query('SELECT id, "firstName", "secondName", "thirdName", "idNumber", phone, email, "maritalStatus", gender FROM tenants', []);
    return result.map((row: any) => ({
        ...row,
        firstName: row.firstName,
        secondName: row.secondName,
        thirdName: row.thirdName,
        idNumber: row.idNumber,
        maritalStatus: row.maritalStatus,
    })) as Tenant[];
}

export async function addTenant(tenantData: TenantData) {
    const result: any = await query(
        'INSERT INTO tenants ("firstName", "secondName", "thirdName", "idNumber", phone, email, "maritalStatus", gender) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
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
    return { id: result[0].id };
}
