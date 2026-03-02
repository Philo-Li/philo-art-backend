import { PrismaClient } from '@prisma/client';

const TEST_USER_PREFIX = 'test_e2e_';

export default async function globalSetup() {
  console.log('\n🚀 Global Setup: Preparing test environment...');

  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    // Clean up test data from previous runs
    // Only delete data created by tests (with test_ prefix)
    const testUsers = await prisma.user.findMany({
      where: {
        username: {
          startsWith: TEST_USER_PREFIX,
        },
      },
      select: { id: true },
    });

    if (testUsers.length > 0) {
      const testUserIds = testUsers.map((u) => u.id);

      // Delete in correct order to respect foreign keys
      await prisma.collectionReview.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await prisma.photoReview.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await prisma.follow.deleteMany({
        where: {
          OR: [
            { userId: { in: testUserIds } },
            { followingId: { in: testUserIds } },
          ],
        },
      });
      await prisma.like.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await prisma.collectedPhoto.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await prisma.collection.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await prisma.photo.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await prisma.email.deleteMany({
        where: { userId: { in: testUserIds } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: testUserIds } },
      });

      console.log(`🧹 Cleaned up ${testUsers.length} test users and related data`);
    } else {
      console.log('✅ No test data to clean up');
    }
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }

  console.log('✅ Global Setup complete\n');
}
