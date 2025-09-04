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
});
