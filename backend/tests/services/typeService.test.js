/**
 * @fileoverview
 * Unit tests for the Type Service.
 *
 * @module typeService.test
 *
 * @description
 * Tests all service methods related to types, including:
 *  - createType
 *  - getType(s)
 *  - updateType
 *  - deleteType
 *  - query methods by various parameters
 *
 * Uses Jest and mocks:
 *  - prismaClient to simulate database operations
 *
 * @example
 * // Run all tests for this service
 * // npx jest typeService.test.js
 *
 * @tests
 * - Creating a type with valid/invalid payloads
 * - Fetching types by ID or filters
 * - Updating types
 * - Deleting types
 * - Handling errors thrown by the database client
 */
const typeService = require("../../services/typeService");
const { prisma } = require("../../prisma/prismaClient");

// Mock the prisma methods to isolate service logic
jest.mock("../../prisma/prismaClient", () => ({
  prisma: {
    type: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe("Type Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test suite for creating types
   */
  describe("createType", () => {
    it("should create and return a new type", async () => {
      const mockTypeData = { label: "General", questions: [], projects: [] };
      const mockCreatedType = { typeId: 1, ...mockTypeData };

      prisma.type.create.mockResolvedValue(mockCreatedType);

      const result = await typeService.createType(mockTypeData);

      expect(prisma.type.create).toHaveBeenCalledWith({
        data: {
          label: mockTypeData.label,
          questions: undefined,
          projects: undefined,
        },
        include: { questions: true, projects: true },
      });
      expect(result).toEqual(mockCreatedType);
    });

    it("should create and return a new type with associated question", async () => {
      const mockTypeData = { label: "General", questions: [1], projects: [] };
      const mockCreatedType = { typeId: 1, ...mockTypeData };

      prisma.type.create.mockResolvedValue(mockCreatedType);

      const result = await typeService.createType(mockTypeData);

      expect(prisma.type.create).toHaveBeenCalledWith({
        data: {
          label: mockTypeData.label,
          questions: { connect: [{ questionId: 1 }] },
          projects: undefined,
        },
        include: { questions: true, projects: true },
      });
      expect(result).toEqual(mockCreatedType);
    });

    it("should throw an error if creation fails", async () => {
      const mockTypeData = { label: "General" };
      const mockError = new Error("Database error");

      prisma.type.create.mockRejectedValue(mockError);

      await expect(typeService.createType(mockTypeData)).rejects.toThrow(
        "Database error"
      );

      expect(prisma.type.create).toHaveBeenCalledWith({
        data: mockTypeData,
        include: { questions: true, projects: true },
      });
    });
  });

  /**
   * Test suite for fetching types
   */
  describe("getAllTypes", () => {
    it("should return a list of types", async () => {
      const mockTypes = [
        { typeId: 1, label: "General" },
        { typeId: 2, label: "Test" },
      ];

      prisma.type.findMany.mockResolvedValue(mockTypes);

      const result = await typeService.getAllTypes();

      expect(prisma.type.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockTypes);
    });

    it("should throw an error if fetching fails", async () => {
      const mockError = new Error("Database error");

      prisma.type.findMany.mockRejectedValue(mockError);

      await expect(typeService.getAllTypes()).rejects.toThrow("Database error");

      expect(prisma.type.findMany).toHaveBeenCalled();
    });
  });

  /**
   * Test suite for updating types
   */
  describe("updateType", () => {
    it("should update and return the updated type", async () => {
      const typeId = 1;
      const mockUpdatedData = { label: "Updated label" };
      const mockUpdatedType = { typeId: typeId, ...mockUpdatedData };

      prisma.type.update.mockResolvedValue(mockUpdatedType);

      const result = await typeService.updateType(typeId, mockUpdatedData);

      expect(prisma.type.update).toHaveBeenCalledWith({
        where: { typeId: typeId },
        data: { questions: undefined, projects: undefined },
        include: { questions: true, projects: true },
      });
      expect(result).toEqual(mockUpdatedType);
    });

    it("should update with add/remove an assiociated question and return the updated type", async () => {
      const typeId = 1;
      const mockUpdatedData = { addQuestion: [2], removeQuestion: [1] };
      const mockUpdatedType = { typeId: typeId, ...mockUpdatedData };

      prisma.type.update.mockResolvedValue(mockUpdatedType);

      const result = await typeService.updateType(typeId, mockUpdatedData);

      expect(prisma.type.update).toHaveBeenCalledWith({
        where: { typeId: typeId },
        data: {
          questions: {
            connect: [{ questionId: 2 }],
            disconnect: [{ questionId: 1 }],
          },
          projects: undefined,
        },
        include: { questions: true, projects: true },
      });
      expect(result).toEqual(mockUpdatedType);
    });

    it("should throw an error if the type is not found", async () => {
      const typeId = 999;
      const mockUpdatedData = { label: "Non-existant label" };
      const mockError = new Error("Type not found");
      mockError.code = "P2025";

      prisma.type.update.mockRejectedValue(mockError);

      await expect(
        typeService.updateType(typeId, mockUpdatedData)
      ).rejects.toThrow("Type not found");

      expect(prisma.type.update).toHaveBeenCalledWith({
        where: { typeId: typeId },
        data: { questions: undefined, projects: undefined },
        include: { questions: true, projects: true },
      });
    });

    it("should throw an error if update fails", async () => {
      const typeId = 1;
      const mockUpdatedData = { label: "Failed Update" };
      const mockError = new Error("Database error");

      prisma.type.update.mockRejectedValue(mockError);

      await expect(
        typeService.updateType(typeId, mockUpdatedData)
      ).rejects.toThrow("Database error");

      expect(prisma.type.update).toHaveBeenCalledWith({
        where: { typeId: typeId },
        data: { questions: undefined, projects: undefined },
        include: { questions: true, projects: true },
      });
    });
  });

  /**
   * Test suite for deleting types
   */
  describe("deleteType", () => {
    it("should delete the type", async () => {
      const typeId = 1;

      prisma.type.delete.mockResolvedValue({ typeId: typeId });

      const result = await typeService.deleteType(typeId);

      expect(prisma.type.delete).toHaveBeenCalledWith({
        where: { typeId: typeId },
      });
      expect(result).toEqual({ typeId: typeId });
    });

    it("should throw an error if the type is not found", async () => {
      const typeId = 999;
      const mockError = new Error("Type not found");
      mockError.code = "P2025";

      prisma.type.delete.mockRejectedValue(mockError);

      await expect(typeService.deleteType(typeId)).rejects.toThrow(
        "Type not found"
      );

      expect(prisma.type.delete).toHaveBeenCalledWith({
        where: { typeId: typeId },
      });
    });

    it("should throw an error if deletion fails", async () => {
      const typeId = 1;
      const mockError = new Error("Database error");
      prisma.type.delete.mockRejectedValue(mockError);

      await expect(typeService.deleteType(typeId)).rejects.toThrow(
        "Database error"
      );

      expect(prisma.type.delete).toHaveBeenCalledWith({
        where: { typeId: typeId },
      });
    });
  });

  /**
   * Test suite for fetching types by ID
   */
  describe("getTypeById", () => {
    it("should return the type if found", async () => {
      const typeId = 1;
      const mockType = { label: "General" };

      prisma.type.findUnique.mockResolvedValue(mockType);

      const result = await typeService.getTypeById(typeId);

      expect(prisma.type.findUnique).toHaveBeenCalledWith({
        where: { typeId: typeId },
        include: { questions: true, projects: true },
      });
      expect(result).toEqual(mockType);
    });

    it("should throw an error if the type is not found", async () => {
      prisma.type.findUnique.mockResolvedValue(null);

      await expect(typeService.getTypeById(999)).rejects.toThrow(
        "Type not found"
      );
    });

    it("should throw an error if fetching fails", async () => {
      const typeId = 1;
      const mockError = new Error("Database error");

      prisma.type.findUnique.mockRejectedValue(mockError);

      await expect(typeService.getTypeById(typeId)).rejects.toThrow(
        "Database error"
      );

      expect(prisma.type.findUnique).toHaveBeenCalledWith({
        where: { typeId: typeId },
        include: { questions: true, projects: true },
      });
    });
  });
});
