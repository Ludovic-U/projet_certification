const typeController = require("../../controllers/typeController");
const typeService = require("../../services/typeService");
const { createMockResponse } = require("../helpers/responseHelper");
const { expectError } = require("../helpers/errorHelper");

jest.mock("../../services/typeService");

describe("Type Controller", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    res = createMockResponse();
    next = jest.fn();
  });

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
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockType);
    });

    it("should handle service errors and return 500 status", async () => {
      await expectError(
        typeController.createType,
        req,
        res,
        () =>
          typeService.createType.mockRejectedValue(new Error("Database error")),
        500,
        "Internal server error"
      );
      expect(typeService.createType).toHaveBeenCalled();
    });
  });

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
      await expectError(
        typeController.getAllTypes,
        req,
        res,
        () =>
          typeService.getAllTypes.mockRejectedValue(
            new Error("Database error")
          ),
        500,
        "Internal server error"
      );
      expect(typeService.getAllTypes).toHaveBeenCalled();
    });
  });

  describe("updateType", () => {
    beforeEach(() => {
      req = { params: { typeId: 1 }, body: { label: "Updated Label" } };
    });

    it("should update a type and return 200 status", async () => {
      const mockUpdatedType = { typeId: 1, ...req.body };

      typeService.updateType.mockResolvedValue(mockUpdatedType);

      await typeController.updateType(req, res, next);

      expect(typeService.updateType).toHaveBeenCalledWith(
        parseInt(req.params.typeId),
        {
          label: req.body.label,
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedType);
    });

    it("should handle service errors and return 500 status", async () => {
      await expectError(
        typeController.updateType,
        req,
        res,
        () =>
          typeService.updateType.mockRejectedValue(new Error("Database error")),
        500,
        "Internal server error"
      );
      expect(typeService.updateType).toHaveBeenCalled();
    });

    it("should return 400 for invalid typeId", async () => {
      req.params.typeId = "invalid";

      await expectError(
        typeController.updateType,
        req,
        res,
        () => {},
        400,
        "Bad request: Invalid typeId"
      );
      expect(typeService.updateType).not.toHaveBeenCalled();
    });

    it("should return 404 if type not found", async () => {
      await expectError(
        typeController.updateType,
        req,
        res,
        () => typeService.updateType.mockRejectedValue({ status: 404 }),
        404,
        "Type not found"
      );
      expect(typeService.updateType).toHaveBeenCalled();
    });
  });

  describe("deleteType", () => {
    beforeEach(() => {
      req = { params: { typeId: 1 } };
    });

    it("should delete a type and return 204 status", async () => {
      typeService.deleteType.mockResolvedValue();

      await typeController.deleteType(req, res, next);

      expect(typeService.deleteType).toHaveBeenCalledWith(
        parseInt(req.params.typeId)
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("should handle service errors and return 500 status", async () => {
      await expectError(
        typeController.deleteType,
        req,
        res,
        () =>
          typeService.deleteType.mockRejectedValue(new Error("Database error")),
        500,
        "Internal server error"
      );
      expect(typeService.deleteType).toHaveBeenCalled();
    });

    it("should return 400 for invalid typeId", async () => {
      req.params.typeId = "invalid";

      await expectError(
        typeController.deleteType,
        req,
        res,
        () => {},
        400,
        "Bad request: Invalid typeId"
      );
      expect(typeService.deleteType).not.toHaveBeenCalled();
    });

    it("should return 404 if type not found", async () => {
      await expectError(
        typeController.deleteType,
        req,
        res,
        () => typeService.deleteType.mockRejectedValue({ status: 404 }),
        404,
        "Type not found"
      );
      expect(typeService.deleteType).toHaveBeenCalled();
    });
  });

  describe("getTypeById", () => {
    beforeEach(() => {
      req = { params: { typeId: 1 } };
    });

    it("should fetch a type by ID and return 200 status", async () => {
      const mockType = { typeId: 1, label: "General" };

      typeService.getTypeById.mockResolvedValue(mockType);

      await typeController.getTypeById(req, res, next);

      expect(typeService.getTypeById).toHaveBeenCalledWith(
        parseInt(req.params.typeId)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockType);
    });

    it("should handle service errors and return 500 status", async () => {
      await expectError(
        typeController.getTypeById,
        req,
        res,
        () =>
          typeService.getTypeById.mockRejectedValue(
            new Error("Database error")
          ),
        500,
        "Internal server error"
      );
      expect(typeService.getTypeById).toHaveBeenCalled();
    });

    it("should return 400 for invalid typeId", async () => {
      req.params.typeId = "invalid";

      await expectError(
        typeController.getTypeById,
        req,
        res,
        () => {},
        400,
        "Bad request: Invalid typeId"
      );
      expect(typeService.getTypeById).not.toHaveBeenCalled();
    });

    it("should return 404 if type not found", async () => {
      await expectError(
        typeController.getTypeById,
        req,
        res,
        () =>
          typeService.getTypeById.mockRejectedValue({
            status: 404,
          }),
        404,
        "Type not found"
      );
      expect(typeService.getTypeById).toHaveBeenCalled();
    });
  });
});
