import { z } from 'zod'

export default eventHandler(async (event) => {
  const session = await requireUserSession(event)

  const { email, password } = await readValidatedBody(event, z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }).parse)

  const hashedPassword = await hashPassword(password)

  const db = useDatabase()
  await db.sql`UPDATE users SET email = ${email}, password = ${hashedPassword} WHERE id = ${session.user.id}`

  return setUserSession(event, {
    user: {
      email: email,
    },
    loggedInAt: Date.now(),
  })
})
