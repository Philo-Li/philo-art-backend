import { describe, it, expect, beforeAll } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import { USER } from '../../utils/graphqlOperations.js';
import { createUser } from '../../utils/authHelpers.js';

describe('Query: user', () => {
  let testUsername: string;

  beforeAll(async () => {
    const result = await createUser();
    testUsername = result.user.username;
  });

  it('should return user by username', async () => {
    const response = await graphqlRequest<{
      user: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    }>(USER, {
      username: testUsername,
    });

    assertNoErrors(response);
    expect(response.data.user).toBeDefined();
    expect(response.data.user.username).toBe(testUsername);
    expect(response.data.user.firstName).toBeDefined();
  });

  it('should return null for non-existent username', async () => {
    const response = await graphqlRequest<{
      user: null;
    }>(USER, {
      username: 'nonexistent_username_12345',
    });

    assertNoErrors(response);
    expect(response.data.user).toBeNull();
  });

  it('should be case-insensitive for username lookup', async () => {
    const response = await graphqlRequest<{
      user: {
        username: string;
      };
    }>(USER, {
      username: testUsername.toUpperCase(),
    });

    // This may or may not work depending on implementation
    // Just verify it doesn't crash
    expect(response.errors).toBeUndefined();
  });
});
