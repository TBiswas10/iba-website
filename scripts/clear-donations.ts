import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.donation.deleteMany({})
  console.log(`Deleted ${result.count} donation records.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
