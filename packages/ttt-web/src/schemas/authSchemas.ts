import { z } from 'zod'

export const LoginSchema = z.object({
  email: z
      .email('Email invalide')
      .min(1, 'Email requis'),
  password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
})

export const LoginWithRememberSchema = LoginSchema.extend({
  rememberMe: z.boolean().optional().default(false)
})

export const RegisterSchema = z.object({
  firstName: z
      .string()
      .min(2, 'Le prénom doit contenir au moins 2 caractères')
      .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  lastName: z
      .string()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  email: z
      .email('Email invalide')
      .min(1, 'Email requis'),
  password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
      )
})

export const RegisterWithConfirmSchema = RegisterSchema.extend({
    passwordConfirmation: z.string()
}).refine(
    (data) => data.password === data.passwordConfirmation,
    {
      message: 'Les mots de passe ne correspondent pas',
      path: ['passwordConfirmation']
    }
)

export const ForgotPasswordSchema = z.object({
  email: z
      .email('Email invalide')
      .min(1, 'Email requis')
})

export const ChangePasswordSchema = z.object({
  currentPassword: z
      .string()
      .min(1, 'Mot de passe actuel requis'),
  newPassword: z
      .string()
      .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
      .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
      ),
  confirmNewPassword: z.string()
}).refine(
    (data) => data.newPassword === data.confirmNewPassword,
    {
      message: 'Les mots de passe ne correspondent pas',
      path: ['confirmNewPassword']
    }
)

export type LoginInput = z.infer<typeof LoginSchema>
export type LoginWithRememberInput = z.infer<typeof LoginWithRememberSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type RegisterWithConfirmInput = z.infer<typeof RegisterWithConfirmSchema>
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>