/**
 * @fileoverview
 * Unit tests for the Response Controller.
 *
 * @module responseController.test
 *
 * @description
 * Tests all controller endpoints:
 *  - createResponse
 *  - getResponse(s)
 *  - updateResponse
 *  - deleteResponse
 *  - query by various parameters
 *
 * Uses Jest and mocks:
 *  - ResponseService layer
 *
 * @example
 * // Run all tests for this controller
 * // npx jest tests/controllers/responseController.test.js
 *
 * @tests
 * - Creating a response with valid/invalid payloads
 * - Fetching responses by ID or filters
 * - Updating responses
 * - Deleting responses
 */
const responseController = require("../../controllers/responseController");
const responseService = require("../../services/responseService");
const { createMockResponse } = require("../helpers/responseHelper");
const {
  invalidOrMissingStatus,
  notFoundStatus,
  internalServerErrorStatus,
} = require("../helpers/errorHelper");

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

    it("should return 400 if a required field is missing", async () => {
      req.body.label = "";
      await invalidOrMissingStatus(
        responseController.createResponse,
        req,
        res,
        responseService.createResponse,
        "label is required"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        responseController.createResponse,
        req,
        res,
        responseService.createResponse
      );
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
        Number(req.params.responseId),
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

    it("should return 400 if a required field is missing", async () => {
      req.body.label = "";
      await invalidOrMissingStatus(
        responseController.updateResponse,
        req,
        res,
        responseService.updateResponse,
        "label is required"
      );
    });

    it("should return 404 if response not found", async () => {
      await notFoundStatus(
        responseController.updateResponse,
        req,
        res,
        responseService.updateResponse,
        "Response"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        responseController.updateResponse,
        req,
        res,
        responseService.updateResponse
      );
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
        Number(req.params.responseId)
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("should return 404 if Response not found", async () => {
      await notFoundStatus(
        responseController.deleteResponse,
        req,
        res,
        responseService.deleteResponse,
        "Response"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        responseController.deleteResponse,
        req,
        res,
        responseService.deleteResponse
      );
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
        Number(req.params.projectId),
        Number(req.params.questionId)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReponses);
    });

    it("should return 404 if project not found", async () => {
      await notFoundStatus(
        responseController.getResponsesByQuestionOfProject,
        req,
        res,
        responseService.getResponsesByQuestionOfProject,
        "Project"
      );
    });

    it("should return 404 if question not found", async () => {
      await notFoundStatus(
        responseController.getResponsesByQuestionOfProject,
        req,
        res,
        responseService.getResponsesByQuestionOfProject,
        "Question"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        responseController.getResponsesByQuestionOfProject,
        req,
        res,
        responseService.getResponsesByQuestionOfProject
      );
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
        Number(req.params.projectId)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReponses);
    });

    it("should return 404 if project not found", async () => {
      await notFoundStatus(
        responseController.getResponsesByProject,
        req,
        res,
        responseService.getResponsesByProject,
        "Project"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        responseController.getResponsesByProject,
        req,
        res,
        responseService.getResponsesByProject
      );
    });
  });

  /**
   * Test suite for fetching sub-responses by parent
   */
  describe("getSubResponses", () => {
    beforeEach(() => {
      req = {
        params: { responseId: 1 },
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
        Number(req.params.responseId)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockSubResponses);
    });

    it("should return 404 if responseIdParent not found", async () => {
      await notFoundStatus(
        responseController.getSubResponses,
        req,
        res,
        responseService.getSubResponses,
        "ResponseParent"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        responseController.getSubResponses,
        req,
        res,
        responseService.getSubResponses
      );
    });
  });
});
