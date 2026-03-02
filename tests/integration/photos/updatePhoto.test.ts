import { describe, it, expect, beforeAll } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import { UPDATE_PHOTO, CREATE_PHOTO, PHOTO } from '../../utils/graphqlOperations.js';
import { createUserAndAuthorize } from '../../utils/authHelpers.js';
import { createTestPhoto } from '../../utils/factories/photoFactory.js';

describe('Mutation: updatePhoto', () => {
  let accessToken: string;
  let otherUserToken: string;
  let testPhotoId: string;

  beforeAll(async () => {
    // Create first user and photo
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;

    const photoData = createTestPhoto();
    const response = await graphqlRequest<{
      createPhoto: { id: string };
    }>(CREATE_PHOTO, { photo: photoData }, accessToken);
    assertNoErrors(response);
    testPhotoId = response.data.createPhoto.id;

    // Create second user
    const otherAuth = await createUserAndAuthorize();
    otherUserToken = otherAuth.accessToken;
  });

  it('should update photo title', async () => {
    const newTitle = 'Updated Photo Title';

    const response = await graphqlRequest<{
      updatePhoto: {
        id: string;
        title: string;
      };
    }>(
      UPDATE_PHOTO,
      {
        photo: {
          photoId: testPhotoId,
          title: newTitle,
          published: true,
        },
      },
      accessToken
    );

    assertNoErrors(response);
    expect(response.data.updatePhoto.title).toBe(newTitle);
  });

  it('should update photo with all optional fields', async () => {
    const updateData = {
      photoId: testPhotoId,
      title: 'Full Update Title',
      summary: 'A summary',
      tag: 'nature,landscape',
      license: 'CC-BY',
      content: 'Updated description content',
      published: true,
    };

    const response = await graphqlRequest<{
      updatePhoto: {
        id: string;
        title: string;
        description: string;
        tags: string;
        license: string;
      };
    }>(UPDATE_PHOTO, { photo: updateData }, accessToken);

    assertNoErrors(response);
    expect(response.data.updatePhoto.title).toBe(updateData.title);
    expect(response.data.updatePhoto.description).toBe(updateData.content);
    expect(response.data.updatePhoto.tags).toBe(updateData.tag);
    expect(response.data.updatePhoto.license).toBe(updateData.license);
  });

  it('should fail without authentication', async () => {
    const response = await graphqlRequest(UPDATE_PHOTO, {
      photo: {
        photoId: testPhotoId,
        title: 'Should Fail',
        published: true,
      },
    });

    expect(response.errors).toBeDefined();
    expect(response.errors!.some((e) => e.extensions?.code === 'UNAUTHENTICATED')).toBe(true);
  });

  it('should fail for non-existent photo', async () => {
    const response = await graphqlRequest(
      UPDATE_PHOTO,
      {
        photo: {
          photoId: 'nonexistent-id',
          title: 'Should Fail',
          published: true,
        },
      },
      accessToken
    );

    expect(response.errors).toBeDefined();
    expect(response.errors![0].extensions?.code).toBe('BAD_USER_INPUT');
  });

  it('should fail when updating another user\'s photo', async () => {
    const response = await graphqlRequest(
      UPDATE_PHOTO,
      {
        photo: {
          photoId: testPhotoId,
          title: 'Unauthorized Update',
          published: true,
        },
      },
      otherUserToken
    );

    expect(response.errors).toBeDefined();
    expect(response.errors![0].extensions?.code).toBe('FORBIDDEN');
  });
});
