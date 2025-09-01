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
});
