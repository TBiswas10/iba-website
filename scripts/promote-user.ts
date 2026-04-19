import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'mukta_44@yahoo.com'
  
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  })
  
  console.log(`Updated user ${email} to role: ${user.role}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
