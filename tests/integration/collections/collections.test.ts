import { describe, it, expect, beforeAll } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import { COLLECTIONS, CREATE_COLLECTION } from '../../utils/graphqlOperations.js';
import { createUserAndAuthorize } from '../../utils/authHelpers.js';
import { createTestCollection } from '../../utils/factories/collectionFactory.js';

describe('Query: collections', () => {
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const auth = await createUserAndAuthorize();
    accessToken = auth.accessToken;
    userId = auth.user.id;

    // Create some test collections
    for (let i = 0; i < 3; i++) {
      const collectionData = createTestCollection({
        public: i % 2 === 0, // alternate between public and private
      });
      await graphqlRequest(
        CREATE_COLLECTION,
        { collection: collectionData },
        accessToken
      );
    }
  });

  it('should return paginated collections', async () => {
    const response = await graphqlRequest<{
      collections: {
        edges: Array<{
          node: {
            id: string;
            title: string;
            description: string;
            public: boolean;
          };
          cursor: string;
        }>;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string;
          totalCount: number;
        };
      };
    }>(COLLECTIONS, {
      first: 10,
    });

    assertNoErrors(response);
    expect(response.data.collections.edges).toBeDefined();
    expect(Array.isArray(response.data.collections.edges)).toBe(true);
    expect(response.data.collections.pageInfo.totalCount).toBeGreaterThan(0);
  });

  it('should filter collections by userId', async () => {
    const response = await graphqlRequest<{
      collections: {
        edges: Array<{
          node: { id: string };
        }>;
        pageInfo: {
          totalCount: number;
        };
      };
    }>(COLLECTIONS, {
      first: 10,
      userId,
    });

    assertNoErrors(response);
    expect(response.data.collections.edges.length).toBeGreaterThan(0);
  });

  it('should support pagination', async () => {
    // Get first page
    const firstPage = await graphqlRequest<{
      collections: {
        edges: Array<{
          node: { id: string };
          cursor: string;
        }>;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string;
        };
      };
    }>(COLLECTIONS, {
      first: 1,
      userId,
    });

    assertNoErrors(firstPage);
    expect(firstPage.data.collections.edges.length).toBe(1);

    if (firstPage.data.collections.pageInfo.hasNextPage) {
      const endCursor = firstPage.data.collections.pageInfo.endCursor;
      const firstCollectionId = firstPage.data.collections.edges[0].node.id;

      // Get second page
      const secondPage = await graphqlRequest<{
        collections: {
          edges: Array<{
            node: { id: string };
          }>;
        };
      }>(COLLECTIONS, {
        first: 1,
        userId,
        after: endCursor,
      });

      assertNoErrors(secondPage);
      expect(secondPage.data.collections.edges.length).toBe(1);
      expect(secondPage.data.collections.edges[0].node.id).not.toBe(firstCollectionId);
    }
  });
});
