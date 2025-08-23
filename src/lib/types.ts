import { type z } from 'zod';
import { type propertySchema } from './schemas';

export type Property = z.infer<typeof propertySchema> & { id: string, imageUrl: string };
