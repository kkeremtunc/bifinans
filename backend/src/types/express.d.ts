import { Role, UserStatus } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  status: UserStatus;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
