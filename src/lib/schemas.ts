import { z } from 'zod';

export const roomSchema = z.object({
  id: z.string().optional(),
  roomNumber: z.string().min(1, 'Room number is required.'),
  roomType: z.enum(['Single Room', 'Bedsitter', '1 Bedroom', '2 Bedroom', '3 Bedroom', '4 Bedroom']),
  rent: z.coerce.number().min(1, 'Rent must be a positive number.'),
  isOccupied: z.boolean().default(false),
});

export const rentalSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Rental name is required.'),
  location: z.string().min(3, 'Location is required.'),
  ownerName: z.string().min(3, 'Owner name is required.'),
  ownerNumber: z.string().min(10, 'Owner number is required.'),
  rooms: z.array(roomSchema).min(1, 'At least one room is required.'),
});

export const clientSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3, "Client name is required"),
    phone: z.string().min(10, "A valid phone number is required"),
    email: z.string().email("A valid email is required")
});

export const assignmentSchema = z.object({
    clientId: z.string().min(1, "Client is required"),
    rentalId: z.string().min(1, "Rental is required"),
    roomId: z.string().min(1, "Room is required")
})
