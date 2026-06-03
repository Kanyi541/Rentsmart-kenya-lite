
import { type z } from 'zod';
import { type rentalSchema, type roomSchema, type tenantSchema, type assignmentSchema, type paymentSchema, type maintenanceRequestSchema, type announcementSchema, type complaintSchema, type moveOutNoticeSchema } from './schemas';

export type Room = z.infer<typeof roomSchema> & { id: string };
export type Rental = z.infer<typeof rentalSchema> & { id: string, rooms: Room[], orgId: string };
export type Tenant = z.infer<typeof tenantSchema> & { 
    id: string;
    orgId: string;
    rentalId?: string;
    roomId?: string;
    rentalName?: string;
    roomNumber?: string;
    rent?: number;
    nextPaymentDue?: string;
    createdAt: any;
};
export type Assignment = z.infer<typeof assignmentSchema> & { id: string, orgId: string };
export type Payment = Omit<z.infer<typeof paymentSchema>, 'createdAt'> & { 
    id: string, 
    orgId: string,
    createdAt: string,
    tenant?: Partial<Tenant>, 
    rental?: { name: string }, 
    room?: { roomNumber: string } 
};

export interface GroupedPayment {
    id: string;
    createdAt: string;
    tenantName: string;
    rentalName: string;
    roomNumber: string;
    rentPaid: number;
    depositPaid: number;
    totalPaid: number;
    status: 'Completed' | 'Failed';
    orgId: string;
}

export type PricingPlan = 'Starter' | 'Growth' | 'Scale';

export interface Organization {
    id: string;
    name: string;
    ownerId: string;
    plan: PricingPlan;
    subscriptionStatus: 'active' | 'expired' | 'past_due' | 'pending_payment';
    subscriptionEndDate: string; // ISO string
    createdAt: any;
}

export interface GlobalStats {
    totalOrgs: number;
    totalActiveSubscriptions: number;
    totalRevenue: number;
    totalTenants: number;
    planDistribution: {
        Starter: number;
        Growth: number;
        Scale: number;
    };
}

export type MaintenanceRequest = z.infer<typeof maintenanceRequestSchema> & {
    id: string;
    orgId: string;
    createdAt: any;
    status: 'Pending' | 'In Progress' | 'Completed';
    tenantId: string;
    rentalId: string;
    roomId: string;
    photoUrl?: string;
    tenantName?: string;
    rentalName?: string;
    roomNumber?: string;
};

export type Announcement = z.infer<typeof announcementSchema> & {
    id: string;
    orgId: string;
    createdAt: any;
};

export type Complaint = z.infer<typeof complaintSchema> & {
    id: string;
    orgId: string;
    createdAt: any;
    status: 'New' | 'Investigating' | 'Resolved';
    tenantId: string;
    rentalId: string;
    roomId: string;
    tenantName?: string;
    rentalName?: string;
    roomNumber?: string;
}

export type MoveOutNotice = z.infer<typeof moveOutNoticeSchema> & {
    id: string;
    orgId: string;
    createdAt: any;
    status: 'Pending' | 'Processed';
    tenantId: string;
    rentalId: string;
    roomId: string;
    noticeType: 'Standard' | 'Immediate';
    tenantName?: string;
    rentalName?: string;
    roomNumber?: string;
}
