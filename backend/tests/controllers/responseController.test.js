const responseController = require("../../controllers/responseController");
const responseService = require("../../services/responseService");
const { createMockResponse } = require("../helpers/responseHelper");
const { expectError } = require("../helpers/errorHelper");

jest.mock("../../services/responseService");

describe("Response Controller - createResponse", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {
      body: {
        label: "Sample answer",
        projectId: 1,
        questionId: 1,
        optionId: null,
        responseIdParent: null,
      },
    };
    res = createMockResponse();
    next = jest.fn();
  });

  it("should create a response and return 201 status", async () => {
    const mockResponse = { responseId: 1, ...req.body };
    responseService.createResponse.mockResolvedValue(mockResponse);

    await responseController.createResponse(req, res, next);

    expect(responseService.createResponse).toHaveBeenCalledWith({
      label: req.body.label,
      projectId: req.body.projectId,
      questionId: req.body.questionId,
      optionId: req.body.optionId,
      responseIdParent: req.body.responseIdParent,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it("should handle service errors and return 500 status", async () => {
    await expectError(
      responseController.createResponse,
      req,
      res,
      () =>
        responseService.createResponse.mockRejectedValue(
          new Error("Database error")
        ),
      500,
      "Internal server error"
    );
    expect(responseService.createResponse).toHaveBeenCalled();
  });
});

describe("Response Service - udpateResponse", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {
      params: { responseId: 1 },
      body: {
        label: "Updated Response",
        projectId: 1,
        questionId: 1,
        optionId: null,
        responseIdParent: null,
      },
    };
    res = createMockResponse();
    next = jest.fn();
  });

  it("should update a response and return 200 status", async () => {
    const mockUpdatedResponse = { responseId: 1, ...req.body };
    responseService.updateResponse.mockResolvedValue(mockUpdatedResponse);

    await responseController.updateResponse(req, res, next);

    expect(responseService.updateResponse).toHaveBeenCalledWith(
      parseInt(req.params.responseId),
      {
        label: req.body.label,
        projectId: req.body.projectId,
        questionId: req.body.questionId,
        optionId: req.body.optionId,
        responseIdParent: req.body.responseIdParent,
      }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUpdatedResponse);
  });

  it("should handle service errors and return 500 status", async () => {
    await expectError(
      responseController.updateResponse,
      req,
      res,
      () =>
        responseService.updateResponse.mockRejectedValue(
          new Error("Database error")
        ),
      500,
      "Internal server error"
    );
    expect(responseService.updateResponse).toHaveBeenCalled();
  });

  it("should return 400 for invalid responseId", async () => {
    req.params.responseId = "invalid";
    await expectError(
      responseController.updateResponse,
      req,
      res,
      () => {},
      400,
      "Bad request: Invalid responseId"
    );
    expect(responseService.updateResponse).not.toHaveBeenCalled();
  });

  it("should return 404 if response not found", async () => {
    await expectError(
      responseController.updateResponse,
      req,
      res,
      () => responseService.updateResponse.mockRejectedValue({ status: 404 }),
      404,
      "Response not found"
    );
    expect(responseService.updateResponse).toHaveBeenCalled();
  });
});

describe("Response Controller - deleteResponse", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {
      params: { responseId: 1 },
    };
    res = createMockResponse();
    next = jest.fn();
  });

  it("should delete a response and return 204 status", async () => {
    responseService.deleteResponse.mockResolvedValue();

    await responseController.deleteResponse(req, res, next);

    expect(responseService.deleteResponse).toHaveBeenCalledWith(
      parseInt(req.params.responseId)
    );
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("should handle service errors and return 500 status", async () => {
    await expectError(
      responseController.deleteResponse,
      req,
      res,
      () =>
        responseService.deleteResponse.mockRejectedValue(
          new Error("Database error")
        ),
      500,
      "Internal server error"
    );
    expect(responseService.deleteResponse).toHaveBeenCalled();
  });

  it("should return 400 for invalid responseId", async () => {
    req.params.responseId = "invalid";
    await expectError(
      responseController.deleteResponse,
      req,
      res,
      () => {},
      400,
      "Bad request: Invalid responseId"
    );
    expect(responseService.deleteResponse).not.toHaveBeenCalled();
  });

  it("should return 404 if Response not found", async () => {
    await expectError(
      responseController.deleteResponse,
      req,
      res,
      () => responseService.deleteResponse.mockRejectedValue({ status: 404 }),
      404,
      "Response not found"
    );
    expect(responseService.deleteResponse).toHaveBeenCalled();
  });
});

