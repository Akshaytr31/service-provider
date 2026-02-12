const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Get a test service and its provider
    const service = await prisma.services.findFirst({
      where: { status: "ACTIVE" },
      include: { bookings: true },
    });

    if (!service) {
      console.log("No active services found. Cannot verify.");
      return;
    }

    console.log(`Testing with Service ID: ${service.id} (${service.title})`);

    // 2. Create a conflicting booking
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 5); // 5 days from now
    const dateString = testDate.toISOString().split("T")[0];
    const testTime = "10:00";

    // Ensure no existing booking for this slot (cleanup if needed)
    await prisma.booking.deleteMany({
      where: {
        serviceId: service.id,
        date: new Date(dateString),
        time: testTime,
      },
    });

    // Create a CONFIRMED booking
    const user = await prisma.users.findFirst();

    // We need to fetch providerEmail from service first to get provider ID, or use user.id if not found
    // The previous code had complex nested await which is fine but maybe overkill for script
    const serviceDetails = await prisma.services.findUnique({
      where: { id: service.id },
      select: { providerEmail: true },
    });

    let providerId = user.id;
    if (serviceDetails && serviceDetails.providerEmail) {
      const provider = await prisma.users.findUnique({
        where: { email: serviceDetails.providerEmail },
      });
      if (provider) providerId = provider.id;
    }

    const booking = await prisma.booking.create({
      data: {
        seekerId: user.id,
        providerId: providerId,
        serviceId: service.id,
        date: new Date(dateString),
        time: testTime,
        status: "CONFIRMED",
      },
    });

    console.log(`Created CONFIRMED booking for ${dateString} at ${testTime}`);

    // 3. Test Filter: Service should be EXCLUDED
    // UPDATED: Using correct column name `service_id` for raw query

    const queryExcluded = `
      SELECT * FROM services 
      WHERE status = 'ACTIVE' 
      AND id NOT IN (
          SELECT service_id FROM bookings 
          WHERE DATE(date) = ? AND time = ? AND status = 'CONFIRMED'
      )
      AND id = ?
    `;

    // Using dateString directly to match API logic
    const resultExcluded = await prisma.$queryRawUnsafe(
      queryExcluded,
      dateString,
      testTime,
      service.id,
    );

    if (resultExcluded.length === 0) {
      console.log(
        "PASS: Service is correctly EXCLUDED when filtered by booked time.",
      );
    } else {
      console.error("FAIL: Service is VISIBLE despite confirmed booking!");
    }

    // 4. Test Filter: Service should be INCLUDED for different time
    const otherTime = "11:00";
    const queryIncluded = `
      SELECT * FROM services 
      WHERE status = 'ACTIVE' 
      AND id NOT IN (
          SELECT service_id FROM bookings 
          WHERE DATE(date) = ? AND time = ? AND status = 'CONFIRMED'
      )
      AND id = ?
    `;

    const resultIncluded = await prisma.$queryRawUnsafe(
      queryIncluded,
      dateString,
      otherTime,
      service.id,
    );

    if (resultIncluded.length > 0) {
      console.log("PASS: Service is correctly INCLUDED for a different time.");
    } else {
      console.error("FAIL: Service is HIDDEN for available time!");
    }

    // Cleanup
    await prisma.booking.delete({ where: { id: booking.id } });
    console.log("Cleanup complete.");
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
