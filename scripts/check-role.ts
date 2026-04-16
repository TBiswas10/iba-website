import { prisma } from "../src/lib/prisma";

async function checkRole() {
  const email = "tirthabiswasm@gmail.com";
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.log(`User: ${user?.email}, Role: ${user?.role}`);
  } catch (error) {
    console.error("Check failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRole();
