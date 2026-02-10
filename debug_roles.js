const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.users.groupBy({
    by: ["role"],
  });
  console.log("Distinct Roles:", roles);

  const policies = await prisma.privacyPolicy.findMany();
  console.log("Privacy Policies:", policies);

  // Also check distinct user types if role is not enough
  // const userTypes = await prisma.providerRequests.groupBy({ by: ['userType'] });
  // console.log('Provider Request Types:', userTypes);
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
