const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Get a test service
    const service = await prisma.services.findFirst({
      where: { status: "ACTIVE" },
    });

    if (!service) {
      console.log("No active services found.");
      return;
    }

    console.log(`Testing with Service ID: ${service.id}`);

    // 2. Create Confirmed Booking
    const strDate = "2026-03-01";
    const strTime = "10:00";

    // Cleanup
    await prisma.booking.deleteMany({
      where: { serviceId: service.id, date: new Date(strDate), time: strTime },
    });

    const user = await prisma.users.findFirst();

    // Create Booking
    const booking = await prisma.booking.create({
      data: {
        seekerId: user.id,
        providerId: user.id, // simplified
        serviceId: service.id,
        date: new Date(strDate),
        time: strTime,
        status: "CONFIRMED",
      },
    });

    console.log(`Created Booking: ${strDate} ${strTime}`);

    // 3. Test Availability Query (Simulating /api/availability)
    // Query: SELECT serviceId FROM bookings WHERE DATE(date) = ? AND time = ? AND status = 'CONFIRMED'

    const query = `
      SELECT service_id, status FROM bookings 
      WHERE DATE(date) = ? AND time = ? AND status = 'CONFIRMED'
    `;

    const results = await prisma.$queryRawUnsafe(query, strDate, strTime);
    console.log("Availability API Simulation Result:", results);

    const match = results.find((r) => r.service_id === service.id);

    if (match) {
      console.log(
        "PASS: Availability query correctly returned the service ID (to be filtered out).",
      );
    } else {
      console.error("FAIL: Availability query did NOT return the service ID.");
    }

    // Cleanup
    await prisma.booking.delete({ where: { id: booking.id } });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
