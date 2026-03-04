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
      from: 'The Discreet Dynasty <dynasty@stoic.tronboll.us>',
    }),
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        const u = user as { id: string; role?: string; isPaid?: boolean; username?: string; avatar?: string }
        session.user.id = u.id
        session.user.role = u.role ?? 'free'
        session.user.isPaid = u.isPaid ?? false
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
