import { z } from 'zod'

interface DBUser {
  id: number
  email: string
  password: string
}

const invalidCredentialsError = createError({
  statusCode: 401,
  // This message is intentionally vague to prevent user enumeration attacks.
  message: 'Invalid credentials',
})

export default defineEventHandler(async (event) => {
  const db = useDatabase()

  const { email, password, remember } = await readValidatedBody(event, z.object({
    email: z.string().email(),
    password: z.string().min(8),
    remember: z.boolean(),
  }).parse)

  const user = await db.sql<{ rows: DBUser[] }>`SELECT * FROM users WHERE email = ${email}`.then(result => result.rows[0])

  if (!user) {
    throw invalidCredentialsError
  }

  if (!(await verifyPassword(user.password, password))) {
    throw invalidCredentialsError
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      email,
    },
    loggedInAt: Date.now(),
  }, {
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined, // if remember is true, maxAge is 7 days
  })

  return setResponseStatus(event, 201)
})
