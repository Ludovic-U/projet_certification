/**
 * @fileoverview
 * Unit tests for the Option Controller.
 * Covers all controller endpoints: create, read, update, delete, and query by various parameters.
 * Uses Jest and mocks the optionService layer.
 */

const optionController = require("../../controllers/optionController");
const optionService = require("../../services/optionService");
const { createMockResponse } = require("../helpers/responseHelper");
const {
  invalidOrMissingStatus,
  notFoundStatus,
  internalServerErrorStatus,
} = require("../helpers/errorHelper");

// Mock optionService layer to isolate business logic
jest.mock("../../services/optionService");

describe("Option Controller", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    res = createMockResponse();
    next = jest.fn();
  });

  /**
   * Test suite for creating options
   */
  describe("createOption", () => {
    beforeEach(() => {
      req = { body: { label: "Opt1", questionId: 1 } };
    });

    it("should create an option and return 201 status", async () => {
      const mockOption = { optionId: 1, ...req.body };

      optionService.createOption.mockResolvedValue(mockOption);

      await optionController.createOption(req, res, next);

      expect(optionService.createOption).toHaveBeenCalledWith({
        label: req.body.label,
        questionId: req.body.questionId,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockOption);
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        optionController.createOption,
        req,
        res,
        optionService.createOption
      );
    });
  });

  /**
   * Test suite for updating options
   */
  describe("updateOption", () => {
    beforeEach(() => {
      req = {
        params: { optionId: 1 },
        body: { label: "updated Opt", questionId: 1 },
      };
    });

    it("should update an option and return 200 status", async () => {
      const mockUpdateOption = { optionId: 1, ...req.body };

      optionService.updateOption.mockResolvedValue(mockUpdateOption);

      await optionController.updateOption(req, res, next);

      expect(optionService.updateOption).toHaveBeenCalledWith(
        Number(req.params.optionId),
        { label: req.body.label, questionId: req.body.questionId }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdateOption);
    });

    it("should return 400 for invalid optionId", async () => {
      req.params.optionId = "invalid";
      await invalidOrMissingStatus(
        optionController.updateOption,
        req,
        res,
        optionService.updateOption,
        "Invalid optionId"
      );
    });

    it("should return 404 if option not found", async () => {
      await notFoundStatus(
        optionController.updateOption,
        req,
        res,
        optionService.updateOption,
        "Option"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        optionController.updateOption,
        req,
        res,
        optionService.updateOption
      );
    });
  });

  /**
   * Test suite for deleting options
   */
  describe("deleteOption", () => {
    beforeEach(() => {
      req = { params: { optionId: 1 } };
    });

    it("should delete an option and return 204 status", async () => {
      optionService.deleteOption.mockResolvedValue();

      await optionController.deleteOption(req, res, next);

      expect(optionService.deleteOption).toHaveBeenCalledWith(
        Number(req.params.optionId)
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("should return 400 for invalid optionId", async () => {
      req.params.optionId = "invalid";
      await invalidOrMissingStatus(
        optionController.deleteOption,
        req,
        res,
        optionService.deleteOption,
        "Invalid optionId"
      );
    });

    it("should return 404 if option not found", async () => {
      await notFoundStatus(
        optionController.deleteOption,
        req,
        res,
        optionService.deleteOption,
        "Option"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        optionController.deleteOption,
        req,
        res,
        optionService.deleteOption
      );
    });
  });

  /**
   * Test suite for fetching options by ID
   */
  describe("getOptionById", () => {
    beforeEach(() => {
      req = { params: { optionId: 1 } };
    });

    it("should fetch an option by ID and return 200 status", async () => {
      const mockOption = { optionId: 1, label: "Opt1" };

      optionService.getOptionById.mockResolvedValue(mockOption);

      await optionController.getOptionById(req, res, next);

      expect(optionService.getOptionById).toHaveBeenCalledWith(
        Number(req.params.optionId)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockOption);
    });

    it("should return 400 for invalid questionId", async () => {
      req.params.optionId = "invalid";
      await invalidOrMissingStatus(
        optionController.getOptionById,
        req,
        res,
        optionService.getOptionById,
        "Invalid optionId"
      );
    });

    it("should return 404 if option not found", async () => {
      await notFoundStatus(
        optionController.getOptionById,
        req,
        res,
        optionService.getOptionById,
        "Option"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        optionController.getOptionById,
        req,
        res,
        optionService.getOptionById
      );
    });
  });

  /**
   * Test suite for fetching options by question
   */
  describe("getOptionsByQuestion", () => {
    beforeEach(() => {
      req = { params: { questionId: 1 } };
    });

    it("should fetch options and return 200 status", async () => {
      const mockOptions = [
        { optionId: 1, label: "Opt1", questionId: 1 },
        { optionId: 2, label: "Opt2", questionId: 1 },
      ];

      optionService.getOptionsByQuestion.mockResolvedValue(mockOptions);

      await optionController.getOptionsByQuestion(req, res, next);

      expect(optionService.getOptionsByQuestion).toHaveBeenCalledWith(
        Number(req.params.questionId)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockOptions);
    });

    it("should return 400 for invalid questionId", async () => {
      req.params.questionId = "invalid";
      await invalidOrMissingStatus(
        optionController.getOptionsByQuestion,
        req,
        res,
        optionService.getOptionsByQuestion,
        "Invalid questionId"
      );
    });

    it("should return 404 if question not found", async () => {
      await notFoundStatus(
        optionController.getOptionsByQuestion,
        req,
        res,
        optionService.getOptionsByQuestion,
        "Question"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        optionController.getOptionsByQuestion,
        req,
        res,
        optionService.getOptionsByQuestion
      );
    });
  });
});
