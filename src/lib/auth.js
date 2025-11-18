import { betterAuth, ENV } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prisma from '../config/prisma.js'
import { sendEmail } from './mailer.js'
import { loadEmailTemplate } from '../utils/loadTemplate.js'
import { admin as adminPlugin } from 'better-auth/plugins'
import { ac, admin, employee } from './permission.js'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    additionalFields: {
      department: { enabled: true },
    },
    changeEmail: { enabled: true },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: 'Reset your password',
        text: `Click the link to reset your password: ${url}`,
      })
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, token }, request) => {
      const url = new URL(request.url)

      const callbackURL =
        url.searchParams.get('callbackURL') || ENV.NODE_ENV === 'development'
          ? 'http://localhost:5173/verify-success'
          : 'https://forrof-tracker.vercel.app/verify-success'

      const verificationLink = `${process.env.BETTER_AUTH_URL}/api/auth/verify-email?token=${token}&callbackURL=${encodeURIComponent(
        callbackURL
      )}`

      const htmlTemplate = loadEmailTemplate('email-verification.html', {
        VERIFICATION_LINK: verificationLink,
      })

      await sendEmail({
        to: user.email,
        subject: 'Verify your email — Forrof',
        text: `Click to verify: ${verificationLink}`,
        html: htmlTemplate,
      })
    },

    sendOnSignUp: true,
    sendOnSignIn: true,

    autoSignInAfterVerification: true,
  },
  plugins: [
    adminPlugin({
      ac,
      roles: {
        admin,
        employee,
      },
      defaultRole: 'employee',
      adminRoles: ['admin'],
    }),
  ],
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
      httpOnly: true,
    },
    disableCSRFCheck: true,
  },
  trustedOrigins: [
    'http://localhost:5173',
    'https://forrof-tracker.vercel.app/',
    "'https://forrof-tracker-backend.vercel.app',",
  ],

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
})
