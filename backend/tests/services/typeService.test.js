const typeService = require("../../services/typeService");
const { prisma } = require("../../prisma/prismaClient");
const { checkIdExistence } = require("../../utils/checkIdExistence");

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

jest.mock("../../utils/checkIdExistence", () => ({
  checkIdExistence: jest.fn(),
}));

describe("Type Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createType", () => {
    it("should create and return a new type", async () => {
      const mockTypeData = { label: "General" };
      const mockCreatedType = { typeId: 1, ...mockTypeData };

      prisma.type.create.mockResolvedValue(mockCreatedType);

      const result = await typeService.createType(mockTypeData);

      expect(prisma.type.create).toHaveBeenCalledWith({ data: mockTypeData });
      expect(result).toEqual(mockCreatedType);
    });

    it("should throw an error if creation fails", async () => {
      const mockTypeData = { label: "General" };

      const mockError = new Error("Database error");
      prisma.type.create.mockRejectedValue(mockError);

      await expect(typeService.createType(mockTypeData)).rejects.toThrow(
        "Database error"
      );

      expect(prisma.type.create).toHaveBeenCalledWith({ data: mockTypeData });
    });
  });

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

  describe("updateType", () => {
    it("should update and return the updated type", async () => {
      const typeId = 1;
      const mockUpdatedData = { label: "Updated label" };
      const mockUpdatedType = { typeId: typeId, ...mockUpdatedData };

      // Mock the existence check to pass
      checkIdExistence.mockResolvedValue(true);

      prisma.type.update.mockResolvedValue(mockUpdatedType);

      const result = await typeService.updateType(typeId, mockUpdatedData);

      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.type,
        typeId,
        "Type not found"
      );
      expect(prisma.type.update).toHaveBeenCalledWith({
        where: { typeId: typeId },
        data: mockUpdatedData,
      });
      expect(result).toEqual(mockUpdatedType);
    });

    it("should throw an error if the type does not exist", async () => {
      const typeId = 999;
      const mockUpdatedData = { label: "Non-existant label" };

      // Mock the existence check to fail
      const mockError = new Error("Type not found");
      mockError.status = 404;
      checkIdExistence.mockRejectedValue(mockError);

      await expect(
        typeService.updateType(typeId, mockUpdatedData)
      ).rejects.toThrow("Type not found");

      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.type,
        typeId,
        "Type not found"
      );
      expect(prisma.type.update).not.toHaveBeenCalled();
    });

    it("should throw an error if update fails", async () => {
      const typeId = 1;
      const mockUpdatedData = { label: "Failed Update" };

      // Mock the existence check to pass
      checkIdExistence.mockResolvedValue(true);

      const mockError = new Error("Database error");
      prisma.type.update.mockRejectedValue(mockError);

      await expect(
        typeService.updateType(typeId, mockUpdatedData)
      ).rejects.toThrow("Database error");

      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.type,
        typeId,
        "Type not found"
      );
      expect(prisma.type.update).toHaveBeenCalledWith({
        where: { typeId: typeId },
        data: mockUpdatedData,
      });
    });
  });

  describe("deleteType", () => {
    it("should delete the type", async () => {
      const typeId = 1;

      // Mock the existence check to pass
      checkIdExistence.mockResolvedValue(true);

      prisma.type.delete.mockResolvedValue({ typeId: typeId });

      const result = await typeService.deleteType(typeId);

      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.type,
        typeId,
        "Type not found"
      );
      expect(prisma.type.delete).toHaveBeenCalledWith({
        where: { typeId: typeId },
      });
      expect(result).toEqual({ typeId: typeId });
    });

    it("should throw an error if deletion fails", async () => {
      const typeId = 1;

      // Mock the existence check to pass
      checkIdExistence.mockResolvedValue(true);

      const mockError = new Error("Database error");
      prisma.type.delete.mockRejectedValue(mockError);

      await expect(typeService.deleteType(typeId)).rejects.toThrow(
        "Database error"
      );

      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.type,
        typeId,
        "Type not found"
      );
      expect(prisma.type.delete).toHaveBeenCalledWith({
        where: { typeId: typeId },
      });
    });

    it("should throw an error if the type does not exist", async () => {
      const typeId = 999;

      // Mock the existence check to fail
      const mockError = new Error("Type not found");
      mockError.status = 404;
      checkIdExistence.mockRejectedValue(mockError);

      await expect(typeService.deleteType(typeId)).rejects.toThrow(
        "Type not found"
      );

      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.type,
        typeId,
        "Type not found"
      );
      expect(prisma.type.delete).not.toHaveBeenCalled();
    });
  });

  describe("getTypeById", () => {
    it("should return the type if found", async () => {
      const typeId = 1;
      const mockType = { label: "General" };

      prisma.type.findUnique.mockResolvedValue(mockType);

      const result = await typeService.getTypeById(typeId);

      expect(prisma.type.findUnique).toHaveBeenCalledWith({
        where: { typeId: typeId },
      });
      expect(result).toEqual(mockType);
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
      });
    });

    it("should throw an error if the type is not found", async () => {
      const typeId = 999;

      prisma.type.findUnique.mockResolvedValue(null);

      await expect(typeService.getTypeById(typeId)).rejects.toThrow(
        "Type not found"
      );

      expect(prisma.type.findUnique).toHaveBeenCalledWith({
        where: { typeId: typeId },
      });
    });
  });
});
