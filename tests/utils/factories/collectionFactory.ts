import { faker } from '@faker-js/faker';

export interface TestCollectionInput {
  title: string;
  description?: string;
  public?: boolean;
}

/**
 * Create test collection data with random values
 */
export function createTestCollection(overrides?: Partial<TestCollectionInput>): TestCollectionInput {
  return {
    title: faker.lorem.words(2),
    description: faker.lorem.sentence(),
    public: faker.datatype.boolean(),
    ...overrides,
  };
}

/**
 * Create multiple test collections
 */
export function createTestCollections(count: number, overrides?: Partial<TestCollectionInput>): TestCollectionInput[] {
  return Array.from({ length: count }, () => createTestCollection(overrides));
}
