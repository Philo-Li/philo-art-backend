import { describe, it, expect, beforeAll } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import { FOLLOW_USER, UNFOLLOW_USER } from '../../utils/graphqlOperations.js';
import { createUserAndAuthorize, createUser } from '../../utils/authHelpers.js';

describe('Mutation: followUser', () => {
  let accessToken: string;
  let targetUserId: string;

  beforeAll(async () => {
    // Create the follower user
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;

    // Create target user to follow
    const targetUser = await createUser();
    targetUserId = targetUser.user.id;
  });

  it('should follow a user', async () => {
    const response = await graphqlRequest<{
      followUser: boolean;
    }>(FOLLOW_USER, { userId: targetUserId }, accessToken);

    assertNoErrors(response);
    expect(response.data.followUser).toBe(true);
  });

  it('should return true if already following', async () => {
    // Follow again
    const response = await graphqlRequest<{
      followUser: boolean;
    }>(FOLLOW_USER, { userId: targetUserId }, accessToken);

    assertNoErrors(response);
    expect(response.data.followUser).toBe(true);
  });

  it('should fail without authentication', async () => {
    const response = await graphqlRequest(FOLLOW_USER, {
      userId: targetUserId,
    });

    expect(response.errors).toBeDefined();
    expect(response.errors!.some((e) => e.extensions?.code === 'UNAUTHENTICATED')).toBe(true);
  });

  it('should fail when following yourself', async () => {
    // Create a user and try to follow themselves
    const auth = await createUserAndAuthorize();

    const response = await graphqlRequest(
      FOLLOW_USER,
      { userId: auth.user.id },
      auth.accessToken
    );

    expect(response.errors).toBeDefined();
    expect(response.errors![0].message).toContain('Can not follow yourself');
  });
});

describe('Mutation: unfollowUser', () => {
  let accessToken: string;
  let targetUserId: string;

  beforeAll(async () => {
    // Create the follower user
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;

    // Create target user and follow them
    const targetUser = await createUser();
    targetUserId = targetUser.user.id;

    await graphqlRequest(FOLLOW_USER, { userId: targetUserId }, accessToken);
  });

  it('should unfollow a user', async () => {
    const response = await graphqlRequest<{
      unfollowUser: boolean;
    }>(UNFOLLOW_USER, { userId: targetUserId }, accessToken);

    assertNoErrors(response);
    expect(response.data.unfollowUser).toBe(true);
  });

  it('should fail without authentication', async () => {
    const response = await graphqlRequest(UNFOLLOW_USER, {
      userId: targetUserId,
    });

    expect(response.errors).toBeDefined();
    expect(response.errors!.some((e) => e.extensions?.code === 'UNAUTHENTICATED')).toBe(true);
  });
});
