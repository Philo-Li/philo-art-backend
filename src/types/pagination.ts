export interface PageInfo {
  totalCount: number;
  hasNextPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface Edge<T> {
  node: T;
  cursor: string;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
}

export interface PaginationOptions {
  first?: number;
  after?: string;
  orderColumn: string;
  orderDirection?: 'asc' | 'desc';
  idColumn?: string;
}
