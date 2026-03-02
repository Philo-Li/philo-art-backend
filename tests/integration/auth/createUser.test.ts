import { describe, it, expect } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import { CREATE_USER } from '../../utils/graphqlOperations.js';
import { createTestUser } from '../../utils/factories/userFactory.js';

describe('Mutation: createUser', () => {
  it('should create a new user successfully', async () => {
    const userData = createTestUser();

    const response = await graphqlRequest<{
      createUser: {
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
      };
    }>(CREATE_USER, {
      user: userData,
    });

    assertNoErrors(response);
    expect(response.data.createUser.id).toBeDefined();
    expect(response.data.createUser.username).toBe(userData.username);
    expect(response.data.createUser.email).toBe(userData.email);
    expect(response.data.createUser.firstName).toBe(userData.firstName);
    expect(response.data.createUser.lastName).toBe(userData.lastName);
  });

  it('should convert username to lowercase', async () => {
    const userData = createTestUser({
      username: 'test_e2e_UPPERCASE_USER',
    });

    const response = await graphqlRequest<{
      createUser: {
        username: string;
      };
    }>(CREATE_USER, {
      user: userData,
    });

    assertNoErrors(response);
    expect(response.data.createUser.username).toBe('test_e2e_uppercase_user');
  });

  it('should fail with duplicate username', async () => {
    const userData = createTestUser();

    // Create first user
    const firstResponse = await graphqlRequest(CREATE_USER, {
      user: userData,
    });
    assertNoErrors(firstResponse);

    // Try to create second user with same username
    const duplicateData = createTestUser({
      username: userData.username,
      email: 'different@example.com',
    });

    const response = await graphqlRequest(CREATE_USER, {
      user: duplicateData,
    });

    expect(response.errors).toBeDefined();
    expect(response.errors!.length).toBeGreaterThan(0);
    expect(response.errors![0].message).toContain('already taken');
    expect(response.errors![0].extensions?.code).toBe('USERNAME_TAKEN');
  });

  it('should fail with invalid email format', async () => {
    const userData = createTestUser({
      email: 'invalid-email',
    });

    const response = await graphqlRequest(CREATE_USER, {
      user: userData,
    });

    expect(response.errors).toBeDefined();
  });

  it('should fail with short password', async () => {
    const userData = createTestUser({
      password: '12345', // Less than 6 characters
    });

    const response = await graphqlRequest(CREATE_USER, {
      user: userData,
    });

    expect(response.errors).toBeDefined();
  });

  it('should fail with missing required fields', async () => {
    const response = await graphqlRequest(CREATE_USER, {
      user: {
        username: 'test_e2e_incomplete',
        // Missing password, firstName, email
      },
    });

    expect(response.errors).toBeDefined();
  });

  it('should create user without lastName (optional field)', async () => {
    const userData = createTestUser();
    const { lastName, ...userWithoutLastName } = userData;

    const response = await graphqlRequest<{
      createUser: {
        id: string;
        username: string;
        lastName: string | null;
      };
    }>(CREATE_USER, {
      user: userWithoutLastName,
    });

    assertNoErrors(response);
    expect(response.data.createUser.id).toBeDefined();
    expect(response.data.createUser.username).toBe(userWithoutLastName.username);
  });
});
