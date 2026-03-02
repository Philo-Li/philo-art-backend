import { PrismaClient } from '@prisma/client';

const TEST_USER_PREFIX = 'test_e2e_';

export default async function globalTeardown() {
  console.log('\n🧹 Global Teardown: Cleaning up test data...');

  const prisma = new PrismaClient();

  try {
    await prisma.$connect();

    // Clean up test data
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

      console.log(`✅ Cleaned up ${testUsers.length} test users and related data`);
    }
  } catch (error) {
    console.error('❌ Teardown failed:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('✅ Global Teardown complete\n');
}
