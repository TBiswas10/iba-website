import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";
import { resourceSchema } from "@/lib/validators";

export async function GET() {
  const resources = await prisma.resource.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return ok(resources);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) {
    return denied;
  }

  try {
    const body = await request.json();
    const parsed = resourceSchema.safeParse(body);

    if (!parsed.success) {
      return fail("Invalid resource payload", 400, parsed.error.flatten());
    }

    const resource = await prisma.resource.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        url: parsed.data.url,
      },
    });

    return ok(resource, 201);
  } catch (error) {
    return fail("Error creating resource", 500, error);
  }
}
