const { createResponse } = require("../../controllers/responseController");
const { prisma } = require("../../prisma/prismaClient");
const { mockResponse } = require("../helpers/responseHelper");
const { expectError } = require("../helpers/errorHelper");

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

describe("Create Response Controller", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {
      body: {
        label: "Sample answer",
        projectId: 1,
        questionId: 1,
        optionId: null,
        questionIdParent: null,
      },
    };
    res = mockResponse();
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
        optionId: req.body.optionId,
        questionIdParent: req.body.questionIdParent,
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it("should handle errors during response creation", async () => {
    await expectError(
      createResponse,
      req,
      res,
      () => prisma.response.create.mockRejectedValue(new Error("DB error")),
      500,
      "Internal Server Error"
    );
    expect(prisma.response.create).toHaveBeenCalled();
  });
});
