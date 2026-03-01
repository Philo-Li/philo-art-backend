import { get, last, first } from 'lodash';
import type { PaginationOptions, Connection, Edge } from '../types/pagination.js';

const serializeCursor = (data: unknown[]): string =>
  Buffer.from(JSON.stringify(data)).toString('base64');

const parseCursor = (cursor: string): unknown[] | undefined => {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64').toString('ascii'));
  } catch {
    return undefined;
  }
};

interface PaginationQueryOptions<T> extends PaginationOptions {
  findMany: (args: {
    where?: Record<string, unknown>;
    orderBy: Record<string, string>[];
    take: number;
    cursor?: { id: string };
    skip?: number;
  }) => Promise<T[]>;
  count: (args: { where?: Record<string, unknown> }) => Promise<number>;
  where?: Record<string, unknown>;
}

export const createPaginationQuery = async <T extends { id: string }>(
  options: PaginationQueryOptions<T>
): Promise<Connection<T>> => {
  const {
    first: firstCount = 30,
    after,
    orderDirection = 'desc',
    orderColumn,
    idColumn = 'id',
    findMany,
    count,
    where = {},
  } = options;

  const parsedCursor = after ? parseCursor(after) : undefined;

  const orderBy = [
    { [orderColumn]: orderDirection },
    { [idColumn]: orderDirection },
  ];

  const queryWhere = { ...where };

  if (parsedCursor) {
    const [idValue] = parsedCursor;
    // Use cursor-based pagination
    const cursorRecord = { id: idValue as string };
    const data = await findMany({
      where: queryWhere,
      orderBy,
      take: firstCount + 1,
      cursor: cursorRecord,
      skip: 1,
    });

    const [totalCount] = await Promise.all([count({ where: queryWhere })]);

    const edges: Edge<T>[] = data.slice(0, firstCount).map((d) => ({
      node: d,
      cursor: serializeCursor([
        d[idColumn as keyof T],
        d[orderColumn as keyof T],
      ]),
    }));

    return {
      pageInfo: {
        totalCount,
        hasNextPage: data.length > firstCount,
        endCursor: get(last(edges), 'cursor'),
        startCursor: get(first(edges), 'cursor'),
      },
      edges,
    };
  }

  const [totalCount, data] = await Promise.all([
    count({ where: queryWhere }),
    findMany({
      where: queryWhere,
      orderBy,
      take: firstCount + 1,
    }),
  ]);

  const edges: Edge<T>[] = data.slice(0, firstCount).map((d) => ({
    node: d,
    cursor: serializeCursor([d[idColumn as keyof T], d[orderColumn as keyof T]]),
  }));

  return {
    pageInfo: {
      totalCount,
      hasNextPage: data.length > firstCount,
      endCursor: get(last(edges), 'cursor'),
      startCursor: get(first(edges), 'cursor'),
    },
    edges,
  };
};

export default createPaginationQuery;
