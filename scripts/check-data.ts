import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const userCount = await prisma.user.count()
  const eventCount = await prisma.event.count()
  const membershipCount = await prisma.membership.count()
  const rsvpCount = await prisma.rsvp.count()
  
  console.log('Database Stats:')
  console.log(`- Users: ${userCount}`)
  console.log(`- Events: ${eventCount}`)
  console.log(`- Memberships: ${membershipCount}`)
  console.log(`- RSVPs: ${rsvpCount}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
