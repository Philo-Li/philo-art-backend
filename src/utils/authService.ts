import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import config from '../config.js';

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
const SUBJECT = 'accessToken';

interface TokenPayload {
  userId: string;
}

interface AuthServiceOptions {
  accessToken?: string;
}

class AuthService {
  private accessToken?: string;

  constructor({ accessToken }: AuthServiceOptions) {
    this.accessToken = accessToken;
  }

  getUserId(): string | null {
    if (!this.accessToken) {
      return null;
    }

    try {
      const tokenPayload = jwt.verify(this.accessToken, config.jwtSecret, {
        subject: SUBJECT,
      }) as TokenPayload;
      return tokenPayload.userId;
    } catch {
      return null;
    }
  }

  createAccessToken(userId: string): { accessToken: string; expiresAt: Date } {
    return {
      accessToken: jwt.sign({ userId }, config.jwtSecret, {
        expiresIn: '7d',
        subject: SUBJECT,
      }),
      expiresAt: new Date(Date.now() + ONE_WEEK),
    };
  }

  assertIsAuthorized(): string {
    const userId = this.getUserId();

    if (!userId) {
      throw new GraphQLError('Access token is invalid or expired', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    return userId;
  }
}

const createAuthService = (options: AuthServiceOptions) =>
  new AuthService(options);

export default createAuthService;
