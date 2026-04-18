import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import Resend from 'next-auth/providers/resend'
import GitHub from 'next-auth/providers/github'
import { prisma } from '@/lib/db'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim()
const RESEND_KEY = process.env.RESEND_API_KEY?.trim()
const GITHUB_ID = process.env.GITHUB_ID?.trim()
const GITHUB_SECRET = process.env.GITHUB_SECRET?.trim()

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    // Admin-only: email + password
    Credentials({
      id: 'credentials',
      name: 'Admin Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string)?.trim()
        const password = credentials?.password as string

        if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return null
        if (email !== ADMIN_EMAIL) return null
        if (password !== ADMIN_PASSWORD) return null

        let user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
          user = await prisma.user.create({ data: { email, role: 'admin' } })
        } else if (user.role !== 'admin') {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { role: 'admin' },
          })
        }
        return { id: user.id, email: user.email }
      },
    }),
    // Admin-only: magic link backup (locked to ADMIN_EMAIL in signIn callback)
    Resend({
      id: 'resend-admin',
      apiKey: RESEND_KEY,
      from: 'The Discreet Dynasty <discreet@tronboll.us>',
    }),
    // Members: magic link
    Resend({
      apiKey: RESEND_KEY,
      from: 'The Discreet Dynasty <discreet@tronboll.us>',
    }),
    // Members: GitHub OAuth
    GitHub({
      clientId: GITHUB_ID,
      clientSecret: GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Credentials auth already verified in authorize()
      if (account?.provider === 'credentials') return true
      // Admin magic link backup: only the configured admin email
      if (account?.provider === 'resend-admin') {
        return !!ADMIN_EMAIL && user.email === ADMIN_EMAIL
      }
      // Member providers (resend, github): unchanged
      return true
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id
        // First-time admin magic-link login would otherwise land as role=free.
        // Promote the ADMIN_EMAIL account so middleware admits them.
        if (ADMIN_EMAIL && user.email === ADMIN_EMAIL) {
          await prisma.user
            .update({ where: { id: user.id }, data: { role: 'admin' } })
            .catch(() => null)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        const u = await prisma.user.findUnique({
          where: { id: token.id as string },
        }) as {
          id: string
          role?: string
          isPaid?: boolean
          username?: string | null
          avatar?: string | null
          ddAccessExpiresAt?: Date | null
        } | null
        if (u) {
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
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
  },
})
