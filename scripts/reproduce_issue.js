const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Setting up test scenario based on user data...");

    // 1. Create a Provider and Seeker
    const provider = await prisma.users.create({
      data: {
        email: `provider_test_${Date.now()}@test.com`,
        role: "provider",
      },
    });

    const seeker = await prisma.users.create({
      data: {
        email: `seeker_test_${Date.now()}@test.com`,
        role: "seeker",
      },
    });

    // 2. Create Service A (Pending Booking Scenario) - Mimics Service 17
    const serviceA = await prisma.services.create({
      data: {
        providerEmail: provider.email, // Using dummy provider
        title: "Service A (Pending)",
        description: "Test",
        subCategoryId: 1, // Assumes SubCategory 1 exists, usually mostly true or will fail
        status: "ACTIVE",
      },
    });

    // 3. Create Service B (Confirmed Booking Scenario) - Mimics Service 19
    const serviceB = await prisma.services.create({
      data: {
        providerEmail: provider.email,
        title: "Service B (Confirmed)",
        description: "Test",
        subCategoryId: 1,
        status: "ACTIVE",
      },
    });

    // 4. Create Bookings matching user data
    // User Row 1: '2026-02-13 00:00:00.000', '09:00', 'PENDING' -> Service A
    await prisma.booking.create({
      data: {
        seekerId: seeker.id,
        providerId: provider.id,
        serviceId: serviceA.id,
        date: new Date("2026-02-13"),
        time: "09:00",
        status: "PENDING",
      },
    });

    // User Row 2: '2026-02-13 00:00:00.000', '09:00', 'CONFIRMED' -> Service B
    await prisma.booking.create({
      data: {
        seekerId: seeker.id,
        providerId: provider.id,
        serviceId: serviceB.id,
        date: new Date("2026-02-13"),
        time: "09:00",
        status: "CONFIRMED",
      },
    });

    console.log("Test Data Created.");

    // 5. Run Verification Query
    const dateFilter = "2026-02-13";
    const timeFilter = "09:00";

    console.log(`\nFiltering for Date: ${dateFilter}, Time: ${timeFilter}`);
    console.log(
      "Expectation: Service A (Pending) VISIBLE, Service B (Confirmed) HIDDEN",
    );

    const query = `
      SELECT * FROM services 
      WHERE status = 'ACTIVE' 
      AND id NOT IN (
          SELECT service_id FROM bookings 
          WHERE DATE(date) = ? AND time = ? AND status = 'CONFIRMED'
      )
      AND id IN (?, ?)
    `;

    const results = await prisma.$queryRawUnsafe(
      query,
      dateFilter,
      timeFilter,
      serviceA.id,
      serviceB.id,
    );

    const visibleIds = results.map((s) => s.id);
    console.log("\nVisible Services:", visibleIds);

    let pass = true;
    if (visibleIds.includes(serviceA.id)) {
      console.log(`PASS: Service A (Pending) is VISIBLE.`);
    } else {
      console.log(`FAIL: Service A (Pending) is HIDDEN.`);
      pass = false;
    }

    if (!visibleIds.includes(serviceB.id)) {
      console.log(`PASS: Service B (Confirmed) is HIDDEN.`);
    } else {
      console.log(`FAIL: Service B (Confirmed) is VISIBLE.`);
      pass = false;
    }

    // Cleanup
    await prisma.booking.deleteMany({ where: { seekerId: seeker.id } });
    await prisma.services.deleteMany({
      where: { id: { in: [serviceA.id, serviceB.id] } },
    });
    await prisma.users.deleteMany({
      where: { id: { in: [provider.id, seeker.id] } },
    });
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
