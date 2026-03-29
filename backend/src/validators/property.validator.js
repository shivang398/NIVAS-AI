import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().min(3),
  price: z.coerce.number().positive(),
  location: z.string(),

  description: z.string().optional(),
  deposit: z.coerce.number().optional(),
  image: z.string().optional(),
});