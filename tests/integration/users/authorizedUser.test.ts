import { describe, it, expect, beforeAll } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import { AUTHORIZED_USER } from '../../utils/graphqlOperations.js';
import { createUserAndAuthorize } from '../../utils/authHelpers.js';

describe('Query: authorizedUser', () => {
  let accessToken: string;
  let expectedUsername: string;

  beforeAll(async () => {
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;
    expectedUsername = auth.user.username;
  });

  it('should return current user with valid token', async () => {
    const response = await graphqlRequest<{
      authorizedUser: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    }>(AUTHORIZED_USER, {}, accessToken);

    assertNoErrors(response);
    expect(response.data.authorizedUser).toBeDefined();
    expect(response.data.authorizedUser.username).toBe(expectedUsername);
  });

  it('should return null without authentication', async () => {
    const response = await graphqlRequest<{
      authorizedUser: null;
    }>(AUTHORIZED_USER, {});

    assertNoErrors(response);
    expect(response.data.authorizedUser).toBeNull();
  });

  it('should return null with invalid token', async () => {
    const response = await graphqlRequest<{
      authorizedUser: null;
    }>(AUTHORIZED_USER, {}, 'invalid-token');

    assertNoErrors(response);
    expect(response.data.authorizedUser).toBeNull();
  });
});
