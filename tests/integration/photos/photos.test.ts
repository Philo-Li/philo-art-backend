import { describe, it, expect, beforeAll } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import { PHOTOS, CREATE_PHOTO } from '../../utils/graphqlOperations.js';
import { createUserAndAuthorize } from '../../utils/authHelpers.js';
import { createTestPhoto } from '../../utils/factories/photoFactory.js';

describe('Query: photos', () => {
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;
    userId = auth.user.id;

    // Create some test photos
    for (let i = 0; i < 3; i++) {
      const photoData = createTestPhoto({
        type: i === 0 ? 'Photograph' : 'Painting',
      });
      await graphqlRequest(
        CREATE_PHOTO,
        { photo: photoData },
        accessToken
      );
    }
  });

  it('should return paginated photos', async () => {
    const response = await graphqlRequest<{
      photos: {
        edges: Array<{
          node: {
            id: string;
            title: string;
            year: number;
          };
          cursor: string;
        }>;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string;
          totalCount: number;
        };
      };
    }>(PHOTOS, {
      first: 10,
    });

    assertNoErrors(response);
    expect(response.data.photos.edges).toBeDefined();
    expect(Array.isArray(response.data.photos.edges)).toBe(true);
    expect(response.data.photos.pageInfo.totalCount).toBeGreaterThan(0);
  });

  it('should filter photos by userId', async () => {
    const response = await graphqlRequest<{
      photos: {
        edges: Array<{
          node: { id: string };
        }>;
        pageInfo: {
          totalCount: number;
        };
      };
    }>(PHOTOS, {
      first: 10,
      userId,
    });

    assertNoErrors(response);
    expect(response.data.photos.edges.length).toBeGreaterThan(0);
  });

  it('should filter photos by searchKeyword (type)', async () => {
    const response = await graphqlRequest<{
      photos: {
        edges: Array<{
          node: {
            id: string;
            type: string;
          };
        }>;
      };
    }>(PHOTOS, {
      first: 10,
      searchKeyword: 'Photograph',
    });

    assertNoErrors(response);
    // All returned photos should be of type Photograph
    for (const edge of response.data.photos.edges) {
      if (edge.node.type) {
        expect(edge.node.type).toBe('Photograph');
      }
    }
  });

  it('should support pagination with after cursor', async () => {
    // Get first page
    const firstPage = await graphqlRequest<{
      photos: {
        edges: Array<{
          node: { id: string };
          cursor: string;
        }>;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string;
        };
      };
    }>(PHOTOS, {
      first: 1,
    });

    assertNoErrors(firstPage);

    if (firstPage.data.photos.pageInfo.hasNextPage) {
      const endCursor = firstPage.data.photos.pageInfo.endCursor;
      const firstPhotoId = firstPage.data.photos.edges[0].node.id;

      // Get second page
      const secondPage = await graphqlRequest<{
        photos: {
          edges: Array<{
            node: { id: string };
          }>;
        };
      }>(PHOTOS, {
        first: 1,
        after: endCursor,
      });

      assertNoErrors(secondPage);
      expect(secondPage.data.photos.edges.length).toBe(1);
      expect(secondPage.data.photos.edges[0].node.id).not.toBe(firstPhotoId);
    }
  });
});
