const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const deleted = await prisma.galleryItem.deleteMany({ where: { albumId: null } });
  console.log('Deleted ' + deleted.count + ' orphaned images.');
  await prisma.$disconnect();
}

run();
