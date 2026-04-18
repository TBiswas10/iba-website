import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const cookieStore = await cookies();
  const email = cookieStore.get("userEmail")?.value;

  if (!email) {
    redirect("/membership");
  }

  const dbUser = await prisma.user.findUnique({ where: { email } });
  if (!dbUser) {
    redirect("/membership");
  }
  
  if (dbUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const albums = await prisma.album.findMany({
    include: {
      event: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const items = await prisma.galleryItem.findMany({
    where: { albumId: null },
    orderBy: { createdAt: "desc" },
  });

  const events = await prisma.event.findMany({
    orderBy: { start: "desc" },
  });

  const { GalleryManager } = await import("@/components/gallery-manager");

  return (
    <GalleryManager
      initialAlbums={albums}
      initialItems={items}
      events={events}
    />
  );
}