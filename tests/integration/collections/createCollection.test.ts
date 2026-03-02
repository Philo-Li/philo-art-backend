import { describe, it, expect, beforeAll } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import { CREATE_COLLECTION, COLLECTION } from '../../utils/graphqlOperations.js';
import { createUserAndAuthorize } from '../../utils/authHelpers.js';
import { createTestCollection } from '../../utils/factories/collectionFactory.js';

describe('Mutation: createCollection', () => {
  let accessToken: string;

  beforeAll(async () => {
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;
  });

  it('should create a public collection', async () => {
    const collectionData = createTestCollection({
      title: 'My Public Collection',
      description: 'A public collection for testing',
      public: true,
    });

    const response = await graphqlRequest<{
      createCollection: {
        id: string;
        title: string;
        description: string;
        public: boolean;
      };
    }>(CREATE_COLLECTION, { collection: collectionData }, accessToken);

    assertNoErrors(response);
    expect(response.data.createCollection.id).toBeDefined();
    expect(response.data.createCollection.title).toBe(collectionData.title);
    expect(response.data.createCollection.description).toBe(collectionData.description);
    expect(response.data.createCollection.public).toBe(true);
  });

  it('should create a private collection', async () => {
    const collectionData = createTestCollection({
      title: 'My Private Collection',
      public: false,
    });

    const response = await graphqlRequest<{
      createCollection: {
        id: string;
        title: string;
        public: boolean;
      };
    }>(CREATE_COLLECTION, { collection: collectionData }, accessToken);

    assertNoErrors(response);
    expect(response.data.createCollection.id).toBeDefined();
    expect(response.data.createCollection.public).toBe(false);
  });

  it('should fail without authentication', async () => {
    const collectionData = createTestCollection();

    const response = await graphqlRequest(CREATE_COLLECTION, {
      collection: collectionData,
    });

    expect(response.errors).toBeDefined();
    expect(response.errors!.some((e) => e.extensions?.code === 'UNAUTHENTICATED')).toBe(true);
  });

  it('should fail with missing required title', async () => {
    const response = await graphqlRequest(
      CREATE_COLLECTION,
      {
        collection: {
          description: 'No title',
          public: true,
        },
      },
      accessToken
    );

    expect(response.errors).toBeDefined();
  });

  it('should persist created collection', async () => {
    const collectionData = createTestCollection();

    const createResponse = await graphqlRequest<{
      createCollection: { id: string; title: string };
    }>(CREATE_COLLECTION, { collection: collectionData }, accessToken);

    assertNoErrors(createResponse);
    const collectionId = createResponse.data.createCollection.id;

    // Fetch the collection to verify persistence
    const fetchResponse = await graphqlRequest<{
      collection: {
        id: string;
        title: string;
      };
    }>(COLLECTION, { id: collectionId });

    assertNoErrors(fetchResponse);
    expect(fetchResponse.data.collection.id).toBe(collectionId);
    expect(fetchResponse.data.collection.title).toBe(collectionData.title);
  });
});