// TODO: Added tests for getResponsesByQuestionOfProject
describe("Response Controller - getResponsesByQuestionOfProject", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {
      params: { projectId: 1, questionId: 1 },
    };
    res = createMockResponse();
    next = jest.fn();
  });

  it("should fetch responses by question of a project and return 200 status", async () => {
    const mockReponses = [
      {
        responseId: 1,
        label: "Answer 01",
        projectId: 1,
        questionId: 1,
        optionId: null,
        responseIdParent: null,
      },
    ];
    responseService.getResponsesByQuestionOfProject.mockResolvedValue(
      mockReponses
    );

    await responseController.getResponsesByQuestionOfProject(req, res, next);

    expect(
      responseService.getResponsesByQuestionOfProject
    ).toHaveBeenCalledWith(
      parseInt(req.params.projectId),
      parseInt(req.params.questionId)
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockReponses);
  });

  it("should handle service errors and return 500 status", async () => {
    await expectError(
      responseController.getResponsesByQuestionOfProject,
      req,
      res,
      () =>
        responseService.getResponsesByQuestionOfProject.mockRejectedValue(
          new Error("Database error")
        ),
      500,
      "Internal server error"
    );
    expect(responseService.getResponsesByQuestionOfProject).toHaveBeenCalled();
  });

  it("should return 400 for invalid projectId", async () => {
    req.params.projectId = "invalid";
    await expectError(
      responseController.getResponsesByQuestionOfProject,
      req,
      res,
      () => {},
      400,
      "Bad request: Invalid Ids"
    );
    expect(
      responseService.getResponsesByQuestionOfProject
    ).not.toHaveBeenCalled();
  });

  it("should return 400 for invalid questionId", async () => {
    req.params.questionId = "invalid";
    await expectError(
      responseController.getResponsesByQuestionOfProject,
      req,
      res,
      () => {},
      400,
      "Bad request: Invalid Ids"
    );
    expect(
      responseService.getResponsesByQuestionOfProject
    ).not.toHaveBeenCalled();
  });
});

describe("Response Controller - getResponsesByProject", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {
      params: { projectId: 1 },
    };
    res = createMockResponse();
    next = jest.fn();
  });

  it("should fetch responses by project and return 200 status", async () => {
    const mockReponses = [
      {
        responseId: 1,
        label: "Answer 01",
        projectId: 1,
        questionId: 1,
        optionId: null,
        responseIdParent: null,
      },
      {
        responseId: 2,
        label: "Answer 02",
        projectId: 1,
        questionId: 2,
        optionId: null,
        responseIdParent: null,
      },
    ];
    responseService.getResponsesByProject.mockResolvedValue(mockReponses);

    await responseController.getResponsesByProject(req, res, next);

    expect(responseService.getResponsesByProject).toHaveBeenCalledWith(
      parseInt(req.params.projectId)
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockReponses);
  });

  it("should handle service errors and return 500 status", async () => {
    await expectError(
      responseController.getResponsesByProject,
      req,
      res,
      () =>
        responseService.getResponsesByProject.mockRejectedValue(
          new Error("Database error")
        ),
      500,
      "Internal server error"
    );
    expect(responseService.getResponsesByProject).toHaveBeenCalled();
  });

  it("should return 404 if project not found", async () => {
    await expectError(
      responseController.getResponsesByProject,
      req,
      res,
      () =>
        responseService.getResponsesByProject.mockRejectedValue({
          status: 404,
        }),
      404,
      "Project not found"
    );
    expect(responseService.getResponsesByProject).toHaveBeenCalled();
  });

  it("should return 400 for invalid projectId", async () => {
    req.params.projectId = "invalid";
    await expectError(
      responseController.getResponsesByProject,
      req,
      res,
      () => {},
      400,
      "Bad request: Invalid projectId"
    );
    expect(responseService.getResponsesByProject).not.toHaveBeenCalled();
  });
});

describe("Response Controller - getSubResponses", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {
      params: { responseIdParent: 1 },
    };
    res = createMockResponse();
    next = jest.fn();
  });

  it("should fetch sub-responses and return 200 status", async () => {
    const mockSubResponses = [
      { responseId: 2, label: "Sub Response 1", responseIdParent: 1 },
      { responseId: 3, label: "Sub Response 2", responseIdParent: 1 },
    ];
    responseService.getSubResponses.mockResolvedValue(mockSubResponses);

    await responseController.getSubResponses(req, res, next);

    expect(responseService.getSubResponses).toHaveBeenCalledWith(
      parseInt(req.params.responseIdParent)
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockSubResponses);
  });

  it("should handle service errors and return 500 status", async () => {
    await expectError(
      responseController.getSubResponses,
      req,
      res,
      () =>
        responseService.getSubResponses.mockRejectedValue(
          new Error("Database error")
        ),
      500,
      "Internal server error"
    );
    expect(responseService.getSubResponses).toHaveBeenCalled();
  });

  it("should return 400 for invalid parentId", async () => {
    req.params.responseIdParent = "invalid";
    await expectError(
      responseController.getSubResponses,
      req,
      res,
      () => {},
      400,
      "Bad request: Invalid responseIdParent"
    );
    expect(responseService.getSubResponses).not.toHaveBeenCalled();
  });
});
