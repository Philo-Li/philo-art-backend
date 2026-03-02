import { describe, it, expect, beforeAll } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import { CHANGE_PASSWORD, AUTHORIZE } from '../../utils/graphqlOperations.js';
import { createUserAndAuthorize } from '../../utils/authHelpers.js';

describe('Mutation: changePassword', () => {
  let accessToken: string;
  let userEmail: string;
  let currentPassword: string;

  beforeAll(async () => {
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;
    userEmail = auth.user.email;
    currentPassword = auth.password;
  });

  it('should change password with valid current password', async () => {
    const newPassword = 'newPassword123!';

    const response = await graphqlRequest<{
      changePassword: boolean;
    }>(
      CHANGE_PASSWORD,
      {
        user: {
          currentPassword,
          newPassword,
        },
      },
      accessToken
    );

    assertNoErrors(response);
    expect(response.data.changePassword).toBe(true);

    // Verify new password works
    const authResponse = await graphqlRequest<{
      authorize: {
        accessToken: string;
      };
    }>(AUTHORIZE, {
      credentials: {
        email: userEmail,
        password: newPassword,
      },
    });

    assertNoErrors(authResponse);
    expect(authResponse.data.authorize.accessToken).toBeDefined();

    // Update for subsequent tests
    currentPassword = newPassword;
  });

  it('should fail with incorrect current password', async () => {
    const response = await graphqlRequest(
      CHANGE_PASSWORD,
      {
        user: {
          currentPassword: 'wrong-password',
          newPassword: 'newPassword456!',
        },
      },
      accessToken
    );

    expect(response.errors).toBeDefined();
    expect(response.errors!.length).toBeGreaterThan(0);
  });

  it('should fail without authentication', async () => {
    const response = await graphqlRequest(CHANGE_PASSWORD, {
      user: {
        currentPassword: currentPassword,
        newPassword: 'newPassword789!',
      },
    });

    expect(response.errors).toBeDefined();
    expect(response.errors!.some((e) => e.extensions?.code === 'UNAUTHENTICATED')).toBe(true);
  });

  it('should fail with short new password', async () => {
    const response = await graphqlRequest(
      CHANGE_PASSWORD,
      {
        user: {
          currentPassword,
          newPassword: '12345', // Less than 6 characters
        },
      },
      accessToken
    );

    expect(response.errors).toBeDefined();
  });
});
