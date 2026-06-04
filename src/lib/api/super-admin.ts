
'use server'

import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { GlobalStats, Organization } from "@/lib/types";

export async function getGlobalStats(): Promise<GlobalStats> {
    const orgsSnap = await getDocs(collection(db, 'organizations'));
    const paymentsSnap = await getDocs(collection(db, 'payments'));
    const tenantsSnap = await getDocs(collection(db, 'tenants'));

    let totalRevenue = 0;
    paymentsSnap.forEach(doc => {
        const data = doc.data();
        if (data.status === 'Completed') {
            totalRevenue += Number(data.amount) || 0;
        }
    });

    const orgs = orgsSnap.docs.map(d => d.data());
    
    const distribution = {
        Starter: orgs.filter(o => o.plan === 'Starter').length,
        Growth: orgs.filter(o => o.plan === 'Growth').length,
        Scale: orgs.filter(o => o.plan === 'Scale').length,
    };

    return {
        totalOrgs: orgsSnap.size,
        totalActiveSubscriptions: orgs.filter(o => o.subscriptionStatus === 'active').length,
        totalRevenue,
        totalTenants: tenantsSnap.size,
        planDistribution: distribution
    };
}

export async function getAllOrganizations(): Promise<Organization[]> {
    const orgsCol = collection(db, 'organizations');
    const q = query(orgsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore Timestamp fields to plain ISO strings
        const plainCreatedAt = data.createdAt && typeof data.createdAt.toDate === 'function'
            ? data.createdAt.toDate().toISOString()
            : data.createdAt;
        const plainEndDate = data.subscriptionEndDate && typeof data.subscriptionEndDate.toDate === 'function'
            ? data.subscriptionEndDate.toDate().toISOString()
            : data.subscriptionEndDate;
        return {
            id: doc.id,
            ...data,
            createdAt: plainCreatedAt,
            subscriptionEndDate: plainEndDate,
        } as Organization;
    });
}
