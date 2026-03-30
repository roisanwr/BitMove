import NextAuth, { CredentialsSignin } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "./prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

class InvalidLoginError extends CredentialsSignin {
  code = "Invalid email or password"
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new InvalidLoginError()
        }

        const user = await prisma.profiles.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.password_hash) {
          throw new InvalidLoginError()
        }

        const isPasswordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        )

        if (!isPasswordMatch) {
          throw new InvalidLoginError()
        }

        return { id: user.id, name: user.full_name || user.username, email: user.email }
      }
    })
  ]
})
