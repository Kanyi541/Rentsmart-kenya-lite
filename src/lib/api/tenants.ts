'use server'
import { query } from '@/lib/db';
import { tenantSchema } from '@/lib/schemas';
import type { Tenant } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getTenants(): Promise<Tenant[]> {
    const results = await query('SELECT * FROM tenants ORDER BY id DESC', []);
    return results as Tenant[];
}

export async function addTenant(data: Omit<Tenant, 'id'>): Promise<Tenant> {
    const validation = tenantSchema.safeParse(data);
    if (!validation.success) {
        throw new Error(validation.error.message);
    }
    const { firstName, secondName, thirdName, idNumber, phone, email, maritalStatus, gender } = validation.data;
    const result: any = await query(
        'INSERT INTO tenants (firstName, secondName, thirdName, idNumber, phone, email, maritalStatus, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [firstName, secondName, thirdName, idNumber, phone, email, maritalStatus, gender]
    );

    revalidatePath('/tenants');
    revalidatePath('/');

    return { id: result.insertId, ...validation.data };
}
