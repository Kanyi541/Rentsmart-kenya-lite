
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
  orgId: z.string().optional(),
  name: z.string().min(3, 'Rental name is required.'),
  location: z.string().min(3, 'Location is required.'),
  ownerName: z.string().min(3, 'Owner name is required.'),
  ownerNumber: z.string().min(10, 'Owner number is required.'),
  rooms: z.array(roomSchema).min(1, 'At least one room is required.'),
});

export const tenantSchema = z.object({
    id: z.string().optional(),
    orgId: z.string().optional(),
    firstName: z.string().min(2, "First name is required"),
    secondName: z.string().min(2, "Second name is required"),
    thirdName: z.string().optional(),
    idNumber: z.string().min(5, "A valid ID or Passport Number is required"),
    phone: z.string().min(10, "A valid phone number is required"),
    email: z.string().email("A valid email is required"),
    maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']),
    gender: z.enum(['Male', 'Female']),
    createdAt: z.any().optional(),
    nextOfKinName: z.string().optional().or(z.literal('')),
    nextOfKinPhone: z.string().optional().or(z.literal('')),
    nextOfKinRelationship: z.string().optional().or(z.literal('')),
});

export const assignmentSchema = z.object({
    tenantId: z.string().min(1, "Tenant is required"),
    rentalId: z.string().min(1, "Rental is required"),
    roomId: z.string().min(1, "Room is required"),
    orgId: z.string().optional(),
});

export const paymentSchema = z.object({
  id: z.string().optional(),
  orgId: z.string(),
  tenantId: z.string(),
  rentalId: z.string(),
  roomId: z.string(),
  amount: z.coerce.number(),
  type: z.enum(['Deposit', 'Rent']),
  status: z.enum(['Pending', 'Completed', 'Failed']),
  transactionId: z.string(),
  phone: z.string(),
  email: z.string().optional(),
  createdAt: z.any(),
});

export const initiatePaymentSchema = z.object({
  tenantId: z.string(),
  rentalId: z.string(),
  roomId: z.string(),
  orgId: z.string(),
  rentAmount: z.coerce.number(),
  depositAmount: z.coerce.number(),
  phone: z.string().min(10, "A valid phone number is required"),
  email: z.string().email("Email is required for payment"),
  transactionRef: z.string(),
});


export const updateTenantSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    secondName: z.string().min(2, "Second name is required"),
    phone: z.string().min(10, "A valid phone number is required"),
    maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']),
    gender: z.enum(['Male', 'Female']),
    nextOfKinName: z.string().optional().or(z.literal('')),
    nextOfKinPhone: z.string().optional().or(z.literal('')),
    nextOfKinRelationship: z.string().optional().or(z.literal('')),
})

export const maintenanceRequestSchema = z.object({
  description: z.string().min(10, 'Please provide a detailed description of the issue.'),
  photo: z.any().optional(),
});

export const createMaintenanceRequestSchema = maintenanceRequestSchema.extend({
    tenantId: z.string(),
    rentalId: z.string(),
    roomId: z.string(),
    orgId: z.string(),
});

export const announcementSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters long.'),
    content: z.string().min(10, 'Content must be at least 10 characters long.'),
    orgId: z.string().optional(),
});

export const complaintSchema = z.object({
    subject: z.string().min(5, 'Subject is required and must be at least 5 characters.'),
    description: z.string().min(10, 'Please provide a detailed description of the complaint.'),
});

export const createComplaintSchema = complaintSchema.extend({
    tenantId: z.string(),
    rentalId: z.string(),
    roomId: z.string(),
    orgId: z.string(),
});

export const moveOutNoticeSchema = z.object({
  moveOutDate: z.date({ required_error: 'Please select your intended move out date.'}),
});

export const createMoveOutNoticeSchema = moveOutNoticeSchema.extend({
  tenantId: z.string(),
  rentalId: z.string(),
  roomId: z.string(),
  orgId: z.string(),
  noticeType: z.enum(['Standard', 'Immediate']),
});
