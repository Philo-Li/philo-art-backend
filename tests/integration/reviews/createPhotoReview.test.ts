import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import {
  CREATE_PHOTO_REVIEW,
  DELETE_PHOTO_REVIEW,
  CREATE_PHOTO,
} from '../../utils/graphqlOperations.js';
import { createUserAndAuthorize } from '../../utils/authHelpers.js';
import { createTestPhoto } from '../../utils/factories/photoFactory.js';

describe('Mutation: createPhotoReview', () => {
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

  it('should create a photo review', async () => {
    const reviewText = 'This is a great photo!';

    const response = await graphqlRequest<{
      createPhotoReview: {
        id: string;
        text: string;
        photo: { id: string; title: string };
        user: { id: string; username: string };
      };
    }>(
      CREATE_PHOTO_REVIEW,
      {
        photoReview: {
          photoId: testPhotoId,
          text: reviewText,
        },
      },
      accessToken
    );

    assertNoErrors(response);
    expect(response.data.createPhotoReview.id).toBeDefined();
    expect(response.data.createPhotoReview.text).toBe(reviewText);
    expect(response.data.createPhotoReview.photo.id).toBe(testPhotoId);
    expect(response.data.createPhotoReview.user).toBeDefined();
  });

  it('should allow multiple reviews on same photo', async () => {
    const firstReview = await graphqlRequest<{
      createPhotoReview: { id: string; text: string };
    }>(
      CREATE_PHOTO_REVIEW,
      {
        photoReview: {
          photoId: testPhotoId,
          text: 'First review',
        },
      },
      accessToken
    );
    assertNoErrors(firstReview);

    const secondReview = await graphqlRequest<{
      createPhotoReview: { id: string; text: string };
    }>(
      CREATE_PHOTO_REVIEW,
      {
        photoReview: {
          photoId: testPhotoId,
          text: 'Second review',
        },
      },
      accessToken
    );
    assertNoErrors(secondReview);

    expect(firstReview.data.createPhotoReview.id).not.toBe(
      secondReview.data.createPhotoReview.id
    );
  });

  it('should fail without authentication', async () => {
    const response = await graphqlRequest(CREATE_PHOTO_REVIEW, {
      photoReview: {
        photoId: testPhotoId,
        text: 'Should fail',
      },
    });

    expect(response.errors).toBeDefined();
    expect(response.errors!.some((e) => e.extensions?.code === 'UNAUTHENTICATED')).toBe(true);
  });
});

describe('Mutation: deletePhotoReview', () => {
  let accessToken: string;
  let otherUserToken: string;
  let testReviewId: string;

  beforeAll(async () => {
    // Create first user and review
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;

    // Create a photo
    const photoData = createTestPhoto();
    const photoResponse = await graphqlRequest<{
      createPhoto: { id: string };
    }>(CREATE_PHOTO, { photo: photoData }, accessToken);
    assertNoErrors(photoResponse);

    // Create a review
    const reviewResponse = await graphqlRequest<{
      createPhotoReview: { id: string };
    }>(
      CREATE_PHOTO_REVIEW,
      {
        photoReview: {
          photoId: photoResponse.data.createPhoto.id,
          text: 'Review to delete',
        },
      },
      accessToken
    );
    assertNoErrors(reviewResponse);
    testReviewId = reviewResponse.data.createPhotoReview.id;

    // Create second user
    const otherAuth = await createUserAndAuthorize();
    otherUserToken = otherAuth.accessToken;
  });

  it('should delete own review', async () => {
    // First create a new review to delete
    const photoData = createTestPhoto();
    const photoResponse = await graphqlRequest<{
      createPhoto: { id: string };
    }>(CREATE_PHOTO, { photo: photoData }, accessToken);
    assertNoErrors(photoResponse);

    const reviewResponse = await graphqlRequest<{
      createPhotoReview: { id: string };
    }>(
      CREATE_PHOTO_REVIEW,
      {
        photoReview: {
          photoId: photoResponse.data.createPhoto.id,
          text: 'Review to delete',
        },
      },
      accessToken
    );
    assertNoErrors(reviewResponse);

    const response = await graphqlRequest<{
      deletePhotoReview: boolean;
    }>(DELETE_PHOTO_REVIEW, { id: reviewResponse.data.createPhotoReview.id }, accessToken);

    assertNoErrors(response);
    expect(response.data.deletePhotoReview).toBe(true);
  });

  it('should fail without authentication', async () => {
    const response = await graphqlRequest(DELETE_PHOTO_REVIEW, {
      id: testReviewId,
    });

    expect(response.errors).toBeDefined();
    expect(response.errors!.some((e) => e.extensions?.code === 'UNAUTHENTICATED')).toBe(true);
  });

  it('should fail when deleting another user\'s review', async () => {
    const response = await graphqlRequest(
      DELETE_PHOTO_REVIEW,
      { id: testReviewId },
      otherUserToken
    );

    expect(response.errors).toBeDefined();
  });
});
