
import { type z } from 'zod';
import { type rentalSchema, type roomSchema, type tenantSchema, type assignmentSchema, type paymentSchema } from './schemas';

export type Room = z.infer<typeof roomSchema> & { id: string };
export type Rental = z.infer<typeof rentalSchema> & { id: string, rooms: Room[] };
export type Tenant = z.infer<typeof tenantSchema> & { id: string };
export type Assignment = z.infer<typeof assignmentSchema> & { id: string };
export type Payment = Omit<z.infer<typeof paymentSchema>, 'createdAt'> & { 
    id: string, 
    createdAt: string, // Changed from 'any' to 'string'
    tenant?: Partial<Tenant>, 
    rental?: { name: string }, 
    room?: { roomNumber: string } 
};
