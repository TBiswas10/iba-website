import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.email) {
    redirect("/membership");
  }

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser) {
    redirect("/membership");
  }

  if (dbUser.role !== "ADMIN") {
    redirect("/membership");
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
