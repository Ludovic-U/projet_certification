const {
  createResponse,
  getAllResponseByProject,
} = require("../../controllers/responseController");
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

describe("Get all response by project Controller", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {
      params: { projectId: 1 },
    };
    res = mockResponse();
  });

  it("should retrieve all responses successfully", async () => {
    const mockResponses = [
      {
        responseId: 1,
        label: "Sample answer",
        projectId: 1,
        questionId: 1,
        optionId: null,
        questionIdParent: null,
      },
      {
        responseId: 2,
        label: "Another answer",
        projectId: 1,
        questionId: 2,
        optionId: null,
        questionIdParent: null,
      },
    ];
    prisma.response.findMany.mockResolvedValue(mockResponses);

    await getAllResponseByProject(req, res);

    expect(prisma.response.findMany).toHaveBeenCalledWith({
      where: {
        projectId: 1,
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResponses);
  });

  it("should handle errors during response retrieval", async () => {
    await expectError(
      getAllResponseByProject,
      req,
      res,
      () => prisma.response.findMany.mockRejectedValue(new Error("DB error")),
      500,
      "Internal Server Error"
    );
    expect(prisma.response.findMany).toHaveBeenCalled();
  });
});
