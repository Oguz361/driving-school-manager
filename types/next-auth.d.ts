import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User extends DefaultUser {
    username: string;
    firstName: string;
    lastName: string;
    role: 'OWNER' | 'ADMIN' | 'INSTRUCTOR';
    mustChangePassword: boolean;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      role: 'OWNER' | 'ADMIN' | 'INSTRUCTOR';
      mustChangePassword: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: 'OWNER' | 'ADMIN' | 'INSTRUCTOR';
    mustChangePassword: boolean;
    jti: string; // JWT ID for token blacklisting
    iat: number; // Issued at timestamp
    lastValidated?: number; // Last time user status was validated
  }
}
