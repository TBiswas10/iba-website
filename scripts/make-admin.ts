import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'tirthabiswasm@gmail.com'
  
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  })
  
  console.log(`Updated user ${email} to role: ${user.role}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
