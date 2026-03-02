import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../../src/app.js';

let app: Express | null = null;

/**
 * Get or create the test Express app instance
 */
export async function getTestServer(): Promise<Express> {
  if (!app) {
    app = await createApp();
  }
  return app;
}

/**
 * Close the test server
 */
export async function closeTestServer(): Promise<void> {
  app = null;
}

/**
 * GraphQL response type
 */
export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: {
      code?: string;
      [key: string]: unknown;
    };
  }>;
}

/**
 * Send a GraphQL request to the test server
 */
export async function graphqlRequest<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  accessToken?: string
): Promise<GraphQLResponse<T>> {
  const server = await getTestServer();

  const req = request(server)
    .post('/graphql')
    .set('Content-Type', 'application/json');

  if (accessToken) {
    req.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await req.send({
    query,
    variables,
  });

  return response.body as GraphQLResponse<T>;
}

/**
 * Assert that a GraphQL response has no errors
 */
export function assertNoErrors<T>(response: GraphQLResponse<T>): asserts response is GraphQLResponse<T> & { data: T } {
  if (response.errors && response.errors.length > 0) {
    const errorMessages = response.errors.map((e) => e.message).join(', ');
    throw new Error(`GraphQL errors: ${errorMessages}`);
  }
  if (!response.data) {
    throw new Error('GraphQL response has no data');
  }
}

/**
 * Assert that a GraphQL response has a specific error code
 */
export function assertHasErrorCode(
  response: GraphQLResponse,
  expectedCode: string
): void {
  if (!response.errors || response.errors.length === 0) {
    throw new Error(`Expected error with code ${expectedCode}, but no errors found`);
  }

  const hasExpectedCode = response.errors.some(
    (e) => e.extensions?.code === expectedCode
  );

  if (!hasExpectedCode) {
    const codes = response.errors
      .map((e) => e.extensions?.code)
      .filter(Boolean)
      .join(', ');
    throw new Error(
      `Expected error code ${expectedCode}, but got: ${codes || 'no error codes'}`
    );
  }
}
