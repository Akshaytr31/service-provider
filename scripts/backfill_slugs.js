const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const users = await prisma.users.findMany({
    where: { slug: null },
  });

  console.log(`Found ${users.length} users without slugs.`);

  for (const user of users) {
    let baseSlug = generateSlug(user.name || "user");
    if (!baseSlug) baseSlug = `user-${user.id}`;

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.users.findUnique({
        where: { slug },
      });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    await prisma.users.update({
      where: { id: user.id },
      data: { slug },
    });
    console.log(`Updated user ${user.id} with slug: ${slug}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
