import { faker } from '@faker-js/faker';

export interface TestPhotoInput {
  photoId?: string;
  title: string;
  year: number;
  description?: string;
  imageUrl: string;
  srcYoutube?: string;
  license?: string;
  type?: string;
  status?: string;
  allowDownload: boolean;
}

/**
 * Create test photo data with random values
 */
export function createTestPhoto(overrides?: Partial<TestPhotoInput>): TestPhotoInput {
  const photoId = faker.string.nanoid(10);

  return {
    photoId,
    title: faker.lorem.words(3),
    year: faker.number.int({ min: 1900, max: 2024 }),
    description: faker.lorem.sentence(),
    // Use a placeholder image URL that follows the expected format
    imageUrl: `https://media.philoart.io/test/${photoId}.jpg`,
    license: faker.helpers.arrayElement(['CC0', 'CC-BY', 'CC-BY-SA', 'All Rights Reserved']),
    type: faker.helpers.arrayElement(['Photograph', 'Painting', 'Digital Art', 'Drawing']),
    status: 'published',
    allowDownload: faker.datatype.boolean(),
    ...overrides,
  };
}

/**
 * Create multiple test photos
 */
export function createTestPhotos(count: number, overrides?: Partial<TestPhotoInput>): TestPhotoInput[] {
  return Array.from({ length: count }, () => createTestPhoto(overrides));
}
