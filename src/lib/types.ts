import { type z } from 'zod';
import { type rentalSchema, type roomSchema } from './schemas';

export type Room = z.infer<typeof roomSchema>;
export type Rental = z.infer<typeof rentalSchema> & { id: string };
