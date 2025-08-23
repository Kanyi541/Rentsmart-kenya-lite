import { type z } from 'zod';
import { type rentalSchema, type roomSchema, type tenantSchema, type assignmentSchema } from './schemas';

export type Room = z.infer<typeof roomSchema> & { id: string | number };
export type Rental = z.infer<typeof rentalSchema> & { id: string | number, rooms: Room[] };
export type Tenant = z.infer<typeof tenantSchema> & { id: string | number };
export type Assignment = z.infer<typeof assignmentSchema> & { id: string | number };
