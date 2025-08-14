import { z } from 'zod'

export const registerSchema = z.object({
   username: z.string()
   .min(3, 'Doit contenir au moins 3 caractères.')
   .max(255, 'Ne peut pas dépasser 255 caractères.')
   .trim(),
   email: z.email(`Format d'email invalide.`)
   .max(255)
   .trim(),
   password: z.string()
   .min(8, `Doit contenir au moins 8 caractères.`)
   .max(255, `Ne peut pas dépasser 255 caractères.`)
   .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
           'Doit contenir au moins 1 min, 1 maj, 1 chiffre.'),
   confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
   message: "Les mots de passe ne correspondent pas.",
   path: ["confirmPassword"]
});

export type RegisterPayload = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
   email: z.email(`Format d'email invalide`),
   password: z.string().min(1, 'Mot de passe requis'),
   rememberMe: z.boolean().default(false)
});

export type LoginPayload = z.infer<typeof loginSchema>;