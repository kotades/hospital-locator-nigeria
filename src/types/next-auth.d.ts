import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT as DefaultJWT } from 'next-auth/jwt';
import { UserRole } from './index';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      role: UserRole;
      phoneNumber?: string;
      hospitalId?: string;
    } & DefaultSession['user'];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the authorize callback of CredentialsProvider.
   */
  interface User extends DefaultUser {
    id: string;
    role: UserRole;
    phoneNumber?: string;
    hospitalId?: string;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    id?: string;
    role?: UserRole;
    phoneNumber?: string;
    hospitalId?: string;
  }
}
