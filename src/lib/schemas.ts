
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

export const tenantSchema = z.object({
    id: z.string().optional(),
    firstName: z.string().min(2, "First name is required"),
    secondName: z.string().min(2, "Second name is required"),
    thirdName: z.string().optional(),
    idNumber: z.string().min(5, "A valid ID or Passport Number is required"),
    phone: z.string().min(10, "A valid phone number is required"),
    email: z.string().email("A valid email is required"),
    maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']),
    gender: z.enum(['Male', 'Female']),
});

export const assignmentSchema = z.object({
    tenantId: z.string().min(1, "Tenant is required"),
    rentalId: z.string().min(1, "Rental is required"),
    roomId: z.string().min(1, "Room is required")
});

export const paymentSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string(),
  rentalId: z.string(),
  roomId: z.string(),
  amount: z.coerce.number(),
  type: z.enum(['Deposit', 'Rent']),
  status: z.enum(['Pending', 'Completed', 'Failed']),
  transactionId: z.string(),
  phone: z.string(),
  createdAt: z.any(),
});

export const initiatePaymentSchema = z.object({
  tenantId: z.string(),
  rentalId: z.string(),
  roomId: z.string(),
  rentAmount: z.coerce.number(),
  depositAmount: z.coerce.number(),
  phone: z.string().min(10, "A valid phone number is required"),
});
