import { fail, ok } from "@/lib/api";

const allowed = new Set(["en", "bn"]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const locale = String(body?.locale || "").toLowerCase();

    if (!allowed.has(locale)) {
      return fail("Unsupported locale", 400);
    }

    const response = ok({ locale });
    response.cookies.set("NEXT_LOCALE", locale, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    return fail("Failed to update locale", 500, error);
  }
}