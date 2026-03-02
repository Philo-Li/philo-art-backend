import { graphqlRequest, assertNoErrors } from './testClient.js';
import { CREATE_USER, AUTHORIZE } from './graphqlOperations.js';
import { createTestUser, type TestUserInput } from './factories/userFactory.js';

export interface AuthResult {
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName?: string;
  };
  accessToken: string;
  expiresAt: string;
}

/**
 * Authorize an existing user and return the access token
 */
export async function authorize(
  email: string,
  password: string
): Promise<AuthResult> {
  const response = await graphqlRequest<{ authorize: AuthResult }>(AUTHORIZE, {
    credentials: { email, password },
  });

  assertNoErrors(response);
  return response.data.authorize;
}

/**
 * Create a new test user
 */
export async function createUser(
  overrides?: Partial<TestUserInput>
): Promise<{ user: TestUserInput & { id: string }; password: string }> {
  const userData = createTestUser(overrides);
  const password = userData.password;

  const response = await graphqlRequest<{
    createUser: TestUserInput & { id: string };
  }>(CREATE_USER, {
    user: userData,
  });

  assertNoErrors(response);
  return { user: response.data.createUser, password };
}

/**
 * Create a new test user and authorize (get access token)
 */
export async function createUserAndAuthorize(
  overrides?: Partial<TestUserInput>
): Promise<AuthResult & { password: string }> {
  const userData = createTestUser(overrides);
  const password = userData.password;

  // Create user
  const createResponse = await graphqlRequest<{
    createUser: TestUserInput & { id: string };
  }>(CREATE_USER, {
    user: userData,
  });

  assertNoErrors(createResponse);

  // Authorize
  const authResponse = await graphqlRequest<{ authorize: AuthResult }>(
    AUTHORIZE,
    {
      credentials: { email: userData.email, password },
    }
  );

  assertNoErrors(authResponse);

  return {
    ...authResponse.data.authorize,
    password,
  };
}
