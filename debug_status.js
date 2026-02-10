const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const policy = await prisma.privacyPolicy.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  if (!policy) {
    console.log("No policy found");
    return;
  }
  const policyUpdatedAt = new Date(policy.updatedAt);
  console.log("Policy Updated At:", policyUpdatedAt);

  const users = await prisma.users.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      privacyPolicyAcceptedAt: true,
    },
    where: {
      role: {
        in: ["provider", "seeker"],
      },
    },
  });

  console.log("Users Found:", users.length);

  const providers = [];
  const seekers = [];

  users.forEach((user) => {
    const acceptedAt = user.privacyPolicyAcceptedAt
      ? new Date(user.privacyPolicyAcceptedAt)
      : null;

    const isAccepted = acceptedAt && acceptedAt >= policyUpdatedAt;

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAccepted,
      acceptedAt: user.privacyPolicyAcceptedAt,
    };

    if (user.role === "provider") {
      providers.push(userData);
    } else if (user.role === "seeker") {
      seekers.push(userData);
    }
  });

  console.log("Providers:", providers);
  console.log("Seekers:", seekers);
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
