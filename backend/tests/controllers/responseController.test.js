const { createResponse } = require("../../controllers/responseController");
const { prisma } = require("../../prisma/prismaClient");
const { mockResponse } = require("../helpers/responseHelper");
const { expectError } = require("../helpers/errorHelper");

jest.mock("../../prisma/prismaClient", () => ({
  prisma: {
    question: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe("Create Response Controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        label: "Sample answer",
        projectId: 1,
        questionId: 1,
      },
    };
    res = mockResponse();
    jest.clearAllMocks();
  });

  it("should create a response successfully", async () => {
    const mockResponse = {
      responseId: 1,
      ...req.body,
    };
    prisma.response.create.mockResolvedValue(mockResponse);
    await createResponse(req, res);
    expect(prisma.response.create).toHaveBeenCalledWith({
      data: {
        label: req.body.label,
        projectId: req.body.projectId,
        questionId: req.body.questionId,
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it("should handle errors during response creation", async () => {});
});
