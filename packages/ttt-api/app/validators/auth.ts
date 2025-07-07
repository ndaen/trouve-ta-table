import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    firstName: vine.string().minLength(2).maxLength(50).trim(),
    lastName: vine.string().minLength(2).maxLength(50).trim(),
    email: vine.string().email().normalizeEmail().unique(async (db, value) => {
      const user = await db.from('users').where('email', value).first()
      return !user
    }),
    password: vine.string().minLength(8).maxLength(100),
    passwordConfirmation: vine.string().confirmed({
      confirmationField: 'password'
    })
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string(),
    rememberMe: vine.boolean().optional()
  })
)
