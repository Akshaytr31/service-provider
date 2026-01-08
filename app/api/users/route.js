import { prisma } from "@/lib/prisma";

// GET all users
export async function GET() {
  const users = await prisma.user.findMany();
  return Response.json(users);
}

// CREATE user
export async function POST(req) {
  const { name, email } = await req.json();

  const user = await prisma.user.create({
    data: { name, email },
  });

  return Response.json(user);
}
