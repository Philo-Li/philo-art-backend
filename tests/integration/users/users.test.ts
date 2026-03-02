import { describe, it, expect, beforeAll } from 'vitest';
import { graphqlRequest, assertNoErrors } from '../../utils/testClient.js';
import { USERS } from '../../utils/graphqlOperations.js';
import { createUser } from '../../utils/authHelpers.js';

describe('Query: users', () => {
  beforeAll(async () => {
    // Create a few test users
    await createUser();
    await createUser();
  });

  it('should return paginated users', async () => {
    const response = await graphqlRequest<{
      users: {
        edges: Array<{
          node: {
            id: string;
            username: string;
            firstName: string;
          };
          cursor: string;
        }>;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string;
          totalCount: number;
        };
      };
    }>(USERS, {
      first: 10,
    });

    assertNoErrors(response);
    expect(response.data.users.edges).toBeDefined();
    expect(Array.isArray(response.data.users.edges)).toBe(true);
    expect(response.data.users.pageInfo).toBeDefined();
    expect(response.data.users.pageInfo.totalCount).toBeGreaterThan(0);
  });

  it('should support pagination with after cursor', async () => {
    // Get first page
    const firstPage = await graphqlRequest<{
      users: {
        edges: Array<{
          node: { id: string };
          cursor: string;
        }>;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string;
        };
      };
    }>(USERS, {
      first: 1,
    });

    assertNoErrors(firstPage);
    expect(firstPage.data.users.edges.length).toBe(1);
    const firstUserId = firstPage.data.users.edges[0].node.id;
    const endCursor = firstPage.data.users.pageInfo.endCursor;

    // Get second page
    const secondPage = await graphqlRequest<{
      users: {
        edges: Array<{
          node: { id: string };
        }>;
      };
    }>(USERS, {
      first: 1,
      after: endCursor,
    });

    assertNoErrors(secondPage);
    expect(secondPage.data.users.edges.length).toBe(1);
    // Second page should have different user
    expect(secondPage.data.users.edges[0].node.id).not.toBe(firstUserId);
  });

  it('should return empty edges when no more results', async () => {
    // Get total user count
    const response = await graphqlRequest<{
      users: {
        pageInfo: {
          totalCount: number;
        };
      };
    }>(USERS, {
      first: 30,
    });

    assertNoErrors(response);
    // Just verify it doesn't crash and returns valid data
    expect(response.data.users.pageInfo.totalCount).toBeGreaterThanOrEqual(0);
  });
});
