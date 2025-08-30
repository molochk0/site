import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        // Simple hardcoded check for demo purposes
        if (credentials.email === 'admin@restaurant.com' && credentials.password === 'admin123') {
          return {
            id: 'admin-user',
            email: 'admin@restaurant.com',
            name: 'Restaurant Administrator',
            role: 'admin',
          }
        }

        throw new Error('Invalid credentials')
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role || 'admin'
        token.id = user.id
      }

      // Only allow admin users to sign in
      if (token.role !== 'admin') {
        throw new Error('Access denied: Admin role required')
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirect to admin dashboard after successful login
      if (url.startsWith('/admin/login')) {
        return `${baseUrl}/admin`
      }
      
      // Allow relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      // Allow same-origin URLs
      if (new URL(url).origin === baseUrl) {
        return url
      }
      
      return baseUrl
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log('User signed in:', { user: user.email, provider: account?.provider })
    },
    async signOut({ session }) {
      console.log('User signed out:', session?.user?.email)
    },
  },
  debug: process.env.NODE_ENV === 'development',
}