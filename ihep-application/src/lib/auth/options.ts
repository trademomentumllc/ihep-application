import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import { mockStore } from '@/lib/mockStore'
import bcrypt from 'bcryptjs'

const requireEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    // During build time (NODE_ENV=production without actual env vars), provide dummy values
    // to allow build to succeed. Runtime will still require actual values.
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL && !process.env.GOOGLE_CLIENT_ID) {
      console.warn(`Missing environment variable: ${name} (using dummy value for build)`)
      return `dummy-${name.toLowerCase()}`
    }
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const authOptions: NextAuthOptions = {
  secret: process.env.SESSION_SECRET,
  providers: [
    GoogleProvider({
      clientId: requireEnv('GOOGLE_CLIENT_ID'),
      clientSecret: requireEnv('GOOGLE_CLIENT_SECRET')
    }),
    AppleProvider({
      clientId: requireEnv('APPLE_CLIENT_ID'),
      clientSecret: requireEnv('APPLE_CLIENT_SECRET'),
      authorization: { params: { scope: 'name email' } }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null
        const user = await mockStore.getUserByUsername(credentials.username)
        if (!user) return null
        const ok = await bcrypt.compare(credentials.password, user.password)
        if (!ok) return null
        return {
          id: String(user.id),
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profilePicture: user.profilePicture ?? undefined,
          phone: user.phone ?? undefined,
          preferredContactMethod: user.preferredContactMethod ?? undefined
        } as any
      }
    })
  ],
  session: { strategy: 'jwt', maxAge: 30 * 60 },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        const fromOAuth = account?.provider && account.provider !== 'credentials'
        const name = (user as any).name as string | undefined
        const [firstName, ...rest] = (name ?? '').split(' ').filter(Boolean)
        token.role = (user as any).role ?? 'patient'
        token.username = (user as any).username ?? (user as any).email ?? ''
        token.firstName = (user as any).firstName ?? firstName ?? ''
        token.lastName = (user as any).lastName ?? rest.join(' ') ?? ''
        if (fromOAuth && (user as any).email) {
          ;(token as any).email = (user as any).email
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.sub!
        ;(session.user as any).role = (token as any).role as string
        ;(session.user as any).username = (token as any).username as string
        ;(session.user as any).firstName = (token as any).firstName as string
        ;(session.user as any).lastName = (token as any).lastName as string
        if ((token as any).email) {
          session.user.email = (token as any).email as string
        }
      }
      return session
    }
  }
}
