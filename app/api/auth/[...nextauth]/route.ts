import NextAuth from 'next-auth'
import Discord from 'next-auth/providers/discord'
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "identify email guilds"
        }
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = token.sub || user?.id
      }
      return session
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.id = profile?.id
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      // If the url is relative, prepend the baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      // If the url is already absolute but on the same host, allow it
      else if (new URL(url).origin === baseUrl) {
        return url
      }
      // Default to the home page
      return baseUrl
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
})

export { handler as GET, handler as POST }
