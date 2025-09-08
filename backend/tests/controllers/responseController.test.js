/**
 * @fileoverview
 * Unit tests for the Response Controller.
 * Covers all controller endpoints: create, read, update, delete, and query by various parameters.
 * Uses Jest and mocks the responseService layer.
 */

const responseController = require("../../controllers/responseController");
const responseService = require("../../services/responseService");
const { createMockResponse } = require("../helpers/responseHelper");
const { expectError } = require("../helpers/errorHelper");

// Mock responseService layer to isolate business logic
jest.mock("../../services/responseService");

describe("Response Controller", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    res = createMockResponse();
    next = jest.fn();
  });

  /**
   * Test suite for creating responses
   */
  describe("createResponse", () => {
    beforeEach(() => {
      req = {
        body: {
          label: "Sample answer",
          projectId: 1,
          questionId: 1,
          optionId: null,
          responseIdParent: null,
        },
      };
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

  /**
   * Test suite for updating responses
   */
  describe("udpateResponse", () => {
    beforeEach(() => {
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

    it("should return 400 for invalid responseId", async () => {
      req.params.responseId = "invalid";

      await expectError(
        responseController.updateResponse,
        req,
        res,
        () => {},
        400,
        "Invalid responseId"
      );

      expect(responseService.updateResponse).not.toHaveBeenCalled();
    });

    it("should return 404 if response not found", async () => {
      await expectError(
        responseController.updateResponse,
        req,
        res,
        () =>
          responseService.updateResponse.mockRejectedValue({ code: "P2025" }),
        404,
        "Response not found"
      );

      expect(responseService.updateResponse).toHaveBeenCalled();
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
  });

  /**
   * Test suite for deleting responses
   */
  describe("deleteResponse", () => {
    beforeEach(() => {
      req = {
        params: { responseId: 1 },
      };
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

    it("should return 400 for invalid responseId", async () => {
      req.params.responseId = "invalid";

      await expectError(
        responseController.deleteResponse,
        req,
        res,
        () => {},
        400,
        "Invalid responseId"
      );

      expect(responseService.deleteResponse).not.toHaveBeenCalled();
    });

    it("should return 404 if Response not found", async () => {
      await expectError(
        responseController.deleteResponse,
        req,
        res,
        () =>
          responseService.deleteResponse.mockRejectedValue({ code: "P2025" }),
        404,
        "Response not found"
      );

      expect(responseService.deleteResponse).toHaveBeenCalled();
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
  });

  /**
   * Test suite for fetching responses by question of a project
   */
  describe("getResponsesByQuestionOfProject", () => {
    beforeEach(() => {
      req = {
        params: { projectId: 1, questionId: 1 },
      };
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

    it("should return 400 for invalid projectId", async () => {
      req.params.projectId = "invalid";
      req.params.questionId = "invalid";

      await expectError(
        responseController.getResponsesByQuestionOfProject,
        req,
        res,
        () => {},
        400,
        "Invalid projectId or questionId"
      );

      expect(
        responseService.getResponsesByQuestionOfProject
      ).not.toHaveBeenCalled();
    });

    it("should return 404 for invalid questionId", async () => {
      await expectError(
        responseController.getResponsesByQuestionOfProject,
        req,
        res,
        () =>
          responseService.getResponsesByQuestionOfProject.mockRejectedValue({
            code: "P2025",
          }),
        404,
        "Project or Question not found"
      );

      expect(
        responseService.getResponsesByQuestionOfProject
      ).toHaveBeenCalled();
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

      expect(
        responseService.getResponsesByQuestionOfProject
      ).toHaveBeenCalled();
    });
  });

  /**
   * Test suite for fetching responses by project
   */
  describe("getResponsesByProject", () => {
    beforeEach(() => {
      req = {
        params: { projectId: 1 },
      };
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

    it("should return 400 for invalid projectId", async () => {
      req.params.projectId = "invalid";

      await expectError(
        responseController.getResponsesByProject,
        req,
        res,
        () => {},
        400,
        "Invalid projectId"
      );

      expect(responseService.getResponsesByProject).not.toHaveBeenCalled();
    });

    it("should return 404 if project not found", async () => {
      await expectError(
        responseController.getResponsesByProject,
        req,
        res,
        () =>
          responseService.getResponsesByProject.mockRejectedValue({
            code: "P2025",
          }),
        404,
        "Project not found"
      );

      expect(responseService.getResponsesByProject).toHaveBeenCalled();
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
  });

  /**
   * Test suite for fetching sub-responses by parent
   */
  describe("getSubResponses", () => {
    beforeEach(() => {
      req = {
        params: { responseIdParent: 1 },
      };
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

    it("should return 400 for invalid parentId", async () => {
      req.params.responseIdParent = "invalid";

      await expectError(
        responseController.getSubResponses,
        req,
        res,
        () => {},
        400,
        "Invalid responseIdParent"
      );

      expect(responseService.getSubResponses).not.toHaveBeenCalled();
    });

    it("should return 404 if responseIdParent not found", async () => {
      await expectError(
        responseController.getSubResponses,
        req,
        res,
        () =>
          responseService.getSubResponses.mockRejectedValue({
            code: "P2025",
          }),
        404,
        "ResponseParent not found"
      );

      expect(responseService.getSubResponses).toHaveBeenCalled();
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
  });
});
