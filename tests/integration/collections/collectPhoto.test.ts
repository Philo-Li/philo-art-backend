import { describe, it, expect, beforeAll } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import {
  COLLECT_PHOTO,
  DELETE_COLLECTED_PHOTO,
  CREATE_COLLECTION,
  CREATE_PHOTO,
  PHOTOS_IN_COLLECTION,
} from '../../utils/graphqlOperations.js';
import { createUserAndAuthorize } from '../../utils/authHelpers.js';
import { createTestCollection } from '../../utils/factories/collectionFactory.js';
import { createTestPhoto } from '../../utils/factories/photoFactory.js';

describe('Mutation: collectPhoto', () => {
  let accessToken: string;
  let testCollectionId: string;
  let testPhotoId: string;

  beforeAll(async () => {
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;

    // Create a test collection
    const collectionData = createTestCollection();
    const collectionResponse = await graphqlRequest<{
      createCollection: { id: string };
    }>(CREATE_COLLECTION, { collection: collectionData }, accessToken);
    assertNoErrors(collectionResponse);
    testCollectionId = collectionResponse.data.createCollection.id;

    // Create a test photo
    const photoData = createTestPhoto();
    const photoResponse = await graphqlRequest<{
      createPhoto: { id: string };
    }>(CREATE_PHOTO, { photo: photoData }, accessToken);
    assertNoErrors(photoResponse);
    testPhotoId = photoResponse.data.createPhoto.id;
  });

  it('should add photo to collection', async () => {
    const response = await graphqlRequest<{
      collectPhoto: {
        id: string;
        photo: { id: string; title: string };
        collection: { id: string; title: string };
      };
    }>(
      COLLECT_PHOTO,
      {
        collect: {
          photoId: testPhotoId,
          collectionId: testCollectionId,
        },
      },
      accessToken
    );

    assertNoErrors(response);
    expect(response.data.collectPhoto.id).toBeDefined();
    expect(response.data.collectPhoto.photo.id).toBe(testPhotoId);
    expect(response.data.collectPhoto.collection.id).toBe(testCollectionId);
  });

  it('should return existing record if already collected', async () => {
    // Collect the same photo again
    const response = await graphqlRequest<{
      collectPhoto: {
        id: string;
        photo: { id: string };
      };
    }>(
      COLLECT_PHOTO,
      {
        collect: {
          photoId: testPhotoId,
          collectionId: testCollectionId,
        },
      },
      accessToken
    );

    assertNoErrors(response);
    // Should not throw error, returns existing record
    expect(response.data.collectPhoto.photo.id).toBe(testPhotoId);
  });

  it('should fail without authentication', async () => {
    const response = await graphqlRequest(COLLECT_PHOTO, {
      collect: {
        photoId: testPhotoId,
        collectionId: testCollectionId,
      },
    });

    expect(response.errors).toBeDefined();
    expect(response.errors!.some((e) => e.extensions?.code === 'UNAUTHENTICATED')).toBe(true);
  });
});

