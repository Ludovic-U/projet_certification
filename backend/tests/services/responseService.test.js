const responseService = require("../../services/responseService");
const { prisma } = require("../../prisma/prismaClient");
const { checkIdExistence } = require("../../utils/checkIdExistence");

jest.mock("../../prisma/prismaClient", () => ({
  prisma: {
    response: {
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

describe("Response Service - createResponse", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create and return a new response", async () => {
    const mockResponseData = {
      label: "Response test",
      projectId: 1,
      questionId: 1,
      optionId: null,
      responseIdParent: null,
    };

    const mockCreatedResponse = {
      responseId: 1,
      ...mockResponseData,
    };

    prisma.response.create.mockResolvedValue(mockCreatedResponse);

    const result = await responseService.createResponse(mockResponseData);

    expect(prisma.response.create).toHaveBeenCalledWith({
      data: mockResponseData,
    });
    expect(result).toEqual(mockCreatedResponse);
  });

  it("should throw an error if creation fails", async () => {
    const mockResponseData = {
      label: "Response test",
      projectId: 1,
      questionId: 1,
      optionId: null,
      responseIdParent: null,
    };

    const mockError = new Error("Database error");
    prisma.response.create.mockRejectedValue(mockError);

    await expect(
      responseService.createResponse(mockResponseData)
    ).rejects.toThrow("Database error");
    expect(prisma.response.create).toHaveBeenCalledWith({
      data: mockResponseData,
    });
  });
});

describe("Response Service - updateResponse", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should update and return the updated response", async () => {
    const responseId = 1;
    const mockUpdateData = {
      label: "Updated Response",
      projectId: 1,
      questionId: 1,
      optionId: null,
      responseIdParent: null,
    };
    const mockUpdatedResponse = {
      responseId: responseId,
      ...mockUpdateData,
    };

    // Mock the existence check to pass
    checkIdExistence.mockResolvedValue(true);

    prisma.response.update.mockResolvedValue(mockUpdatedResponse);

    const result = await responseService.updateResponse(
      responseId,
      mockUpdateData
    );

    expect(checkIdExistence).toHaveBeenCalledWith(
      prisma.response,
      responseId,
      "Response not found"
    );
    expect(prisma.response.update).toHaveBeenCalledWith({
      where: { responseId: responseId },
      data: mockUpdateData,
    });
    expect(result).toEqual(mockUpdatedResponse);
  });

  it("should throw an error if the response does not exist", async () => {
    const responseId = 999;
    const mockUpdateData = {
      label: "Non-existent Response",
      projectId: 1,
      questionId: 1,
      optionId: null,
      responseIdParent: null,
    };

    // Mock the existence check to fail
    const mockError = new Error("Response not found");
    mockError.status = 404;
    checkIdExistence.mockRejectedValue(mockError);

    await expect(
      responseService.updateResponse(responseId, mockUpdateData)
    ).rejects.toThrow("Response not found");

    expect(checkIdExistence).toHaveBeenCalledWith(
      prisma.response,
      responseId,
      "Response not found"
    );
    expect(prisma.response.update).not.toHaveBeenCalled();
  });

  it("should throw an error if update fails", async () => {
    const responseId = 1;
    const mockUpdateData = {
      label: "Failed update",
      projectId: 1,
      questionId: 1,
      optionId: null,
      responseIdParent: null,
    };

    // Mock the existence check to pass
    checkIdExistence.mockResolvedValue(true);

    const mockError = new Error("Database error");
    prisma.response.update.mockRejectedValue(mockError);

    await expect(
      responseService.updateResponse(responseId, mockUpdateData)
    ).rejects.toThrow("Database error");

    expect(checkIdExistence).toHaveBeenCalledWith(
      prisma.response,
      responseId,
      "Response not found"
    );
    expect(prisma.response.update).toHaveBeenCalledWith({
      where: { responseId: responseId },
      data: mockUpdateData,
    });
  });
});

describe("Response Service - deleteResponse", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should delete the response", async () => {
    const responseId = 1;

    // Mock the existence check to pass
    checkIdExistence.mockResolvedValue(true);

    prisma.response.delete.mockResolvedValue({ responseId: responseId });

    const result = await responseService.deleteResponse(responseId);

    expect(checkIdExistence).toHaveBeenCalledWith(
      prisma.response,
      responseId,
      "Response not found"
    );
    expect(prisma.response.delete).toHaveBeenCalledWith({
      where: { responseId: responseId },
    });
    expect(result).toEqual({ responseId: responseId });
  });

  it("should throw an error if the Response does not exist", async () => {
    const responseId = 999;

    // Mock the existence check to fail
    const mockError = new Error("Response not found");
    mockError.status = 404;
    checkIdExistence.mockRejectedValue(mockError);

    await expect(responseService.deleteResponse(responseId)).rejects.toThrow(
      "Response not found"
    );

    expect(checkIdExistence).toHaveBeenCalledWith(
      prisma.response,
      responseId,
      "Response not found"
    );
    expect(prisma.response.delete).not.toHaveBeenCalled();
  });

  it("should throw an error if deletion fails", async () => {
    const responseId = 1;

    // Mock the existence check to pass
    checkIdExistence.mockResolvedValue(true);

    const mockError = new Error("Database error");
    prisma.response.delete.mockRejectedValue(mockError);

    await expect(responseService.deleteResponse(responseId)).rejects.toThrow(
      "Database error"
    );

    expect(checkIdExistence).toHaveBeenCalledWith(
      prisma.response,
      responseId,
      "Response not found"
    );
    expect(prisma.response.delete).toHaveBeenCalledWith({
      where: { responseId: responseId },
    });
  });
});
