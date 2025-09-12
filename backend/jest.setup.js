const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env.test") });

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const { PrismaClient } = require("@prisma/client");

// Safety check
if (!process.env.DATABASE_URL?.includes("test")) {
  throw new Error("DATABASE_URL does not point to a test DB. Aborting tests!");
}

const prisma = new PrismaClient();

beforeAll(async () => {
  return prisma.$connect();
});

// Clean questions table after each test
afterEach(async () => {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Question" RESTART IDENTITY CASCADE;`
  );
});

// Disconnect after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Make prisma available in tests
global.prisma = prisma;
