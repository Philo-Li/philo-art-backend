import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import {
  LIKE_PHOTO,
  UNLIKE_PHOTO,
  IS_LIKED_PHOTO,
  CREATE_PHOTO,
} from '../../utils/graphqlOperations.js';
import { createUserAndAuthorize } from '../../utils/authHelpers.js';
import { createTestPhoto } from '../../utils/factories/photoFactory.js';

describe('Mutation: likePhoto', () => {
  let accessToken: string;
  let testPhotoId: string;

  beforeAll(async () => {
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;
  });

  beforeEach(async () => {
    // Create a fresh photo for each test
    const photoData = createTestPhoto();
    const response = await graphqlRequest<{
      createPhoto: { id: string };
    }>(CREATE_PHOTO, { photo: photoData }, accessToken);
    assertNoErrors(response);
    testPhotoId = response.data.createPhoto.id;
  });

  it('should like a photo', async () => {
    const response = await graphqlRequest<{
      likePhoto: {
        id: string;
        photo: { id: string; title: string };
        user: { id: string; username: string };
      };
    }>(LIKE_PHOTO, { photoId: testPhotoId }, accessToken);

    assertNoErrors(response);
    expect(response.data.likePhoto.id).toBeDefined();
    expect(response.data.likePhoto.photo.id).toBe(testPhotoId);
    expect(response.data.likePhoto.user).toBeDefined();
  });

  it('should return existing like if already liked', async () => {
    // Like the photo first
    await graphqlRequest(LIKE_PHOTO, { photoId: testPhotoId }, accessToken);

    // Try to like again
    const response = await graphqlRequest<{
      likePhoto: {
        id: string;
        photo: { id: string };
      };
    }>(LIKE_PHOTO, { photoId: testPhotoId }, accessToken);

    assertNoErrors(response);
    expect(response.data.likePhoto.photo.id).toBe(testPhotoId);
  });

  it('should fail without authentication', async () => {
    const response = await graphqlRequest(LIKE_PHOTO, {
      photoId: testPhotoId,
    });

    expect(response.errors).toBeDefined();
    expect(response.errors!.some((e) => e.extensions?.code === 'UNAUTHENTICATED')).toBe(true);
  });

  it('should fail for non-existent photo', async () => {
    const response = await graphqlRequest(
      LIKE_PHOTO,
      { photoId: 'nonexistent-photo-id' },
      accessToken
    );

    expect(response.errors).toBeDefined();
    expect(response.errors![0].extensions?.code).toBe('BAD_USER_INPUT');
  });
});

describe('Mutation: unlikePhoto', () => {
  let accessToken: string;
  let testPhotoId: string;

  beforeAll(async () => {
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;

    // Create and like a photo
    const photoData = createTestPhoto();
    const photoResponse = await graphqlRequest<{
      createPhoto: { id: string };
    }>(CREATE_PHOTO, { photo: photoData }, accessToken);
    assertNoErrors(photoResponse);
    testPhotoId = photoResponse.data.createPhoto.id;

    await graphqlRequest(LIKE_PHOTO, { photoId: testPhotoId }, accessToken);
  });

  it('should unlike a photo', async () => {
    const response = await graphqlRequest<{
      unlikePhoto: boolean;
    }>(UNLIKE_PHOTO, { photoId: testPhotoId }, accessToken);

    assertNoErrors(response);
    expect(response.data.unlikePhoto).toBe(true);

    // Verify photo is unliked
    const isLikedResponse = await graphqlRequest<{
      isLikedPhoto: boolean;
    }>(IS_LIKED_PHOTO, { photoId: testPhotoId }, accessToken);

    assertNoErrors(isLikedResponse);
    expect(isLikedResponse.data.isLikedPhoto).toBe(false);
  });

  it('should fail without authentication', async () => {
    const response = await graphqlRequest(UNLIKE_PHOTO, {
      photoId: testPhotoId,
    });

    expect(response.errors).toBeDefined();
    expect(response.errors!.some((e) => e.extensions?.code === 'UNAUTHENTICATED')).toBe(true);
  });
});

describe('Query: isLikedPhoto', () => {
  let accessToken: string;
  let likedPhotoId: string;
  let notLikedPhotoId: string;

  beforeAll(async () => {
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;

    // Create and like a photo
    const likedPhotoData = createTestPhoto();
    const likedPhotoResponse = await graphqlRequest<{
      createPhoto: { id: string };
    }>(CREATE_PHOTO, { photo: likedPhotoData }, accessToken);
    assertNoErrors(likedPhotoResponse);
    likedPhotoId = likedPhotoResponse.data.createPhoto.id;
    await graphqlRequest(LIKE_PHOTO, { photoId: likedPhotoId }, accessToken);

    // Create a photo but don't like it
    const notLikedPhotoData = createTestPhoto();
    const notLikedPhotoResponse = await graphqlRequest<{
      createPhoto: { id: string };
    }>(CREATE_PHOTO, { photo: notLikedPhotoData }, accessToken);
    assertNoErrors(notLikedPhotoResponse);
    notLikedPhotoId = notLikedPhotoResponse.data.createPhoto.id;
  });

  it('should return true for liked photo', async () => {
    const response = await graphqlRequest<{
      isLikedPhoto: boolean;
    }>(IS_LIKED_PHOTO, { photoId: likedPhotoId }, accessToken);

    assertNoErrors(response);
    expect(response.data.isLikedPhoto).toBe(true);
  });

  it('should return false for not liked photo', async () => {
    const response = await graphqlRequest<{
      isLikedPhoto: boolean;
    }>(IS_LIKED_PHOTO, { photoId: notLikedPhotoId }, accessToken);

    assertNoErrors(response);
    expect(response.data.isLikedPhoto).toBe(false);
  });

  it('should return false without authentication', async () => {
    const response = await graphqlRequest<{
      isLikedPhoto: boolean;
    }>(IS_LIKED_PHOTO, { photoId: likedPhotoId });

    assertNoErrors(response);
    expect(response.data.isLikedPhoto).toBe(false);
  });
});
