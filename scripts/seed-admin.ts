import { hash } from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const passwordHash = await hash("IBAAdmin2024!", 12);
  
  const admin = await prisma.user.upsert({
    where: { email: "tirthabiswasm@gmail.com" },
    update: {
      role: "ADMIN",
      passwordHash,
    },
    create: {
      email: "tirthabiswasm@gmail.com",
      name: "IBA Admin",
      role: "ADMIN",
      passwordHash,
    },
  });

  console.log("Admin created:", admin.email, admin.role);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());