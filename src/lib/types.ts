
import { type z } from 'zod';
import { type rentalSchema, type roomSchema, type tenantSchema, type assignmentSchema, type paymentSchema, type maintenanceRequestSchema, type announcementSchema, type complaintSchema } from './schemas';

export type Room = z.infer<typeof roomSchema> & { id: string };
export type Rental = z.infer<typeof rentalSchema> & { id: string, rooms: Room[] };
export type Tenant = z.infer<typeof tenantSchema> & { 
    id: string;
    rentalId?: string;
    roomId?: string;
    rentalName?: string;
    roomNumber?: string;
    rent?: number;
    nextPaymentDue?: string;
    createdAt: any;
};
export type Assignment = z.infer<typeof assignmentSchema> & { id: string };
export type Payment = Omit<z.infer<typeof paymentSchema>, 'createdAt'> & { 
    id: string, 
    createdAt: string, // Changed from 'any' to 'string'
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
}

export type MaintenanceRequest = z.infer<typeof maintenanceRequestSchema> & {
    id: string;
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
    createdAt: any;
};

export type Complaint = z.infer<typeof complaintSchema> & {
    id: string;
    createdAt: any;
    status: 'New' | 'Investigating' | 'Resolved';
    tenantId: string;
    rentalId: string;
    roomId: string;
    tenantName?: string;
    rentalName?: string;
    roomNumber?: string;
}
