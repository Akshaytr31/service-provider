const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Fetch the most recent provider request
  const request = await prisma.providerRequest.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!request) {
    console.log("No provider request found.");
    return;
  }

  console.log("Provider Request ID:", request.id);
  console.log("User ID:", request.userId);
  console.log("Category ID:", request.categoryId);
  console.log("SubCategory ID:", request.subCategoryId);
  console.log(
    "Services Offered:",
    JSON.stringify(request.servicesOffered, null, 2),
  );
  console.log("Licenses:", JSON.stringify(request.licenses, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
