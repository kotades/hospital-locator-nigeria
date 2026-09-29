'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';

export interface AuthSessionProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

/**
 * Client-side SessionProvider wrapper for NextAuth.js
 * Enables useSession() hooks across all application components and layouts.
 */
export function AuthSessionProvider({ children, session }: AuthSessionProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}

export default AuthSessionProvider;
