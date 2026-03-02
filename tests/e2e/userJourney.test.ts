import { describe, it, expect } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../utils/testClient.js';
import {
  CREATE_USER,
  AUTHORIZE,
  UPDATE_USER_PROFILE,
  CREATE_COLLECTION,
  FOLLOW_USER,
  COLLECTIONS,
} from '../utils/graphqlOperations.js';
import { createTestUser } from '../utils/factories/userFactory.js';
import { createTestCollection } from '../utils/factories/collectionFactory.js';

describe('E2E: User Journey', () => {
  it('should complete a user journey: register -> update profile -> create collections -> follow users', async () => {
    // ==================== Step 1: User Registration ====================
    console.log('Step 1: User Registration');

    const userData = createTestUser();
    const createUserResponse = await graphqlRequest<{
      createUser: {
        id: string;
        username: string;
        email: string;
      };
    }>(CREATE_USER, { user: userData });

    assertNoErrors(createUserResponse);
    const userId = createUserResponse.data.createUser.id;
    const username = createUserResponse.data.createUser.username;
    const email = createUserResponse.data.createUser.email;
    expect(userId).toBeDefined();
    console.log(`  ✓ User created: ${username}`);

    // ==================== Step 2: User Authorization ====================
    console.log('Step 2: User Authorization');

    const authResponse = await graphqlRequest<{
      authorize: {
        user: { id: string; username: string };
        accessToken: string;
      };
    }>(AUTHORIZE, {
      credentials: {
        email: userData.email,
        password: userData.password,
      },
    });

    assertNoErrors(authResponse);
    const accessToken = authResponse.data.authorize.accessToken;
    expect(accessToken).toBeDefined();
    console.log('  ✓ User authorized, token received');

    // ==================== Step 3: Update Profile ====================
    console.log('Step 3: Update Profile');

    const profileUpdate = {
      user: {
        username,
        password: userData.password,
        firstName: 'Updated',
        lastName: 'User',
        email,
        description: 'I am a test user exploring PhiloArt',
      },
    };

    const updateProfileResponse = await graphqlRequest<{
      updateUserProfile: {
        firstName: string;
        description: string;
      };
    }>(UPDATE_USER_PROFILE, profileUpdate, accessToken);

    assertNoErrors(updateProfileResponse);
    expect(updateProfileResponse.data.updateUserProfile.firstName).toBe(profileUpdate.user.firstName);
    console.log('  ✓ Profile updated');

    // ==================== Step 4: Create Collections ====================
    console.log('Step 4: Create Collections');

    const collectionIds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const collectionData = createTestCollection({
        title: `My Test Collection ${i + 1}`,
        public: i % 2 === 0, // alternate between public and private
      });

      const collectionResponse = await graphqlRequest<{
        createCollection: { id: string; title: string };
      }>(CREATE_COLLECTION, { collection: collectionData }, accessToken);

      assertNoErrors(collectionResponse);
      collectionIds.push(collectionResponse.data.createCollection.id);
    }
    console.log(`  ✓ Created ${collectionIds.length} collections`);

    // ==================== Step 5: Create Second User and Follow ====================
    console.log('Step 5: Create Second User and Follow');

    const secondUserData = createTestUser();
    const secondUserResponse = await graphqlRequest<{
      createUser: { id: string; username: string };
    }>(CREATE_USER, { user: secondUserData });
    assertNoErrors(secondUserResponse);
    const secondUserId = secondUserResponse.data.createUser.id;

    // Follow the second user
    const followResponse = await graphqlRequest<{
      followUser: boolean;
    }>(FOLLOW_USER, { userId: secondUserId }, accessToken);
    assertNoErrors(followResponse);
    expect(followResponse.data.followUser).toBe(true);
    console.log(`  ✓ Following user: ${secondUserResponse.data.createUser.username}`);

    // ==================== Step 6: Verify Data Persistence ====================
    console.log('Step 6: Verify Data Persistence');

    // Verify user's collections
    const userCollectionsResponse = await graphqlRequest<{
      collections: {
        edges: Array<{ node: { id: string } }>;
        pageInfo: { totalCount: number };
      };
    }>(COLLECTIONS, { first: 10, userId });
    assertNoErrors(userCollectionsResponse);
    expect(userCollectionsResponse.data.collections.edges.length).toBeGreaterThanOrEqual(3);
    console.log(
      `  ✓ User has ${userCollectionsResponse.data.collections.pageInfo.totalCount} collections`
    );

    console.log('\n✅ User journey completed successfully!');
  });

  it('should handle concurrent collection creation correctly', async () => {
    // Create user and get token
    const userData = createTestUser();
    await graphqlRequest(CREATE_USER, { user: userData });

    const authResponse = await graphqlRequest<{
      authorize: { accessToken: string };
    }>(AUTHORIZE, {
      credentials: { email: userData.email, password: userData.password },
    });
    assertNoErrors(authResponse);
    const accessToken = authResponse.data.authorize.accessToken;

    // Create multiple collections concurrently
    const collectionPromises = [1, 2, 3].map((i) =>
      graphqlRequest<{ createCollection: { id: string } }>(
        CREATE_COLLECTION,
        {
          collection: createTestCollection({ title: `Concurrent Collection ${i}` }),
        },
        accessToken
      )
    );

    const collectionResults = await Promise.all(collectionPromises);
    for (const result of collectionResults) {
      assertNoErrors(result);
    }

    expect(collectionResults.length).toBe(3);
    console.log('✅ Concurrent operations completed successfully');
  });
});
