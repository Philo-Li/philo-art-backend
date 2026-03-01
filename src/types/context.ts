import type { PrismaClient } from '@prisma/client';
import type { Logger } from 'winston';
import type { DataLoaders } from '../utils/dataLoaders.js';

export interface AuthService {
  getUserId(): string | null;
  createAccessToken(userId: string): { accessToken: string; expiresAt: Date };
  assertIsAuthorized(): string;
}

export interface AppContext {
  prisma: PrismaClient;
  logger: Logger;
  authService: AuthService;
  dataLoaders: DataLoaders;
}
