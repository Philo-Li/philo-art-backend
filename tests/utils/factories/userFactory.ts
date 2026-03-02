import { faker } from '@faker-js/faker';

const TEST_USER_PREFIX = 'test_e2e_';

export interface TestUserInput {
  username: string;
  password: string;
  firstName: string;
  lastName?: string;
  email: string;
}

/**
 * Create test user data with random values
 * All test usernames start with 'test_e2e_' for easy cleanup
 */
export function createTestUser(overrides?: Partial<TestUserInput>): TestUserInput {
  const uniqueSuffix = faker.string.alphanumeric(8).toLowerCase();

  return {
    username: `${TEST_USER_PREFIX}${uniqueSuffix}`,
    password: faker.internet.password({ length: 12, memorable: false }),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: `test_${uniqueSuffix}@example.com`,
    ...overrides,
  };
}

/**
 * Create multiple test users
 */
export function createTestUsers(count: number, overrides?: Partial<TestUserInput>): TestUserInput[] {
  return Array.from({ length: count }, () => createTestUser(overrides));
}
