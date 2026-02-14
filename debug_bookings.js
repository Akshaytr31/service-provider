const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const userEmail = "seeker3@gmail.com"; // using the email from previous logs
    const user = await prisma.users.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.log("User not found");
      return;
    }

    console.log("Found user:", user.id);

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [{ seekerId: user.id }, { providerId: user.id }],
      },
      include: {
        seeker: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            mobile: true,
          },
        },
        provider: {
          select: { name: true, email: true, id: true, image: true },
        },
        service: { select: { title: true, price: true } },
        review: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("Bookings fetched successfully:", bookings.length);
  } catch (e) {
    console.error("Error fetching bookings:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
