import { z } from 'zod';

export const updateDocumentSchema = z.object({
  description: z.string().optional(),
});

export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
