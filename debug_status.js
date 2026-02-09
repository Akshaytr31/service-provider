
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const request = await prisma.providerRequest.findFirst({
    orderBy: { createdAt: 'desc' },
  });
  console.log('Provider Request Status:', request.status);
}
main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

