import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'tirthabiswasm@gmail.com'
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN' },
    create: {
      email,
      name: 'Tirtha Biswas',
      role: 'ADMIN',
    },
  })
  
  console.log(`Upserted user ${email} to role: ${user.role}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
