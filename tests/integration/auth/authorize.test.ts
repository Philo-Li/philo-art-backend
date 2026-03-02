import { describe, it, expect, beforeAll } from 'vitest';
import { graphqlRequest, assertNoErrors, assertHasErrorCode } from '../../utils/testClient.js';
import { AUTHORIZE, CREATE_USER } from '../../utils/graphqlOperations.js';
import { createTestUser } from '../../utils/factories/userFactory.js';

describe('Mutation: authorize', () => {
  let testUser: {
    username: string;
    email: string;
    password: string;
  };

  beforeAll(async () => {
    // Create a test user for authorization tests
    const userData = createTestUser();
    testUser = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
    };

    const response = await graphqlRequest(CREATE_USER, {
      user: userData,
    });
    assertNoErrors(response);
  });

  it('should authorize with valid credentials', async () => {
    const response = await graphqlRequest<{
      authorize: {
        user: { id: string; username: string; email: string };
        accessToken: string;
        expiresAt: string;
      };
    }>(AUTHORIZE, {
      credentials: {
        email: testUser.email,
        password: testUser.password,
      },
    });

    assertNoErrors(response);
    expect(response.data.authorize.user.username).toBe(testUser.username);
    expect(response.data.authorize.accessToken).toBeDefined();
    expect(response.data.authorize.accessToken.length).toBeGreaterThan(0);
    expect(response.data.authorize.expiresAt).toBeDefined();
  });

  it('should authorize with case-insensitive email', async () => {
    const response = await graphqlRequest<{
      authorize: {
        user: { username: string };
        accessToken: string;
      };
    }>(AUTHORIZE, {
      credentials: {
        email: testUser.email.toUpperCase(),
        password: testUser.password,
      },
    });

    assertNoErrors(response);
    expect(response.data.authorize.user.username).toBe(testUser.username);
    expect(response.data.authorize.accessToken).toBeDefined();
  });

  it('should fail with wrong password', async () => {
    const response = await graphqlRequest(AUTHORIZE, {
      credentials: {
        email: testUser.email,
        password: 'wrong-password',
      },
    });

    expect(response.errors).toBeDefined();
    expect(response.errors!.length).toBeGreaterThan(0);
    expect(response.errors![0].message).toContain('Invalid email or password');
  });

  it('should fail with non-existent email', async () => {
    const response = await graphqlRequest(AUTHORIZE, {
      credentials: {
        email: 'nonexistent@example.com',
        password: 'somepassword',
      },
    });

    expect(response.errors).toBeDefined();
    expect(response.errors!.length).toBeGreaterThan(0);
    expect(response.errors![0].message).toContain('Invalid email or password');
  });

  it('should fail with empty credentials', async () => {
    const response = await graphqlRequest(AUTHORIZE, {
      credentials: {
        email: '',
        password: '',
      },
    });

    expect(response.errors).toBeDefined();
  });
});
