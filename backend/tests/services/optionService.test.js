/**
 * @fileoverview
 * Unit tests for the Option Service.
 * Covers CRUD operations and query methods for options.
 * Uses Jest and mocks the prismaClient and checkIdExistence function.
 */

const optionService = require("../../services/optionService");
const { prisma } = require("../../prisma/prismaClient");
const { checkIdExistence } = require("../../utils/checkIdExistence");

// Mock the prisma methods to isolate service logic
jest.mock("../../prisma/prismaClient", () => ({
  prisma: {
    option: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

// Mock checkIdExistence function to control test scenarios
jest.mock("../../utils/checkIdExistence", () => ({
  checkIdExistence: jest.fn(),
}));

describe("Option Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test suite for creating options
   */
  describe("createOption", () => {
    it("should create and return a new option", async () => {
      const mockOptionData = { label: "Opt1", questionId: 1 };
      const mockCreatedOption = { optionId: 1, ...mockOptionData };

      prisma.option.create.mockResolvedValue(mockCreatedOption);

      const result = await optionService.createOption(mockOptionData);

      expect(prisma.option.create).toHaveBeenCalledWith({
        data: mockOptionData,
      });
      expect(result).toEqual(mockCreatedOption);
    });

    it("should throw an error if creation fails", async () => {
      const mockOptionData = { label: "Opt1", questionId: 1 };

      const mockError = new Error("Database error");
      prisma.option.create.mockRejectedValue(mockError);

      await expect(optionService.createOption(mockOptionData)).rejects.toThrow(
        "Database error"
      );
      expect(prisma.option.create).toHaveBeenCalledWith({
        data: mockOptionData,
      });
    });
  });
});
