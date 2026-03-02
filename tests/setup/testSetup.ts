import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { getTestServer, closeTestServer } from '../utils/testClient.js';

// Increase timeout for all tests
beforeAll(async () => {
  // Initialize test server
  await getTestServer();
}, 30000);

afterAll(async () => {
  // Close test server
  await closeTestServer();
}, 10000);

// Optional: Reset state before each test if needed
beforeEach(async () => {
  // Add any per-test setup here
});

afterEach(async () => {
  // Add any per-test cleanup here
});
