import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Resend from 'next-auth/providers/resend'
import GitHub from 'next-auth/providers/github'
import { prisma } from '@/lib/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: 'The Discreet Dynasty <noreply-discreet@tronboll.us>',
    }),
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        const u = user as {
          id: string
          role?: string
          isPaid?: boolean
          username?: string
          avatar?: string
          ddAccessExpiresAt?: Date | null
        }

        let role = u.role ?? 'free'

        // Downgrade expired gift access
        if (
          u.ddAccessExpiresAt &&
          new Date(u.ddAccessExpiresAt) < new Date() &&
          role !== 'admin'
        ) {
          await prisma.user.update({
            where: { id: u.id },
            data: { role: 'free', isPaid: false },
          })
          role = 'free'
        }

        session.user.id = u.id
        session.user.role = role
        session.user.isPaid = role !== 'free'
        session.user.username = u.username ?? null
        session.user.avatar = u.avatar ?? null
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
  },
})
