import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Event";
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const location = searchParams.get("location") || "";
  const description = searchParams.get("description") || "";

  if (!start || !end) {
    return NextResponse.json({ error: "Missing start or end date" }, { status: 400 });
  }

  const formatDate = (date: string) => new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const desc = description.replace(/[\n\r]/g, "\\n");

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//IBA//Events//EN
BEGIN:VEVENT
UID:${title.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}@iba.org
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${title}
DESCRIPTION:${desc}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

  const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".ics";

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}