import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";
import { uploadImageToStorage } from "@/lib/storage";

function parseLocalDateTime(value: string): Date {
  if (value.includes("T") && !value.includes("Z")) {
    const [datePart, timePart] = value.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute);
  }
  return new Date(value);
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const events = await prisma.event.findMany({
      orderBy: { start: "desc" },
      take: 50,
    });
    return NextResponse.json({ ok: true, data: events });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const action = formData.get("action") as string;
      
      if (action === "upload-event-image") {
        const file = formData.get("file") as File;
        
        if (!file) {
          return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
        }
        
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = file.name;
        const mimeType = file.type || "image/jpeg";
        
        const mediaUrl = await uploadImageToStorage(buffer, fileName, mimeType);
        
        return NextResponse.json({ ok: true, url: mediaUrl });
      }
    }
    
    const body = await request.json();
    const { title, slug, start, end, location, description, imageUrl } = body;

    if (!title || !start || !end) {
      return NextResponse.json({ ok: false, error: "Title, start, and end are required" }, { status: 400 });
    }

    const slugFinal = slug 
      ? slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const event = await prisma.event.create({
      data: {
        title,
        slug: slugFinal,
        start: parseLocalDateTime(start),
        end: parseLocalDateTime(end),
        location: location || "",
        description: description || "",
        imageUrl: imageUrl || "",
      },
    });

    return NextResponse.json({ ok: true, data: event });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ ok: false, error: "Failed to create event" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { id, title, slug, start, end, location, description, imageUrl } = body;

    if (!id || !title || !start || !end) {
      return NextResponse.json({ ok: false, error: "ID, title, start, and end are required" }, { status: 400 });
    }

    const slugFinal = slug 
      ? slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const event = await prisma.event.update({
      where: { id: Number(id) },
      data: {
        title,
        slug: slugFinal,
        start: parseLocalDateTime(start),
        end: parseLocalDateTime(end),
        location: location || "",
        description: description || "",
        imageUrl: imageUrl || "",
      },
    });

    return NextResponse.json({ ok: true, data: event });
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json({ ok: false, error: "Failed to update event" }, { status: 500 });
  }
}