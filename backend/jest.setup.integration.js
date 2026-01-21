const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env.test") });

// Safety check
if (!process.env.DATABASE_URL?.includes("test")) {
  throw new Error("DATABASE_URL does not point to a test DB. Aborting tests!");
}

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

beforeAll(async () => {
  return prisma.$connect();
});

// Clean before each Test suite
beforeEach(async () => {
  const tables = [
    "Question",
    "Response",
    "Type",
    "Option",
    "Client",
    "User",
    "Project",
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`
    );
  }
});

// Clean all tables after each test
afterEach(async () => {
  const tables = [
    "Question",
    "Response",
    "Type",
    "Option",
    "Client",
    "User",
    "Project",
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`
    );
  }
});

// Disconnect after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Make prisma available in tests
global.prisma = prisma;
