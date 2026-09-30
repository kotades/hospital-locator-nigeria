import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { UserRole } from '@/types';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNumber?: string;
  hospitalId?: string;
}

/**
 * Initial accounts for Hospital Locator System (Nigeria)
 * - Patient: Amina Bello (patient@hospital.ng)
 * - Representative: Dr. Adeyemi Adeleke (rep@hospital.ng, linked to LUTH hosp-1)
 * - Admin: Federal Health Administrator (admin@hospital.ng)
 */
export const DEMO_USERS: DemoUser[] = [
  {
    id: 'user-patient-1',
    name: 'Amina Bello',
    email: 'patient@hospital.ng',
    password: 'password123',
    role: 'patient',
    phoneNumber: '+234 803 123 4567'
  },
  {
    id: 'user-rep-1',
    name: 'Dr. Adeyemi Adeleke',
    email: 'rep@hospital.ng',
    password: 'password123',
    role: 'representative',
    hospitalId: 'hosp-fmc-asaba', // Linked to Federal Medical Centre (FMC), Asaba, Delta State
    phoneNumber: '+234 803 456 7890'
  },
  {
    id: 'user-admin-1',
    name: 'Federal Health Admin',
    email: 'admin@hospital.ng',
    password: 'password123',
    role: 'admin',
    phoneNumber: '+234 809 999 0000'
  }
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Nigerian Hospital Locator Credentials',
      credentials: {
        email: {
          label: 'Email Address',
          type: 'email',
          placeholder: 'patient@hospital.ng'
        },
        password: {
          label: 'Password',
          type: 'password'
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const prefix = normalizedEmail.split('@')[0];

        const user = DEMO_USERS.find(
          (u) =>
            (u.email.toLowerCase() === normalizedEmail ||
              u.email.split('@')[0] === prefix) &&
            u.password === credentials.password
        );

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phoneNumber: user.phoneNumber,
          hospitalId: user.hospitalId
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phoneNumber = user.phoneNumber;
        token.hospitalId = user.hospitalId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || token.sub || '';
        session.user.role = (token.role as UserRole) || 'patient';
        session.user.phoneNumber = token.phoneNumber as string | undefined;
        session.user.hospitalId = token.hospitalId as string | undefined;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    'hospital-locator-nigeria-demo-secret-key-min-32-chars-long-secure'
};

export default authOptions;
