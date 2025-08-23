import { z } from 'zod';

export const roomSchema = z.object({
  id: z.string().optional(),
  roomNumber: z.string().min(1, 'Room number is required.'),
  roomType: z.enum(['Single Room', 'Bedsitter', '1 Bedroom', '2 Bedroom', '3 Bedroom', '4 Bedroom']),
  rent: z.coerce.number().min(1, 'Rent must be a positive number.'),
});

export const rentalSchema = z.object({
  name: z.string().min(3, 'Rental name is required.'),
  location: z.string().min(3, 'Location is required.'),
  ownerName: z.string().min(3, 'Owner name is required.'),
  ownerNumber: z.string().min(10, 'Owner number is required.'),
  rooms: z.array(roomSchema).min(1, 'At least one room is required.'),
});