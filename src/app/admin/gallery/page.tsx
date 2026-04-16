import Image from "next/image";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function createGalleryItem(formData: FormData) {
  "use server";
  const cookieStore = await cookies();
  const email = cookieStore.get("userEmail")?.value;

  if (!email) return;

  const dbUser = await prisma.user.findUnique({ where: { email } });
  if (!dbUser || dbUser.role !== "ADMIN") return;

  const title = String(formData.get("title"));
  const description = String(formData.get("description") || "");
  const mediaUrl = String(formData.get("mediaUrl"));
  const mediaType = String(formData.get("mediaType") || "image");

  await prisma.galleryItem.create({
    data: { title, description, mediaUrl, mediaType },
  });
  
  revalidatePath("/admin/gallery");
}

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

  const items = await prisma.galleryItem.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <section className="panel-stack">
      <section className="glass-panel">
        <h1>Gallery</h1>
        <p>Manage photos and videos.</p>
      </section>

      <section className="glass-panel">
        <h2>Add Item</h2>
        <form action={createGalleryItem} className="grid-form">
          <label>
            Title
            <input required name="title" placeholder="Photo title" />
          </label>
          <label>
            Media Type
            <select name="mediaType">
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </label>
          <label className="span-2">
            Description
            <textarea name="description" rows={2} placeholder="Optional description" />
          </label>
          <label className="span-2">
            Media URL
            <input required name="mediaUrl" placeholder="https://..." />
          </label>
          <div className="span-2 button-row">
            <button className="btn-primary" type="submit">
              Add to Gallery
            </button>
          </div>
        </form>
      </section>

      <section className="glass-panel">
        <h2>Gallery Items</h2>
        {items.length === 0 ? (
          <p>No gallery items yet.</p>
        ) : (
          <div className="gallery-grid">
            {items.map((item) => (
              <article key={item.id} className="gallery-item-admin">
                {item.mediaType === "image" ? (
                  <Image src={item.mediaUrl} alt={item.title} width={200} height={150} />
                ) : (
                  <video src={item.mediaUrl} />
                )}
                <div className="gallery-item-info">
                  <h3>{item.title}</h3>
                  <p>{item.description || "—"}</p>
                </div>
                <form action={`/api/admin/gallery/${item.id}/delete`} method="POST">
                  <button className="btn-danger" type="submit">
                    Delete
                  </button>
                </form>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
