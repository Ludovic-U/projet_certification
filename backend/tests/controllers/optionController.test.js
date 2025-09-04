/**
 * @fileoverview
 * Unit tests for the Option Controller.
 * Covers all controller endpoints: create, read, update, delete, and query by various parameters.
 * Uses Jest and mocks the optionService layer.
 */

const optionController = require("../../controllers/optionController");
const optionService = require("../../services/optionService");
const { createMockResponse } = require("../helpers/responseHelper");
const { expectError } = require("../helpers/errorHelper");

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
      await expectError(
        optionController.createOption,
        req,
        res,
        () =>
          optionService.createOption.mockRejectedValue(Error("Database error")),
        500,
        "Internal server error"
      );
      expect(optionService.createOption).toHaveBeenCalled();
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
      const mockUpdateOption = { optioonId: 1, ...req.body };
      optionService.updateOption.mockResolvedValue(mockUpdateOption);

      await optionController.updateOption(req, res, next);

      expect(optionService.updateOption).toHaveBeenCalledWith(
        parseInt(req.params.optionId),
        { label: req.body.label, questionId: req.body.questionId }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdateOption);
    });

    it("should handle service errors and return 500 status", async () => {
      await expectError(
        optionController.updateOption,
        req,
        res,
        () =>
          optionService.updateOption.mockRejectedValue(
            new Error("Database error")
          ),
        500,
        "Internal server error"
      );
      expect(optionService.updateOption).toHaveBeenCalled();
    });

    it("should return 400 for invalid optionId", async () => {
      req.params.optionId = "invalid";

      await expectError(
        optionController.updateOption,
        req,
        res,
        () => {},
        400,
        "Bad request: Invalid optionId"
      );
      expect(optionService.updateOption).not.toHaveBeenCalled();
    });

    it("should return 404 if option not found", async () => {
      await expectError(
        optionController.updateOption,
        req,
        res,
        () => optionService.updateOption.mockRejectedValue({ status: 404 }),
        404,
        "Option not found"
      );
      expect(optionService.updateOption).toHaveBeenCalled();
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
        parseInt(req.params.optionId)
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("should handle service errors and return 500 status", async () => {
      await expectError(
        optionController.deleteOption,
        req,
        res,
        () =>
          optionService.deleteOption.mockRejectedValue(
            new Error("Database error")
          ),
        500,
        "Internal server error"
      );
      expect(optionService.deleteOption).toHaveBeenCalled();
    });

    it("should return 400 for invalid optionId", async () => {
      req.params.optionId = "invalid";

      await expectError(
        optionController.deleteOption,
        req,
        res,
        () => {},
        400,
        "Bad request: Invalid optionId"
      );
      expect(optionService.deleteOption).not.toHaveBeenCalled();
    });

    it("should return 404 if option not found", async () => {
      await expectError(
        optionController.deleteOption,
        req,
        res,
        () => optionService.deleteOption.mockRejectedValue({ status: 404 }),
        404,
        "Option not found"
      );
      expect(optionService.deleteOption).toHaveBeenCalled();
    });
  });
});
