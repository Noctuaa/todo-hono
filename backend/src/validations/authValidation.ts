import { z } from 'zod'

export const registerSchema = z.object({
   username: z.string()
   .min(5, 'Le nom d\'utilisateur doit contenir au moins 5 caractères')
   .max(255, 'Le nom d\'utilisateur ne peut pas dépasser 255 caractères')
   .trim(),
   email: z.email(`Format d'email invalide`)
   .max(255)
   .trim(),
   password: z.string()
   .min(8, `Le mot de passe doit contenir au moins 8 caractères`)
   .max(255, `Le mot de passe ne peut pas dépasser 255 caractères`)
   .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
           'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre')
});

export type RegisterPayload = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
   email: z.email(`Format d'email invalide`),
   password: z.string().min(1, 'Mot de passe requis'),
   rememberMe: z.boolean().default(false)
});

export type LoginPayload = z.infer<typeof loginSchema>;