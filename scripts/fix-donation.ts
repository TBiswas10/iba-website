import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.donation.updateMany({
    where: {
      status: 'PENDING',
      amountCents: 99900
    },
    data: {
      status: 'COMPLETED'
    }
  })
  
  console.log(`Updated ${result.count} donation(s) to COMPLETED.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
