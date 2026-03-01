import express, { Express, Request, Response, NextFunction, json } from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

import prisma from './lib/prisma.js';
import createLogger from './utils/logger.js';
import { createDataLoaders } from './utils/dataLoaders.js';
import createAuthService from './utils/authService.js';
import createSchema from './graphql/schema.js';
import type { AppContext } from './types/context.js';
import apiRouter from './api/index.js';

const logger = createLogger();

const formatError = (
  formattedError: GraphQLFormattedError,
  error: unknown
): GraphQLFormattedError => {
  logger.error('GraphQL Error:', error);

  if (error instanceof GraphQLError) {
    const originalError = error.originalError;

    // Check for validation errors by name property
    if (originalError && (originalError as { name?: string }).name === 'ValidationError') {
      return {
        ...formattedError,
        extensions: {
          ...formattedError.extensions,
          code: 'BAD_USER_INPUT',
        },
      };
    }
  }

  return formattedError;
};

interface CreateAppOptions {
  skipApolloStart?: boolean;
}

export const createApp = async (
  options: CreateAppOptions = {}
): Promise<Express> => {
  const app = express();
  const schema = createSchema();

  const apolloServer = new ApolloServer<AppContext>({
    schema,
    introspection: true,
    formatError,
  });

  if (!options.skipApolloStart) {
    await apolloServer.start();
  }

  app.use(cors());
  app.use(json({ limit: '10mb' }));

  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
    next();
  });

  app.use('/api', apiRouter);

  // Apollo Server 4 middleware for GraphQL endpoint
  const graphqlMiddleware = expressMiddleware(apolloServer, {
    context: async ({ req }): Promise<AppContext> => {
      const authorization = req.headers.authorization;
      const accessToken = authorization?.split(' ')[1];

      return {
        prisma,
        logger,
        authService: createAuthService({ accessToken }),
        dataLoaders: createDataLoaders(prisma),
      };
    },
  });

  app.use('/graphql', graphqlMiddleware as unknown as express.RequestHandler);

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
};

export default createApp;
