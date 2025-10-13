/**
 * @fileoverview
 * Unit tests for the Response Service.
 *
 * @module responseService.test
 *
 * @description
 * Tests all service methods related to responses, including:
 *  - createResponse
 *  - getResponse(s)
 *  - updateResponse
 *  - deleteResponse
 *  - query methods by various parameters
 *
 * Uses Jest and mocks:
 *  - prismaClient to simulate database operations
 *
 * @example
 * // Run all tests for this service
 * // npx jest tests/services/responseService.test.js
 *
 * @tests
 * - Creating a response with valid/invalid payloads
 * - Fetching responses by ID or filters
 * - Updating responses
 * - Deleting responses
 * - Handling errors thrown by the database client
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
    project: { findUnique: jest.fn() },
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
    it("should return responses for the given question directly tied to a project", async () => {
      const projectId = 1;
      const questionId = 1;
      const mockProject = {
        questions: [
          {
            responses: [
              {
                responseId: 1,
                label: "Answer 01",
                projectId: 1,
                questionId: 1,
              },
              {
                responseId: 2,
                label: "Answer 02",
                projectId: 1,
                questionId: 1,
              },
            ],
          },
        ],
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await responseService.getResponsesByQuestionOfProject(
        projectId,
        questionId
      );

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { projectId: projectId },
        select: {
          questions: {
            where: { questionId: questionId },
            select: { responses: { include: { children: true } } },
          },
          types: {
            select: {
              questions: {
                where: { questionId: questionId },
                select: { responses: { include: { children: true } } },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockProject.questions[0].responses);
    });

    it("should return responses for the given question tied by type to a project", async () => {
      const projectId = 1;
      const questionId = 1;
      const mockProject = {
        questions: [],
        types: [
          {
            questions: [
              {
                responses: [
                  {
                    responseId: 1,
                    label: "Answer 01",
                    projectId: 1,
                    questionId: 1,
                  },
                ],
              },
            ],
          },
        ],
      };
      prisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await responseService.getResponsesByQuestionOfProject(
        projectId,
        questionId
      );

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { projectId: projectId },
        select: {
          questions: {
            where: { questionId: questionId },
            select: { responses: { include: { children: true } } },
          },
          types: {
            select: {
              questions: {
                where: { questionId: questionId },
                select: { responses: { include: { children: true } } },
              },
            },
          },
        },
      });
      expect(result).toEqual(mockProject.types[0].questions[0].responses);
    });

    it("should throw an error if project does not exist", async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(
        responseService.getResponsesByQuestionOfProject(999, 1)
      ).rejects.toThrow("Project not found");
    });

    it("should throw an error if question does not exist", async () => {
      prisma.project.findUnique.mockResolvedValue({ questions: [] });

      await expect(
        responseService.getResponsesByQuestionOfProject(1, 999)
      ).rejects.toThrow("Question not found");
    });

    it("should return an empty array if no responses found for the question", async () => {
      const projectId = 1;
      const questionId = 1;
      const mockProject = { questions: [{ responses: [] }] };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await responseService.getResponsesByQuestionOfProject(
        projectId,
        questionId
      );

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { projectId: projectId },
        select: {
          questions: {
            where: { questionId: questionId },
            select: { responses: { include: { children: true } } },
          },
          types: {
            select: {
              questions: {
                where: { questionId: questionId },
                select: { responses: { include: { children: true } } },
              },
            },
          },
        },
      });
      expect(result).toEqual([]);
    });

    it("should throw an error if fetching fails", async () => {
      const projectId = 1;
      const questionId = 1;
      const mockError = new Error("Database error");

      prisma.project.findUnique.mockRejectedValue(mockError);

      await expect(
        responseService.getResponsesByQuestionOfProject(projectId, questionId)
      ).rejects.toThrow("Database error");

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { projectId: projectId },
        select: {
          questions: {
            where: { questionId: questionId },
            select: { responses: { include: { children: true } } },
          },
          types: {
            select: {
              questions: {
                where: { questionId: questionId },
                select: { responses: { include: { children: true } } },
              },
            },
          },
        },
      });
    });
  });

  /**
   * Test suite for fetching responses by project
   */
  describe("getResponsesByProject", () => {
    it("should return responses for the given project", async () => {
      const projectId = 1;
      const mockProject = {
        projectId: projectId,
        responses: [
          { responseId: 1, label: "response 01", projectId: 1 },
          { responseId: 2, label: "response 02", projectId: 1 },
        ],
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await responseService.getResponsesByProject(projectId);

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { projectId: projectId },
        include: { responses: true },
      });
      expect(result).toEqual([
        { responseId: 1, label: "response 01", projectId: 1 },
        { responseId: 2, label: "response 02", projectId: 1 },
      ]);
    });

    it("should throw an error if the project is not found", async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(responseService.getResponsesByProject(999)).rejects.toThrow(
        "Project not found"
      );
    });

    it("should return an empty array if no responses match the projectId", async () => {
      const projectId = 1;
      const mockProject = {
        projectId: projectId,
        responses: [],
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await responseService.getResponsesByProject(projectId);

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { projectId: projectId },
        include: { responses: true },
      });
      expect(result).toEqual([]);
    });

    it("should throw an error if fetching fails", async () => {
      const projectId = 1;
      const mockError = new Error("Database error");
      prisma.project.findUnique.mockRejectedValue(mockError);

      await expect(
        responseService.getResponsesByProject(projectId)
      ).rejects.toThrow("Database error");

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { projectId: projectId },
        include: { responses: true },
      });
    });
  });

  /**
   * Test suite for fetching sub-responses by parent
   */
  describe("getSubresponses", () => {
    it("should return responses for the given responseIdParent", async () => {
      const responseIdParent = 1;
      const mockResponseParent = {
        responseId: responseIdParent,
        children: [
          { responseId: 2, label: "Response 2", responseIdParent: 1 },
          { responseId: 3, label: "Response 3", responseIdParent: 1 },
        ],
      };

      prisma.response.findUnique.mockResolvedValue(mockResponseParent);

      const result = await responseService.getSubResponses(responseIdParent);

      expect(prisma.response.findUnique).toHaveBeenCalledWith({
        where: { responseId: responseIdParent },
        include: { children: true },
      });
      expect(result).toEqual([
        { responseId: 2, label: "Response 2", responseIdParent: 1 },
        { responseId: 3, label: "Response 3", responseIdParent: 1 },
      ]);
    });

    it("should return an empty array if no responses match the responseIdParent", async () => {
      const responseIdParent = 1;
      const mockResponseParent = {
        responseId: responseIdParent,
        children: [],
      };

      prisma.response.findUnique.mockResolvedValue(mockResponseParent);

      const result = await responseService.getSubResponses(responseIdParent);

      expect(prisma.response.findUnique).toHaveBeenCalledWith({
        where: { responseId: responseIdParent },
        include: { children: true },
      });
      expect(result).toEqual([]);
    });

    it("should throw an error if the response parent is not found", async () => {
      prisma.response.findUnique.mockResolvedValue(null);

      await expect(responseService.getSubResponses(999)).rejects.toThrow(
        "ResponseParent not found"
      );
    });

    it("should throw an error if fetching fails", async () => {
      const responseIdParent = 1;
      const mockError = new Error("Database error");

      prisma.response.findUnique.mockRejectedValue(mockError);

      await expect(
        responseService.getSubResponses(responseIdParent)
      ).rejects.toThrow("Database error");

      expect(prisma.response.findUnique).toHaveBeenCalledWith({
        where: { responseId: responseIdParent },
        include: { children: true },
      });
    });
  });
});
