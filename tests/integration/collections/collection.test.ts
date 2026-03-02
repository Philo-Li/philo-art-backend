import { describe, it, expect, beforeAll } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import { COLLECTION, CREATE_COLLECTION } from '../../utils/graphqlOperations.js';
import { createUserAndAuthorize } from '../../utils/authHelpers.js';
import { createTestCollection } from '../../utils/factories/collectionFactory.js';

describe('Query: collection', () => {
  let accessToken: string;
  let testCollectionId: string;
  let testCollectionTitle: string;

  beforeAll(async () => {
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;

    // Create a test collection
    const collectionData = createTestCollection({
      title: 'Test Collection for Query',
      description: 'A test collection description',
      public: true,
    });

    const response = await graphqlRequest<{
      createCollection: { id: string; title: string };
    }>(CREATE_COLLECTION, { collection: collectionData }, accessToken);
    assertNoErrors(response);
    testCollectionId = response.data.createCollection.id;
    testCollectionTitle = response.data.createCollection.title;
  });

  it('should return collection by id', async () => {
    const response = await graphqlRequest<{
      collection: {
        id: string;
        title: string;
        description: string;
        public: boolean;
        user: {
          id: string;
          username: string;
        };
      };
    }>(COLLECTION, {
      id: testCollectionId,
    });

    assertNoErrors(response);
    expect(response.data.collection).toBeDefined();
    expect(response.data.collection.id).toBe(testCollectionId);
    expect(response.data.collection.title).toBe(testCollectionTitle);
    expect(response.data.collection.user).toBeDefined();
  });

  it('should return null for non-existent collection', async () => {
    const response = await graphqlRequest<{
      collection: null;
    }>(COLLECTION, {
      id: 'nonexistent-collection-id',
    });

    assertNoErrors(response);
    expect(response.data.collection).toBeNull();
  });
});
