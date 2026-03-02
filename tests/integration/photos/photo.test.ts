import { describe, it, expect, beforeAll } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import { PHOTO, CREATE_PHOTO } from '../../utils/graphqlOperations.js';
import { createUserAndAuthorize } from '../../utils/authHelpers.js';
import { createTestPhoto } from '../../utils/factories/photoFactory.js';

describe('Query: photo', () => {
  let accessToken: string;
  let testPhotoId: string;

  beforeAll(async () => {
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;

    // Create a test photo
    const photoData = createTestPhoto();
    const response = await graphqlRequest<{
      createPhoto: { id: string };
    }>(CREATE_PHOTO, { photo: photoData }, accessToken);
    assertNoErrors(response);
    testPhotoId = response.data.createPhoto.id;
  });

  it('should return photo by id', async () => {
    const response = await graphqlRequest<{
      photo: {
        id: string;
        title: string;
        year: number;
        description: string;
        user: {
          id: string;
          username: string;
        };
      };
    }>(PHOTO, {
      id: testPhotoId,
    });

    assertNoErrors(response);
    expect(response.data.photo).toBeDefined();
    expect(response.data.photo.id).toBe(testPhotoId);
    expect(response.data.photo.title).toBeDefined();
    expect(response.data.photo.user).toBeDefined();
  });

  it('should return null for non-existent photo', async () => {
    const response = await graphqlRequest<{
      photo: null;
    }>(PHOTO, {
      id: 'nonexistent-photo-id',
    });

    assertNoErrors(response);
    expect(response.data.photo).toBeNull();
  });
});
