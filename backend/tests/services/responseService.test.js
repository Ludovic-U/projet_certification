/**
 * @fileoverview
 * Unit tests for the Response Service.
 * Covers CRUD operations and query methods for responses.
 * Uses Jest and mocks the prismaClient.
 */

const responseService = require("../../services/responseService");
const { prisma } = require("../../prisma/prismaClient");

// Mock the prisma methods to isolate service logic
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

describe("Response Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test suite for creating responses
   */
  describe("createResponse", () => {
    it("should create and return a new response", async () => {
      const mockResponseData = {
        label: "Response test",
        projectId: 1,
        questionId: 1,
        optionId: null,
        responseIdParent: null,
      };
      const mockCreatedResponse = { responseId: 1, ...mockResponseData };

      prisma.response.create.mockResolvedValue(mockCreatedResponse);

      const result = await responseService.createResponse(mockResponseData);

      expect(prisma.response.create).toHaveBeenCalledWith({
        data: mockResponseData,
      });
      expect(result).toEqual(mockCreatedResponse);
    });

    it("should throw an error if creation fails", async () => {
      const mockResponseData = {
        label: "Response test",
        projectId: 1,
        questionId: 1,
        optionId: null,
        responseIdParent: null,
      };

      const mockError = new Error("Database error");

      prisma.response.create.mockRejectedValue(mockError);

      await expect(
        responseService.createResponse(mockResponseData)
      ).rejects.toThrow("Database error");

      expect(prisma.response.create).toHaveBeenCalledWith({
        data: mockResponseData,
      });
    });
  });

  /**
   * Test suite for updating responses
   */
  describe("updateResponse", () => {
    it("should update and return the updated response", async () => {
      const responseId = 1;
      const mockUpdateData = {
        label: "Updated Response",
        projectId: 1,
        questionId: 1,
        optionId: null,
        responseIdParent: null,
      };
      const mockUpdatedResponse = {
        responseId: responseId,
        ...mockUpdateData,
      };

      prisma.response.update.mockResolvedValue(mockUpdatedResponse);

      const result = await responseService.updateResponse(
        responseId,
        mockUpdateData
      );

      expect(prisma.response.update).toHaveBeenCalledWith({
        where: { responseId: responseId },
        data: mockUpdateData,
      });
      expect(result).toEqual(mockUpdatedResponse);
    });

    it("should throw an error if the response is not found", async () => {
      const responseId = 999;
      const mockUpdateData = {
        label: "Non-existent Response",
        projectId: 1,
        questionId: 1,
        optionId: null,
        responseIdParent: null,
      };

      const mockError = new Error("Response not found");
      mockError.code = "P2025";

      prisma.response.update.mockRejectedValue(mockError);

      await expect(
        responseService.updateResponse(responseId, mockUpdateData)
      ).rejects.toThrow("Response not found");

      expect(prisma.response.update).toHaveBeenCalledWith({
        where: { responseId: responseId },
        data: mockUpdateData,
      });
    });

    it("should throw an error if update fails", async () => {
      const responseId = 1;
      const mockUpdateData = {
        label: "Failed update",
        projectId: 1,
        questionId: 1,
        optionId: null,
        responseIdParent: null,
      };

      const mockError = new Error("Database error");

      prisma.response.update.mockRejectedValue(mockError);

      await expect(
        responseService.updateResponse(responseId, mockUpdateData)
      ).rejects.toThrow("Database error");

      expect(prisma.response.update).toHaveBeenCalledWith({
        where: { responseId: responseId },
        data: mockUpdateData,
      });
    });
  });

  /**
   * Test suite for deleting responses
   */
  describe("deleteResponse", () => {
    it("should delete the response", async () => {
      const responseId = 1;

      prisma.response.delete.mockResolvedValue({ responseId: responseId });

      const result = await responseService.deleteResponse(responseId);

      expect(prisma.response.delete).toHaveBeenCalledWith({
        where: { responseId: responseId },
      });
      expect(result).toEqual({ responseId: responseId });
    });

    it("should throw an error if the Response is not found", async () => {
      const responseId = 999;

      const mockError = new Error("Response not found");
      mockError.code = "P2025";

      prisma.response.delete.mockRejectedValue(mockError);

      await expect(responseService.deleteResponse(responseId)).rejects.toThrow(
        "Response not found"
      );

      expect(prisma.response.delete).toHaveBeenCalledWith({
        where: { responseId: responseId },
      });
    });

    it("should throw an error if deletion fails", async () => {
      const responseId = 1;

      const mockError = new Error("Database error");

      prisma.response.delete.mockRejectedValue(mockError);

      await expect(responseService.deleteResponse(responseId)).rejects.toThrow(
        "Database error"
      );

      expect(prisma.response.delete).toHaveBeenCalledWith({
        where: { responseId: responseId },
      });
    });
  });

  /**
   * Test suite for fetching responses by question of a project
   */
  describe("getResponsesByQuestionOfProject", () => {
    it("should return responses for the given question of a project", async () => {
      const projectId = 1;
      const questionId = 1;
      const mockResponses = [
        {
          responseId: 1,
          label: "Answer 01",
          projectId: 1,
          questionId: 1,
          optionId: null,
          responseIdParent: null,
        },
      ];

      prisma.response.findMany.mockResolvedValue(mockResponses);

      const result = await responseService.getResponsesByQuestionOfProject(
        projectId,
        questionId
      );

      expect(prisma.response.findMany).toHaveBeenCalledWith({
        where: { projectId: projectId, questionId: questionId },
      });
      expect(result).toEqual(mockResponses);
    });

    it("should return an empty array if no responses match the QuestionId", async () => {
      const projectId = 1;
      const questionId = 999;

      prisma.response.findMany.mockResolvedValue([]);

      const result = await responseService.getResponsesByQuestionOfProject(
        projectId,
        questionId
      );

      expect(prisma.response.findMany).toHaveBeenCalledWith({
        where: { projectId: projectId, questionId: questionId },
      });
      expect(result).toEqual([]);
    });

    it("should throw an error if the project or question is not found", async () => {
      const projectId = 999;
      const questionId = 999;

      const mockError = new Error("Project or Question not found");
      mockError.code = "P2025";

      prisma.response.findMany.mockRejectedValue(mockError);

      await expect(
        responseService.getResponsesByQuestionOfProject(projectId, questionId)
      ).rejects.toThrow("Project or Question not found");

      expect(prisma.response.findMany).toHaveBeenCalledWith({
        where: { projectId: projectId, questionId: questionId },
      });
    });

    it("should throw an error if fetching fails", async () => {
      const projectId = 1;
      const questionId = 1;

      const mockError = new Error("Database error");

      prisma.response.findMany.mockRejectedValue(mockError);

      await expect(
        responseService.getResponsesByQuestionOfProject(projectId, questionId)
      ).rejects.toThrow("Database error");

      expect(prisma.response.findMany).toHaveBeenCalledWith({
        where: { projectId: projectId, questionId: questionId },
      });
    });
  });

  /**
   * Test suite for fetching responses by project
   */
  describe("getResponsesByProject", () => {
    it("should return responses for the given project", async () => {
      const projectId = 1;
      const mockResponses = [
        {
          responseId: 1,
          label: "response 01",
          projectId: 1,
          questionId: 1,
          optionId: null,
          responseIdParent: null,
        },
        {
          responseId: 1,
          label: "response 02",
          projectId: 1,
          questionId: 2,
          optionId: null,
          responseIdParent: null,
        },
      ];

      prisma.response.findMany.mockResolvedValue(mockResponses);

      const result = await responseService.getResponsesByProject(projectId);

      expect(prisma.response.findMany).toHaveBeenCalledWith({
        where: { projectId: projectId },
      });
      expect(result).toEqual(mockResponses);
    });

    it("should return an empty array if no responses match the projectId", async () => {
      const projectId = 999;

      prisma.response.findMany.mockResolvedValue([]);

      const result = await responseService.getResponsesByProject(projectId);

      expect(prisma.response.findMany).toHaveBeenCalledWith({
        where: { projectId: projectId },
      });
      expect(result).toEqual([]);
    });

    it("should throw an error if the project is not found", async () => {
      const projectId = 999;

      const mockError = new Error("Project not found");
      mockError.status = "P2025";

      prisma.response.findMany.mockRejectedValue(mockError);

      await expect(
        responseService.getResponsesByProject(projectId)
      ).rejects.toThrow("Project not found");

      expect(prisma.response.findMany).toHaveBeenCalledWith({
        where: { projectId: projectId },
      });
    });

    it("should throw an error if fetching fails", async () => {
      const projectId = 1;

      const mockError = new Error("Database error");
      prisma.response.findMany.mockRejectedValue(mockError);

      await expect(
        responseService.getResponsesByProject(projectId)
      ).rejects.toThrow("Database error");

      expect(prisma.response.findMany).toHaveBeenCalledWith({
        where: { projectId: projectId },
      });
    });
  });

  /**
   * Test suite for fetching sub-responses by parent
   */
  describe("getSubresponses", () => {
    it("should return responses for the given responseIdParent", async () => {
      const responseIdParent = 1;
      const mockResponses = [
        {
          responseId: 2,
          label: "Response 1?",
          projectId: 1,
          questionId: 1,
          optionId: null,
          responseIdParent: 1,
        },
        {
          responseId: 3,
          label: "Response 1?",
          projectId: 1,
          questionId: 1,
          optionId: null,
          responseIdParent: 1,
        },
      ];

      prisma.response.findMany.mockResolvedValue(mockResponses);

      const result = await responseService.getSubResponses(responseIdParent);

      expect(prisma.response.findMany).toHaveBeenCalledWith({
        where: { responseIdParent: responseIdParent },
      });
      expect(result).toEqual(mockResponses);
    });

    it("should return an empty array if no responses match the responseIdParent", async () => {
      const responseIdParent = 999;

      prisma.response.findMany.mockResolvedValue([]);

      const result = await responseService.getSubResponses(responseIdParent);

      expect(prisma.response.findMany).toHaveBeenCalledWith({
        where: { responseIdParent: responseIdParent },
      });
      expect(result).toEqual([]);
    });

    it("should throw an error if response parent is not found", async () => {
      const responseIdParent = 1;

      const mockError = new Error("ResponseParent not found");
      mockError.code = "P2025";

      prisma.response.findMany.mockRejectedValue(mockError);

      await expect(
        responseService.getSubResponses(responseIdParent)
      ).rejects.toThrow("ResponseParent not found");

      expect(prisma.response.findMany).toHaveBeenCalledWith({
        where: { responseIdParent: responseIdParent },
      });
    });

    it("should throw an error if fetching fails", async () => {
      const responseIdParent = 1;
      const mockError = new Error("Database error");

      prisma.response.findMany.mockRejectedValue(mockError);

      await expect(
        responseService.getSubResponses(responseIdParent)
      ).rejects.toThrow("Database error");

      expect(prisma.response.findMany).toHaveBeenCalledWith({
        where: { responseIdParent: responseIdParent },
      });
    });
  });
});
