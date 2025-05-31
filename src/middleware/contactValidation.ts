// validations/contactValidation.ts
import { z } from 'zod';

export const contactInputSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email format" })
    .refine(val => val.includes('@'), { message: "Email must include '@'" })
    .refine(val => val.endsWith('.com'), { message: "Email must end with .com" }),

  phoneNumber: z.string()
    .regex(/^\d{10}$/, { message: "Phone number must be exactly 10 digits" }),
});
