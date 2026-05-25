import { prisma } from "../src/lib/prisma";

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "tirthabiswasm@gmail.com" },
    update: {
      role: "ADMIN",
    },
    create: {
      email: "tirthabiswasm@gmail.com",
      name: "IBA Admin",
      role: "ADMIN",
    },
  });

  console.log("Admin created:", admin.email, admin.role);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