describe('Query: photosInCollection', () => {
  let accessToken: string;
  let testCollectionId: string;
  let testPhotoIds: string[] = [];

  beforeAll(async () => {
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;

    // Create a test collection
    const collectionData = createTestCollection();
    const collectionResponse = await graphqlRequest<{
      createCollection: { id: string };
    }>(CREATE_COLLECTION, { collection: collectionData }, accessToken);
    assertNoErrors(collectionResponse);
    testCollectionId = collectionResponse.data.createCollection.id;

    // Create and collect multiple photos
    for (let i = 0; i < 3; i++) {
      const photoData = createTestPhoto();
      const photoResponse = await graphqlRequest<{
        createPhoto: { id: string };
      }>(CREATE_PHOTO, { photo: photoData }, accessToken);
      assertNoErrors(photoResponse);
      const photoId = photoResponse.data.createPhoto.id;
      testPhotoIds.push(photoId);

      // Add to collection
      await graphqlRequest(
        COLLECT_PHOTO,
        {
          collect: {
            photoId,
            collectionId: testCollectionId,
          },
        },
        accessToken
      );
    }
  });

  it('should return photos in collection', async () => {
    const response = await graphqlRequest<{
      photosInCollection: {
        edges: Array<{
          node: {
            id: string;
            photo: { id: string; title: string };
          };
          cursor: string;
        }>;
        pageInfo: {
          totalCount: number;
          hasNextPage: boolean;
        };
      };
    }>(PHOTOS_IN_COLLECTION, {
      id: testCollectionId,
      first: 10,
    });

    assertNoErrors(response);
    expect(response.data.photosInCollection.edges.length).toBe(3);
    expect(response.data.photosInCollection.pageInfo.totalCount).toBe(3);

    // Verify all test photos are in the collection
    const returnedPhotoIds = response.data.photosInCollection.edges.map(
      (edge) => edge.node.photo.id
    );
    for (const photoId of testPhotoIds) {
      expect(returnedPhotoIds).toContain(photoId);
    }
  });

  it('should return empty for collection with no photos', async () => {
    // Create empty collection
    const emptyCollectionData = createTestCollection();
    const emptyCollectionResponse = await graphqlRequest<{
      createCollection: { id: string };
    }>(CREATE_COLLECTION, { collection: emptyCollectionData }, accessToken);
    assertNoErrors(emptyCollectionResponse);

    const response = await graphqlRequest<{
      photosInCollection: {
        edges: Array<{ node: { id: string } }>;
        pageInfo: { totalCount: number };
      };
    }>(PHOTOS_IN_COLLECTION, {
      id: emptyCollectionResponse.data.createCollection.id,
      first: 10,
    });

    assertNoErrors(response);
    expect(response.data.photosInCollection.edges.length).toBe(0);
    expect(response.data.photosInCollection.pageInfo.totalCount).toBe(0);
  });
});

describe('Mutation: deleteCollectedPhoto', () => {
  let accessToken: string;
  let testCollectionId: string;
  let testPhotoId: string;

  beforeAll(async () => {
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;

    // Create a test collection
    const collectionData = createTestCollection();
    const collectionResponse = await graphqlRequest<{
      createCollection: { id: string };
    }>(CREATE_COLLECTION, { collection: collectionData }, accessToken);
    assertNoErrors(collectionResponse);
    testCollectionId = collectionResponse.data.createCollection.id;

    // Create and collect a photo
    const photoData = createTestPhoto();
    const photoResponse = await graphqlRequest<{
      createPhoto: { id: string };
    }>(CREATE_PHOTO, { photo: photoData }, accessToken);
    assertNoErrors(photoResponse);
    testPhotoId = photoResponse.data.createPhoto.id;

    await graphqlRequest(
      COLLECT_PHOTO,
      {
        collect: {
          photoId: testPhotoId,
          collectionId: testCollectionId,
        },
      },
      accessToken
    );
  });

  it('should remove photo from collection', async () => {
    const response = await graphqlRequest<{
      deleteCollectedPhoto: boolean;
    }>(
      DELETE_COLLECTED_PHOTO,
      {
        photoId: testPhotoId,
        collectionId: testCollectionId,
      },
      accessToken
    );

    assertNoErrors(response);
    expect(response.data.deleteCollectedPhoto).toBe(true);

    // Verify photo is removed from collection
    const photosResponse = await graphqlRequest<{
      photosInCollection: {
        edges: Array<{
          node: { photo: { id: string } };
        }>;
      };
    }>(PHOTOS_IN_COLLECTION, {
      id: testCollectionId,
      first: 10,
    });

    assertNoErrors(photosResponse);
    const photoIds = photosResponse.data.photosInCollection.edges.map(
      (edge) => edge.node.photo.id
    );
    expect(photoIds).not.toContain(testPhotoId);
  });

  it('should fail without authentication', async () => {
    const response = await graphqlRequest(DELETE_COLLECTED_PHOTO, {
      photoId: testPhotoId,
      collectionId: testCollectionId,
    });

    expect(response.errors).toBeDefined();
    expect(response.errors!.some((e) => e.extensions?.code === 'UNAUTHENTICATED')).toBe(true);
  });
});
