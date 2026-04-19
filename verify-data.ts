import { prisma } from "./src/lib/prisma";

async function main() {
  const albums = await prisma.album.findMany({
    include: { items: true },
  });

  for (const album of albums) {
    console.log(`Album: ${album.title} (ID: ${album.id})`);
    console.log(`- Reported items length: ${album.items.length}`);
    
    const actualItems = await prisma.galleryItem.findMany({
      where: { albumId: album.id }
    });
    console.log(`- Actual items in DB for this album: ${actualItems.length}`);
    
    if (album.items.length !== actualItems.length) {
      console.log(`!!! MISMATCH DETECTED !!!`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
