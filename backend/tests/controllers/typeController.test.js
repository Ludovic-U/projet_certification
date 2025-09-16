/**
 * @fileoverview
 * Unit tests for the Type Controller.
 * Covers all controller endpoints: create, read, update, delete, and query by various parameters.
 * Uses Jest and mocks the typeService layer.
 */

const typeController = require("../../controllers/typeController");
const typeService = require("../../services/typeService");
const { createMockResponse } = require("../helpers/responseHelper");
const {
  invalidOrMissingStatus,
  notFoundStatus,
  internalServerErrorStatus,
} = require("../helpers/errorHelper");

// Mock typeService layer to isolate business logic
jest.mock("../../services/typeService");

describe("Type Controller", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    res = createMockResponse();
    next = jest.fn();
  });

  /**
   * Test suite for creating types
   */
  describe("createType", () => {
    beforeEach(() => {
      req = { body: { label: "General" } };
    });

    it("should create a type and return 201 status", async () => {
      const mockType = { typeId: 1, ...req.body };

      typeService.createType.mockResolvedValue(mockType);

      await typeController.createType(req, res, next);

      expect(typeService.createType).toHaveBeenCalledWith({
        label: req.body.label,
        questions: [],
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockType);
    });

    it("should create a type with associated question and return 201 status", async () => {
      req.body.questions = [1];
      const mockType = { typeId: 1, ...req.body };

      typeService.createType.mockResolvedValue(mockType);

      await typeController.createType(req, res, next);

      expect(typeService.createType).toHaveBeenCalledWith({
        label: req.body.label,
        questions: req.body.questions,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockType);
    });

    it("should return 400 if a required field is missing", async () => {
      req.body.label = "";
      await invalidOrMissingStatus(
        typeController.createType,
        req,
        res,
        typeService.createType,
        "label is required"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        typeController.createType,
        req,
        res,
        typeService.createType
      );
    });
  });

  /**
   * Test suite for fetching types
   */
  describe("getAllTypes", () => {
    beforeEach(() => {
      req = {};
    });

    it("should fetch all types and return 200 status", async () => {
      const mockTypes = [
        { typeId: 1, label: "General" },
        { typeId: 2, label: "Test" },
      ];

      typeService.getAllTypes.mockResolvedValue(mockTypes);

      await typeController.getAllTypes(req, res, next);

      expect(typeService.getAllTypes).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTypes);
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        typeController.getAllTypes,
        req,
        res,
        typeService.getAllTypes
      );
    });
  });

  /**
   * Test suite for updating types
   */
  describe("updateType", () => {
    beforeEach(() => {
      req = { params: { typeId: 1 }, body: { label: "Updated Label" } };
    });

    it("should update a type and return 200 status", async () => {
      const mockUpdatedType = { typeId: 1, ...req.body };

      typeService.updateType.mockResolvedValue(mockUpdatedType);

      await typeController.updateType(req, res, next);

      expect(typeService.updateType).toHaveBeenCalledWith(
        Number(req.params.typeId),
        { label: req.body.label }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedType);
    });

    it("should update a type with add/remove associated question and return 200 status", async () => {
      req.body.addQuestion = [2];
      req.body.removeQuestion = [1];
      const mockUpdatedType = { typeId: 1, ...req.body };

      typeService.updateType.mockResolvedValue(mockUpdatedType);

      await typeController.updateType(req, res, next);

      expect(typeService.updateType).toHaveBeenCalledWith(
        Number(req.params.typeId),
        {
          label: req.body.label,
          addQuestion: req.body.addQuestion,
          removeQuestion: req.body.removeQuestion,
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedType);
    });

    it("should return 400 for invalid typeId", async () => {
      req.params.typeId = "invalid";
      await invalidOrMissingStatus(
        typeController.updateType,
        req,
        res,
        typeService.updateType,
        "Invalid typeId"
      );
    });

    it("should return 400 if a required field is missing", async () => {
      req.body.label = "";
      await invalidOrMissingStatus(
        typeController.updateType,
        req,
        res,
        typeService.updateType,
        "label is required"
      );
    });

    it("should return 404 if type not found", async () => {
      await notFoundStatus(
        typeController.updateType,
        req,
        res,
        typeService.updateType,
        "Type"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        typeController.updateType,
        req,
        res,
        typeService.updateType
      );
    });
  });

  /**
   * Test suite for deleting types
   */
  describe("deleteType", () => {
    beforeEach(() => {
      req = { params: { typeId: 1 } };
    });

    it("should delete a type and return 204 status", async () => {
      typeService.deleteType.mockResolvedValue();

      await typeController.deleteType(req, res, next);

      expect(typeService.deleteType).toHaveBeenCalledWith(
        Number(req.params.typeId)
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("should return 400 for invalid typeId", async () => {
      req.params.typeId = "invalid";
      await invalidOrMissingStatus(
        typeController.deleteType,
        req,
        res,
        typeService.deleteType,
        "Invalid typeId"
      );
    });

    it("should return 404 if type not found", async () => {
      await notFoundStatus(
        typeController.deleteType,
        req,
        res,
        typeService.deleteType,
        "Type"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        typeController.deleteType,
        req,
        res,
        typeService.deleteType
      );
    });
  });

  /**
   * Test suite for fetching types by ID
   */
  describe("getTypeById", () => {
    beforeEach(() => {
      req = { params: { typeId: 1 } };
    });

    it("should fetch a type by ID and return 200 status", async () => {
      const mockType = { typeId: 1, label: "General" };

      typeService.getTypeById.mockResolvedValue(mockType);

      await typeController.getTypeById(req, res, next);

      expect(typeService.getTypeById).toHaveBeenCalledWith(
        Number(req.params.typeId)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockType);
    });

    it("should return 400 for invalid typeId", async () => {
      req.params.typeId = "invalid";
      await invalidOrMissingStatus(
        typeController.getTypeById,
        req,
        res,
        typeService.getTypeById,
        "Invalid typeId"
      );
    });

    it("should return 404 if type not found", async () => {
      await notFoundStatus(
        typeController.getTypeById,
        req,
        res,
        typeService.getTypeById,
        "Type"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        typeController.getTypeById,
        req,
        res,
        typeService.getTypeById
      );
    });
  });
});
