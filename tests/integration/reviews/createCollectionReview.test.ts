import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import {
  CREATE_COLLECTION_REVIEW,
  DELETE_COLLECTION_REVIEW,
  CREATE_COLLECTION,
} from '../../utils/graphqlOperations.js';
import { createUserAndAuthorize } from '../../utils/authHelpers.js';
import { createTestCollection } from '../../utils/factories/collectionFactory.js';

describe('Mutation: createCollectionReview', () => {
  let accessToken: string;
  let testCollectionId: string;

  beforeAll(async () => {
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;
  });

  beforeEach(async () => {
    // Create a fresh collection for each test
    const collectionData = createTestCollection();
    const response = await graphqlRequest<{
      createCollection: { id: string };
    }>(CREATE_COLLECTION, { collection: collectionData }, accessToken);
    assertNoErrors(response);
    testCollectionId = response.data.createCollection.id;
  });

  it('should create a collection review', async () => {
    const reviewText = 'This is a great collection!';

    const response = await graphqlRequest<{
      createCollectionReview: {
        id: string;
        text: string;
        collection: { id: string; title: string };
        user: { id: string; username: string };
      };
    }>(
      CREATE_COLLECTION_REVIEW,
      {
        collectionReview: {
          collectionId: testCollectionId,
          text: reviewText,
        },
      },
      accessToken
    );

    assertNoErrors(response);
    expect(response.data.createCollectionReview.id).toBeDefined();
    expect(response.data.createCollectionReview.text).toBe(reviewText);
    expect(response.data.createCollectionReview.collection.id).toBe(testCollectionId);
    expect(response.data.createCollectionReview.user).toBeDefined();
  });

  it('should allow multiple reviews on same collection', async () => {
    const firstReview = await graphqlRequest<{
      createCollectionReview: { id: string };
    }>(
      CREATE_COLLECTION_REVIEW,
      {
        collectionReview: {
          collectionId: testCollectionId,
          text: 'First review',
        },
      },
      accessToken
    );
    assertNoErrors(firstReview);

    const secondReview = await graphqlRequest<{
      createCollectionReview: { id: string };
    }>(
      CREATE_COLLECTION_REVIEW,
      {
        collectionReview: {
          collectionId: testCollectionId,
          text: 'Second review',
        },
      },
      accessToken
    );
    assertNoErrors(secondReview);

    expect(firstReview.data.createCollectionReview.id).not.toBe(
      secondReview.data.createCollectionReview.id
    );
  });

  it('should fail without authentication', async () => {
    const response = await graphqlRequest(CREATE_COLLECTION_REVIEW, {
      collectionReview: {
        collectionId: testCollectionId,
        text: 'Should fail',
      },
    });

    expect(response.errors).toBeDefined();
    expect(response.errors!.some((e) => e.extensions?.code === 'UNAUTHENTICATED')).toBe(true);
  });
});

describe('Mutation: deleteCollectionReview', () => {
  let accessToken: string;
  let otherUserToken: string;
  let testReviewId: string;

  beforeAll(async () => {
    // Create first user
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;

    // Create a collection
    const collectionData = createTestCollection();
    const collectionResponse = await graphqlRequest<{
      createCollection: { id: string };
    }>(CREATE_COLLECTION, { collection: collectionData }, accessToken);
    assertNoErrors(collectionResponse);

    // Create a review
    const reviewResponse = await graphqlRequest<{
      createCollectionReview: { id: string };
    }>(
      CREATE_COLLECTION_REVIEW,
      {
        collectionReview: {
          collectionId: collectionResponse.data.createCollection.id,
          text: 'Review to delete',
        },
      },
      accessToken
    );
    assertNoErrors(reviewResponse);
    testReviewId = reviewResponse.data.createCollectionReview.id;

    // Create second user
    const otherAuth = await createUserAndAuthorize();
    otherUserToken = otherAuth.accessToken;
  });

  it('should delete own review', async () => {
    // First create a new review to delete
    const collectionData = createTestCollection();
    const collectionResponse = await graphqlRequest<{
      createCollection: { id: string };
    }>(CREATE_COLLECTION, { collection: collectionData }, accessToken);
    assertNoErrors(collectionResponse);

    const reviewResponse = await graphqlRequest<{
      createCollectionReview: { id: string };
    }>(
      CREATE_COLLECTION_REVIEW,
      {
        collectionReview: {
          collectionId: collectionResponse.data.createCollection.id,
          text: 'Review to delete',
        },
      },
      accessToken
    );
    assertNoErrors(reviewResponse);

    const response = await graphqlRequest<{
      deleteCollectionReview: boolean;
    }>(
      DELETE_COLLECTION_REVIEW,
      { id: reviewResponse.data.createCollectionReview.id },
      accessToken
    );

    assertNoErrors(response);
    expect(response.data.deleteCollectionReview).toBe(true);
  });

  it('should fail without authentication', async () => {
    const response = await graphqlRequest(DELETE_COLLECTION_REVIEW, {
      id: testReviewId,
    });

    expect(response.errors).toBeDefined();
    expect(response.errors!.some((e) => e.extensions?.code === 'UNAUTHENTICATED')).toBe(true);
  });

  it('should fail when deleting another user\'s review', async () => {
    const response = await graphqlRequest(
      DELETE_COLLECTION_REVIEW,
      { id: testReviewId },
      otherUserToken
    );

    expect(response.errors).toBeDefined();
  });
});
