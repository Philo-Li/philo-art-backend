import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import { DELETE_PHOTO, CREATE_PHOTO, PHOTO } from '../../utils/graphqlOperations.js';
import { createUserAndAuthorize } from '../../utils/authHelpers.js';
import { createTestPhoto } from '../../utils/factories/photoFactory.js';

describe('Mutation: deletePhoto', () => {
  let accessToken: string;
  let otherUserToken: string;
  let testPhotoId: string;

  beforeAll(async () => {
    // Create first user
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;

    // Create second user
    const otherAuth = await createUserAndAuthorize();
    otherUserToken = otherAuth.accessToken;
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

  it('should delete own photo', async () => {
    const response = await graphqlRequest<{
      deletePhoto: boolean;
    }>(DELETE_PHOTO, { id: testPhotoId }, accessToken);

    assertNoErrors(response);
    expect(response.data.deletePhoto).toBe(true);

    // Verify photo is deleted
    const fetchResponse = await graphqlRequest<{
      photo: null;
    }>(PHOTO, { id: testPhotoId });

    assertNoErrors(fetchResponse);
    expect(fetchResponse.data.photo).toBeNull();
  });

  it('should fail without authentication', async () => {
    const response = await graphqlRequest(DELETE_PHOTO, {
      id: testPhotoId,
    });

    expect(response.errors).toBeDefined();
    expect(response.errors!.some((e) => e.extensions?.code === 'UNAUTHENTICATED')).toBe(true);
  });

  it('should fail for non-existent photo', async () => {
    const response = await graphqlRequest(
      DELETE_PHOTO,
      { id: 'nonexistent-id' },
      accessToken
    );

    expect(response.errors).toBeDefined();
    expect(response.errors![0].extensions?.code).toBe('BAD_USER_INPUT');
  });

  it('should fail when deleting another user\'s photo', async () => {
    const response = await graphqlRequest(
      DELETE_PHOTO,
      { id: testPhotoId },
      otherUserToken
    );

    expect(response.errors).toBeDefined();
    expect(response.errors![0].extensions?.code).toBe('FORBIDDEN');

    // Verify photo still exists
    const fetchResponse = await graphqlRequest<{
      photo: { id: string };
    }>(PHOTO, { id: testPhotoId });

    assertNoErrors(fetchResponse);
    expect(fetchResponse.data.photo).not.toBeNull();
  });
});
