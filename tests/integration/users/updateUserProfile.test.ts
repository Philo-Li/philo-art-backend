import { describe, it, expect, beforeAll } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import { UPDATE_USER_PROFILE, AUTHORIZED_USER } from '../../utils/graphqlOperations.js';
import { createUserAndAuthorize } from '../../utils/authHelpers.js';

describe('Mutation: updateUserProfile', () => {
  let accessToken: string;
  let userPassword: string;
  let username: string;
  let email: string;

  beforeAll(async () => {
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;
    userPassword = auth.password;
    username = auth.user.username;
    email = auth.user.email;
  });

  it('should update user profile fields', async () => {
    const updateData = {
      user: {
        username,
        password: userPassword,
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        email,
        description: 'This is my updated description',
      },
    };

    const response = await graphqlRequest<{
      updateUserProfile: {
        id: string;
        firstName: string;
        lastName: string;
        description: string;
      };
    }>(UPDATE_USER_PROFILE, updateData, accessToken);

    assertNoErrors(response);
    expect(response.data.updateUserProfile.firstName).toBe(updateData.user.firstName);
    expect(response.data.updateUserProfile.lastName).toBe(updateData.user.lastName);
    expect(response.data.updateUserProfile.description).toBe(updateData.user.description);
  });

  it('should fail without authentication', async () => {
    const response = await graphqlRequest(UPDATE_USER_PROFILE, {
      user: {
        username: 'test',
        password: 'test123',
        firstName: 'ShouldFail',
        email: 'test@example.com',
      },
    });

    expect(response.errors).toBeDefined();
    expect(response.errors!.some((e) => e.extensions?.code === 'UNAUTHENTICATED')).toBe(true);
  });

  it('should fail with wrong password', async () => {
    const response = await graphqlRequest(
      UPDATE_USER_PROFILE,
      {
        user: {
          username,
          password: 'wrong-password',
          firstName: 'ShouldFail',
          email,
        },
      },
      accessToken
    );

    expect(response.errors).toBeDefined();
    expect(response.errors![0].message).toContain('Wrong password');
  });

  it('should persist changes', async () => {
    const newFirstName = 'PersistTest';

    await graphqlRequest(
      UPDATE_USER_PROFILE,
      {
        user: {
          username,
          password: userPassword,
          firstName: newFirstName,
          email,
        },
      },
      accessToken
    );

    // Fetch user again to verify persistence
    const userResponse = await graphqlRequest<{
      authorizedUser: {
        firstName: string;
      };
    }>(AUTHORIZED_USER, {}, accessToken);

    assertNoErrors(userResponse);
    expect(userResponse.data.authorizedUser.firstName).toBe(newFirstName);
  });
});
