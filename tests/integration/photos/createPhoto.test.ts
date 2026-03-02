import { describe, it, expect, beforeAll } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import { CREATE_PHOTO, PHOTO } from '../../utils/graphqlOperations.js';
import { createUserAndAuthorize } from '../../utils/authHelpers.js';
import { createTestPhoto } from '../../utils/factories/photoFactory.js';

describe('Mutation: createPhoto', () => {
  let accessToken: string;

  beforeAll(async () => {
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;
  });

  it('should create a photo with all fields', async () => {
    const photoData = createTestPhoto({
      title: 'Test Photo Title',
      year: 2023,
      description: 'A beautiful test photo',
      type: 'Photograph',
      allowDownload: true,
    });

    const response = await graphqlRequest<{
      createPhoto: {
        id: string;
        title: string;
        year: number;
        description: string;
        type: string;
        allowDownload: boolean;
      };
    }>(CREATE_PHOTO, { photo: photoData }, accessToken);

    assertNoErrors(response);
    expect(response.data.createPhoto.id).toBeDefined();
    expect(response.data.createPhoto.title).toBe(photoData.title);
    expect(response.data.createPhoto.year).toBe(photoData.year);
    expect(response.data.createPhoto.type).toBe(photoData.type);
    expect(response.data.createPhoto.allowDownload).toBe(photoData.allowDownload);
  });

  it('should create photo with custom photoId', async () => {
    const customId = 'custom-photo-id-123';
    const photoData = createTestPhoto({
      photoId: customId,
    });

    const response = await graphqlRequest<{
      createPhoto: {
        id: string;
      };
    }>(CREATE_PHOTO, { photo: photoData }, accessToken);

    assertNoErrors(response);
    expect(response.data.createPhoto.id).toBe(customId);
  });

  it('should fail without authentication', async () => {
    const photoData = createTestPhoto();

    const response = await graphqlRequest(CREATE_PHOTO, { photo: photoData });

    expect(response.errors).toBeDefined();
    expect(response.errors!.some((e) => e.extensions?.code === 'UNAUTHENTICATED')).toBe(true);
  });

  it('should fail with missing required fields', async () => {
    const response = await graphqlRequest(
      CREATE_PHOTO,
      {
        photo: {
          title: 'Only Title',
          // Missing year, imageUrl, allowDownload
        },
      },
      accessToken
    );

    expect(response.errors).toBeDefined();
  });

  it('should persist created photo', async () => {
    const photoData = createTestPhoto();

    const createResponse = await graphqlRequest<{
      createPhoto: { id: string };
    }>(CREATE_PHOTO, { photo: photoData }, accessToken);

    assertNoErrors(createResponse);
    const photoId = createResponse.data.createPhoto.id;

    // Fetch the photo to verify persistence
    const fetchResponse = await graphqlRequest<{
      photo: {
        id: string;
        title: string;
      };
    }>(PHOTO, { id: photoId });

    assertNoErrors(fetchResponse);
    expect(fetchResponse.data.photo.id).toBe(photoId);
    expect(fetchResponse.data.photo.title).toBe(photoData.title);
  });
});
