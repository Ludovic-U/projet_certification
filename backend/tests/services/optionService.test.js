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

  /**
   * Test suite for updating options
   */
  describe("updateOption", () => {
    it("should update and return the updated option", async () => {
      const optionId = 1;
      const mockUpdateData = { label: "Updated Opt", questionId: 1 };
      const mockUpdatedOption = { optionId: optionId, ...mockUpdateData };

      // Mock the existence check to pass
      checkIdExistence.mockResolvedValue(true);

      prisma.option.update.mockResolvedValue(mockUpdatedOption);

      const result = await optionService.updateOption(optionId, mockUpdateData);

      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.option,
        optionId,
        "Option not found"
      );
      expect(prisma.option.update).toHaveBeenCalledWith({
        where: { optionId: optionId },
        data: mockUpdateData,
      });
      expect(result).toEqual(mockUpdatedOption);
    });

    it("should throw an error if the update fails", async () => {
      const optionId = 1;
      const mockUpdateData = { label: "Failed update", questionId: 1 };

      // Mock the existence check to pass
      checkIdExistence.mockResolvedValue(true);

      const mockError = new Error("Database error");

      prisma.option.update.mockRejectedValue(mockError);

      await expect(
        optionService.updateOption(optionId, mockUpdateData)
      ).rejects.toThrow("Database error");
      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.option,
        optionId,
        "Option not found"
      );
      expect(prisma.option.update).toHaveBeenCalledWith({
        where: { optionId: optionId },
        data: mockUpdateData,
      });
    });

    it("should throw an error if the option does not exist", async () => {
      const optionId = 999;
      const mockUpdateData = { label: "Non-existent Opt", questionId: 1 };

      // Mock the existence check to fail
      const mockError = new Error("Option not found");
      mockError.status = 404;
      checkIdExistence.mockRejectedValue(mockError);

      await expect(
        optionService.updateOption(optionId, mockUpdateData)
      ).rejects.toThrow("Option not found");
      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.option,
        optionId,
        "Option not found"
      );
      expect(prisma.option.update).not.toHaveBeenCalled();
    });
  });
});
