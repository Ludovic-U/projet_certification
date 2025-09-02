const responseService = require("../../services/responseService");
const { prisma } = require("../../prisma/prismaClient");
const { checkIdExistence } = require("../../utils/checkIdExistence");

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

jest.mock("../../utils/checkIdExistence", () => ({
  checkIdExistence: jest.fn(),
}));

describe("Response Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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

      // Mock the existence check to pass
      checkIdExistence.mockResolvedValue(true);

      prisma.response.update.mockResolvedValue(mockUpdatedResponse);

      const result = await responseService.updateResponse(
        responseId,
        mockUpdateData
      );

      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.response,
        responseId,
        "Response not found"
      );
      expect(prisma.response.update).toHaveBeenCalledWith({
        where: { responseId: responseId },
        data: mockUpdateData,
      });
      expect(result).toEqual(mockUpdatedResponse);
    });

    it("should throw an error if the response does not exist", async () => {
      const responseId = 999;
      const mockUpdateData = {
        label: "Non-existent Response",
        projectId: 1,
        questionId: 1,
        optionId: null,
        responseIdParent: null,
      };

      // Mock the existence check to fail
      const mockError = new Error("Response not found");
      mockError.status = 404;
      checkIdExistence.mockRejectedValue(mockError);

      await expect(
        responseService.updateResponse(responseId, mockUpdateData)
      ).rejects.toThrow("Response not found");
      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.response,
        responseId,
        "Response not found"
      );
      expect(prisma.response.update).not.toHaveBeenCalled();
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

      // Mock the existence check to pass
      checkIdExistence.mockResolvedValue(true);

      const mockError = new Error("Database error");
      prisma.response.update.mockRejectedValue(mockError);

      await expect(
        responseService.updateResponse(responseId, mockUpdateData)
      ).rejects.toThrow("Database error");
      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.response,
        responseId,
        "Response not found"
      );
      expect(prisma.response.update).toHaveBeenCalledWith({
        where: { responseId: responseId },
        data: mockUpdateData,
      });
    });
  });

  describe("deleteResponse", () => {
    it("should delete the response", async () => {
      const responseId = 1;

      // Mock the existence check to pass
      checkIdExistence.mockResolvedValue(true);

      prisma.response.delete.mockResolvedValue({ responseId: responseId });

      const result = await responseService.deleteResponse(responseId);

      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.response,
        responseId,
        "Response not found"
      );
      expect(prisma.response.delete).toHaveBeenCalledWith({
        where: { responseId: responseId },
      });
      expect(result).toEqual({ responseId: responseId });
    });

    it("should throw an error if the Response does not exist", async () => {
      const responseId = 999;

      // Mock the existence check to fail
      const mockError = new Error("Response not found");
      mockError.status = 404;
      checkIdExistence.mockRejectedValue(mockError);

      await expect(responseService.deleteResponse(responseId)).rejects.toThrow(
        "Response not found"
      );
      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.response,
        responseId,
        "Response not found"
      );
      expect(prisma.response.delete).not.toHaveBeenCalled();
    });

    it("should throw an error if deletion fails", async () => {
      const responseId = 1;

      // Mock the existence check to pass
      checkIdExistence.mockResolvedValue(true);

      const mockError = new Error("Database error");
      prisma.response.delete.mockRejectedValue(mockError);

      await expect(responseService.deleteResponse(responseId)).rejects.toThrow(
        "Database error"
      );
      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.response,
        responseId,
        "Response not found"
      );
      expect(prisma.response.delete).toHaveBeenCalledWith({
        where: { responseId: responseId },
      });
    });
  });

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
  });

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

    it("should throw an error if the projectId is not found", async () => {
      const projectId = 999;

      // Mock the existence check to fail
      const mockError = new Error("Project not found");
      mockError.status = 404;
      checkIdExistence.mockRejectedValue(mockError);

      await expect(
        responseService.getResponsesByProject(projectId)
      ).rejects.toThrow("Project not found");
      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.response,
        projectId,
        "Project not found"
      );
      expect(prisma.response.findMany).not.toHaveBeenCalled();
    });

    it("should return an empty array if no responses match the projectId", async () => {
      const projectId = 999;

      // Mock the existence check to pass
      checkIdExistence.mockResolvedValue(true);

      prisma.response.findMany.mockResolvedValue([]);

      const result = await responseService.getResponsesByProject(projectId);

      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.response,
        projectId,
        "Project not found"
      );
      expect(prisma.response.findMany).toHaveBeenCalledWith({
        where: { projectId: projectId },
      });
      expect(result).toEqual([]);
    });

    it("should throw an error if fetching fails", async () => {
      const projectId = 1;

      // Mock the existence check to pass
      checkIdExistence.mockResolvedValue(true);

      const mockError = new Error("Database error");
      prisma.response.findMany.mockRejectedValue(mockError);

      await expect(
        responseService.getResponsesByProject(projectId)
      ).rejects.toThrow("Database error");
      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.response,
        projectId,
        "Project not found"
      );
      expect(prisma.response.findMany).toHaveBeenCalledWith({
        where: { projectId: projectId },
      });
    });
  });

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
