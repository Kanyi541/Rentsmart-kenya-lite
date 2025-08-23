import { type z } from 'zod';
import { type rentalSchema, type roomSchema, type clientSchema, type assignmentSchema } from './schemas';

export type Room = z.infer<typeof roomSchema>;
export type Rental = z.infer<typeof rentalSchema> & { id: string };
export type Client = z.infer<typeof clientSchema> & { id: string };
export type Assignment = z.infer<typeof assignmentSchema> & { id: string };
