import { describe, it, expect, beforeAll } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import { LIKES, LIKE_PHOTO, CREATE_PHOTO } from '../../utils/graphqlOperations.js';
import { createUserAndAuthorize } from '../../utils/authHelpers.js';
import { createTestPhoto } from '../../utils/factories/photoFactory.js';

describe('Query: likes', () => {
  let accessToken: string;
  let userId: string;
  let likedPhotoIds: string[] = [];

  beforeAll(async () => {
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;
    userId = auth.user.id;

    // Create and like multiple photos
    for (let i = 0; i < 3; i++) {
      const photoData = createTestPhoto();
      const photoResponse = await graphqlRequest<{
        createPhoto: { id: string };
      }>(CREATE_PHOTO, { photo: photoData }, accessToken);
      assertNoErrors(photoResponse);
      const photoId = photoResponse.data.createPhoto.id;
      likedPhotoIds.push(photoId);

      // Like the photo
      await graphqlRequest(LIKE_PHOTO, { photoId }, accessToken);
    }
  });

  it('should return paginated likes', async () => {
    const response = await graphqlRequest<{
      likes: {
        edges: Array<{
          node: {
            id: string;
            photo: { id: string; title: string };
            user: { id: string; username: string };
          };
          cursor: string;
        }>;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string;
          totalCount: number;
        };
      };
    }>(LIKES, {
      first: 10,
      userId,
    });

    assertNoErrors(response);
    expect(response.data.likes.edges.length).toBeGreaterThanOrEqual(3);
    expect(response.data.likes.pageInfo.totalCount).toBeGreaterThanOrEqual(3);
  });

  it('should filter likes by userId', async () => {
    const response = await graphqlRequest<{
      likes: {
        edges: Array<{
          node: {
            user: { id: string };
          };
        }>;
      };
    }>(LIKES, {
      first: 10,
      userId,
    });

    assertNoErrors(response);
    // All likes should be from the specified user
    for (const edge of response.data.likes.edges) {
      expect(edge.node.user.id).toBe(userId);
    }
  });

  it('should support pagination', async () => {
    // Get first page
    const firstPage = await graphqlRequest<{
      likes: {
        edges: Array<{
          node: { id: string };
          cursor: string;
        }>;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string;
        };
      };
    }>(LIKES, {
      first: 1,
      userId,
    });

    assertNoErrors(firstPage);
    expect(firstPage.data.likes.edges.length).toBe(1);

    if (firstPage.data.likes.pageInfo.hasNextPage) {
      const endCursor = firstPage.data.likes.pageInfo.endCursor;
      const firstLikeId = firstPage.data.likes.edges[0].node.id;

      // Get second page
      const secondPage = await graphqlRequest<{
        likes: {
          edges: Array<{
            node: { id: string };
          }>;
        };
      }>(LIKES, {
        first: 1,
        userId,
        after: endCursor,
      });

      assertNoErrors(secondPage);
      expect(secondPage.data.likes.edges.length).toBe(1);
      expect(secondPage.data.likes.edges[0].node.id).not.toBe(firstLikeId);
    }
  });
});
