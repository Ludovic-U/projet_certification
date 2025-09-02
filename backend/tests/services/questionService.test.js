/**
 * @fileoverview
 * Unit tests for the Question Service.
 * Covers CRUD operations and query methods for questions.
 * Uses Jest and mocks the prismaClient.
 */

const questionService = require("../../services/questionService");
const { prisma } = require("../../prisma/prismaClient");

// Mock the prisma methods to isolate service logic
jest.mock("../../prisma/prismaClient", () => ({
  prisma: {
    question: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    project: { findUnique: jest.fn() },
    type: { findUnique: jest.fn() },
  },
}));

describe("Question Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test suite for creating questions
   */
  describe("createQuestion", () => {
    it("should create and return a new question", async () => {
      const mockQuestionData = {
        label: "Question test ?",
        category: "General",
        numberOfSelectionableOpt: 0,
        isRelevant: true,
        hasMultipleOpenResponse: false,
        questionIdParent: null,
      };
      const mockCreatedQuestion = { questionId: 1, ...mockQuestionData };

      prisma.question.create.mockResolvedValue(mockCreatedQuestion);

      const result = await questionService.createQuestion(mockQuestionData);

      expect(prisma.question.create).toHaveBeenCalledWith({
        data: mockQuestionData,
      });
      expect(result).toEqual(mockCreatedQuestion);
    });

    it("should handle empty data gracefully", async () => {
      const mockError = new Error("Invalid data");

      prisma.question.create.mockRejectedValue(mockError);

      await expect(questionService.createQuestion({})).rejects.toThrow(
        "Invalid data"
      );

      expect(prisma.question.create).toHaveBeenCalledWith({ data: {} });
    });

    it("should throw an error if creation fails", async () => {
      const mockQuestionData = {
        label: "Question test ?",
        category: "General",
        numberOfSelectionableOpt: 0,
        isRelevant: true,
        hasMultipleOpenResponse: false,
        questionIdParent: null,
      };
      const mockError = new Error("Database error");

      prisma.question.create.mockRejectedValue(mockError);

      await expect(
        questionService.createQuestion(mockQuestionData)
      ).rejects.toThrow("Database error");

      expect(prisma.question.create).toHaveBeenCalledWith({
        data: mockQuestionData,
      });
    });
  });

  /**
   * Test suite for fetching questions
   */
  describe("getAllQuestions", () => {
    it("should return a list of questions", async () => {
      const mockQuestions = [
        {
          questionId: 1,
          label: "Question 1?",
          category: "General",
          numberOfSelectionableOpt: 0,
          isRelevant: true,
          hasMultipleOpenResponse: false,
          questionIdParent: null,
        },
        {
          questionId: 2,
          label: "Question 2?",
          category: "Specific",
          numberOfSelectionableOpt: 2,
          isRelevant: false,
          hasMultipleOpenResponse: true,
          questionIdParent: null,
        },
      ];

      prisma.question.findMany.mockResolvedValue(mockQuestions);

      const result = await questionService.getAllQuestions();

      expect(prisma.question.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockQuestions);
    });

    it("should throw an error if fetching fails", async () => {
      const mockError = new Error("Database error");

      prisma.question.findMany.mockRejectedValue(mockError);

      await expect(questionService.getAllQuestions()).rejects.toThrow(
        "Database error"
      );

      expect(prisma.question.findMany).toHaveBeenCalled();
    });
  });

  /**
   * Test suite for updating questions
   */
  describe("updateQuestion", () => {
    it("should update and return the updated question", async () => {
      const questionId = 1;
      const mockUpdateData = {
        label: "Updated Question?",
        category: "Updated Category",
        numberOfSelectionableOpt: 1,
        isRelevant: false,
        hasMultipleOpenResponse: true,
        questionIdParent: null,
      };
      const mockUpdatedQuestion = { questionId: questionId, ...mockUpdateData };

      prisma.question.update.mockResolvedValue(mockUpdatedQuestion);

      const result = await questionService.updateQuestion(
        questionId,
        mockUpdateData
      );

      expect(prisma.question.update).toHaveBeenCalledWith({
        where: { questionId: questionId },
        data: mockUpdateData,
      });
      expect(result).toEqual(mockUpdatedQuestion);
    });

    it("should throw an error if the question is not found", async () => {
      const questionId = 999;
      const mockUpdateData = {
        label: "Non-existent Question?",
        category: "None",
        numberOfSelectionableOpt: 0,
        isRelevant: false,
        hasMultipleOpenResponse: false,
        shouldMultiply: false,
        questionIdParent: null,
      };
      const mockError = new Error("Question not found");
      mockError.code = "P2025";

      prisma.question.update.mockRejectedValue(mockError);

      await expect(
        questionService.updateQuestion(questionId, mockUpdateData)
      ).rejects.toThrow("Question not found");

      expect(prisma.question.update).toHaveBeenCalledWith({
        where: { questionId },
        data: mockUpdateData,
      });
    });

    it("should throw an error if update fails", async () => {
      const questionId = 1;
      const mockUpdateData = {
        label: "Failed Update?",
        category: "Error",
        numberOfSelectionableOpt: 0,
        isRelevant: false,
        hasMultipleOpenResponse: false,
        shouldMultiply: false,
        questionIdParent: null,
      };
      const mockError = new Error("Database error");

      prisma.question.update.mockRejectedValue(mockError);

      await expect(
        questionService.updateQuestion(questionId, mockUpdateData)
      ).rejects.toThrow("Database error");

      expect(prisma.question.update).toHaveBeenCalledWith({
        where: { questionId: questionId },
        data: mockUpdateData,
      });
    });
  });

  /**
   * Test suite for deleting questions
   */
  describe("deleteQuestion", () => {
    it("should delete the question", async () => {
      const questionId = 1;

      prisma.question.delete.mockResolvedValue({ questionId: questionId });

      const result = await questionService.deleteQuestion(questionId);

      expect(prisma.question.delete).toHaveBeenCalledWith({
        where: { questionId: questionId },
      });
      expect(result).toEqual({ questionId: questionId });
    });

    it("should throw an error if the question is not found", async () => {
      const questionId = 999;
      const mockError = new Error("Question not found");
      mockError.code = "P2025";

      prisma.question.delete.mockRejectedValue(mockError);

      await expect(questionService.deleteQuestion(questionId)).rejects.toThrow(
        "Question not found"
      );

      expect(prisma.question.delete).toHaveBeenCalledWith({
        where: { questionId: questionId },
      });
    });

    it("should throw an error if deletion fails", async () => {
      const questionId = 1;
      const mockError = new Error("Database error");

      prisma.question.delete.mockRejectedValue(mockError);

      await expect(questionService.deleteQuestion(questionId)).rejects.toThrow(
        "Database error"
      );

      expect(prisma.question.delete).toHaveBeenCalledWith({
        where: { questionId: questionId },
      });
    });
  });

  /**
   * Test suite for fetching questions by ID
   */
  describe("getQuestionById", () => {
    it("should return the question if found", async () => {
      const questionId = 1;
      const mockQuestion = {
        id: questionId,
        label: "Sample Question",
        category: "General",
        numberOfSelectionableOpt: 0,
        isRelevant: true,
        hasMultipleOpenResponse: false,
        shouldMultiply: false,
        questionIdParent: null,
      };

      prisma.question.findUnique.mockResolvedValue(mockQuestion);

      const result = await questionService.getQuestionById(questionId);

      expect(prisma.question.findUnique).toHaveBeenCalledWith({
        where: { questionId: questionId },
        include: { projects: true, types: true },
      });
      expect(result).toEqual(mockQuestion);
    });

    it("should throw an error if the question is not found", async () => {
      prisma.question.findUnique.mockResolvedValue(null);

      await expect(questionService.getQuestionById(999)).rejects.toThrow(
        "Question not found"
      );
    });

    it("should throw an error if fetching fails", async () => {
      const questionId = 1;
      const mockError = new Error("Database error");

      prisma.question.findUnique.mockRejectedValue(mockError);

      await expect(questionService.getQuestionById(questionId)).rejects.toThrow(
        "Database error"
      );

      expect(prisma.question.findUnique).toHaveBeenCalledWith({
        where: { questionId: questionId },
        include: { projects: true, types: true },
      });
    });
  });

  /**
   * Test suite for fetching questions by project
   */
  describe("getQuestionsByProject", () => {
    it("should return questions for the given project", async () => {
      const projectId = 1;
      const mockProject = {
        projectId,
        questions: [{ questionId: 1, text: "Project question 1" }],
        types: [
          {
            projectTypes: [
              { questions: [{ questionId: 2, text: "Type question 1" }] },
            ],
          },
        ],
      };

      prisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await questionService.getQuestionsByProject(projectId);

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { projectId: projectId },
        include: {
          questions: true,
          types: {
            include: {
              projectTypes: {
                where: { projectId },
                include: { questions: true },
              },
            },
          },
        },
      });
      expect(result).toEqual([
        { questionId: 1, text: "Project question 1" },
        { questionId: 2, text: "Type question 1" },
      ]);
    });

    it("should return an empty array if no questions found", async () => {
      const projectId = 1;

      prisma.project.findUnique.mockResolvedValue({
        projectId,
        questions: [],
        types: [],
      });

      const result = await questionService.getQuestionsByProject(projectId);

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { projectId: projectId },
        include: {
          questions: true,
          types: {
            include: {
              projectTypes: {
                where: { projectId },
                include: { questions: true },
              },
            },
          },
        },
      });
      expect(result).toEqual([]);
    });

    it("should thow an error if the project is not found", async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(questionService.getQuestionsByProject(999)).rejects.toThrow(
        "Project not found"
      );
    });

    it("should throw an error if fetching fails", async () => {
      const projectId = 1;
      const mockError = new Error("Database error");

      prisma.project.findUnique.mockRejectedValue(mockError);

      await expect(
        questionService.getQuestionsByProject(projectId)
      ).rejects.toThrow("Database error");

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { projectId: projectId },
        include: {
          questions: true,
          types: {
            include: {
              projectTypes: {
                where: { projectId },
                include: { questions: true },
              },
            },
          },
        },
      });
    });
  });

  /**
   * Test suite for fetching questions by category
   */
  describe("getQuestionsByCategory", () => {
    it("should return questions for the given category", async () => {
      const category = "General";
      const mockQuestions = [
        { questionId: 1, label: "Question 1" },
        { questionId: 2, label: "Question 2" },
      ];

      prisma.question.findMany.mockResolvedValue(mockQuestions);

      const result = await questionService.getQuestionsByCategory(category);

      expect(prisma.question.findMany).toHaveBeenCalledWith({
        where: { category: category },
      });
      expect(result).toEqual(mockQuestions);
    });

    it("should return an empty array if no questions match the category", async () => {
      const category = "emptyCategory";

      prisma.question.findMany.mockResolvedValue([]);

      const result = await questionService.getQuestionsByCategory(category);

      expect(prisma.question.findMany).toHaveBeenCalledWith({
        where: { category: category },
      });
      expect(result).toEqual([]);
    });

    it("should throw an error if fetching fails", async () => {
      const category = "General";
      const mockError = new Error("Database error");

      prisma.question.findMany.mockRejectedValue(mockError);

      await expect(
        questionService.getQuestionsByCategory(category)
      ).rejects.toThrow("Database error");

      expect(prisma.question.findMany).toHaveBeenCalledWith({
        where: { category: category },
      });
    });
  });

  /**
   * Test suite for fetching questions by type
   */
  describe("getQuestionsByType", () => {
    it("should return questions for the given typeId", async () => {
      const typeId = 1;
      const mockType = {
        typeId: typeId,
        questions: [
          { questionId: 1, label: "Question 1" },
          { questionId: 2, label: "Question 2" },
        ],
      };

      prisma.type.findUnique.mockResolvedValue(mockType);

      const result = await questionService.getQuestionsByType(typeId);

      expect(prisma.type.findUnique).toHaveBeenCalledWith({
        where: { typeId: typeId },
        include: { questions: true },
      });
      expect(result).toEqual([
        { questionId: 1, label: "Question 1" },
        { questionId: 2, label: "Question 2" },
      ]);
    });

    it("should return an empty array if no questions match the typeId", async () => {
      const typeId = 1;
      const mockType = {
        typeId: typeId,
        questions: [],
      };

      prisma.type.findUnique.mockResolvedValue(mockType);

      const result = await questionService.getQuestionsByType(typeId);

      expect(prisma.type.findUnique).toHaveBeenCalledWith({
        where: { typeId: typeId },
        include: { questions: true },
      });
      expect(result).toEqual([]);
    });

    it("should throw an error if the type is not found", async () => {
      prisma.type.findUnique.mockResolvedValue(null);

      await expect(questionService.getQuestionsByType(999)).rejects.toThrow(
        "Type not found"
      );
    });

    it("should throw an error if fetching fails", async () => {
      const typeId = 1;
      const mockError = new Error("Database error");

      prisma.type.findUnique.mockRejectedValue(mockError);

      await expect(questionService.getQuestionsByType(typeId)).rejects.toThrow(
        "Database error"
      );

      expect(prisma.type.findUnique).toHaveBeenCalledWith({
        where: { typeId: typeId },
        include: { questions: true },
      });
    });
  });

  /**
   * Test suite for fecthing sub-questions by parent
   */
  describe("getSubQuestions", () => {
    it("should return questions for the given questionIdParent", async () => {
      const questionIdParent = 1;
      const mockQuestionParent = {
        questionId: questionIdParent,
        children: [
          { questionId: 1, label: "Question 1" },
          { questionId: 2, label: "Question 2" },
        ],
      };

      prisma.question.findUnique.mockResolvedValue(mockQuestionParent);

      const result = await questionService.getSubQuestions(questionIdParent);

      expect(prisma.question.findUnique).toHaveBeenCalledWith({
        where: { questionIdParent: questionIdParent },
        include: { children: true },
      });
      expect(result).toEqual([
        { questionId: 1, label: "Question 1" },
        { questionId: 2, label: "Question 2" },
      ]);
    });

    it("should return an empty array if no questions match the questionIdParent", async () => {
      const questionIdParent = 1;
      const mockQuestionParent = {
        questionId: questionIdParent,
        children: [],
      };

      prisma.question.findUnique.mockResolvedValue(mockQuestionParent);

      const result = await questionService.getSubQuestions(questionIdParent);

      expect(prisma.question.findUnique).toHaveBeenCalledWith({
        where: { questionIdParent: questionIdParent },
        include: { children: true },
      });
      expect(result).toEqual([]);
    });

    it("should throw an error if the question parent is not found", async () => {
      prisma.question.findUnique.mockResolvedValue(null);

      await expect(questionService.getSubQuestions(999)).rejects.toThrow(
        "QuestionParent not found"
      );
    });

    it("should throw an error if fetching fails", async () => {
      const questionIdParent = 1;
      const mockError = new Error("Database error");

      prisma.question.findUnique.mockRejectedValue(mockError);

      await expect(
        questionService.getSubQuestions(questionIdParent)
      ).rejects.toThrow("Database error");

      expect(prisma.question.findUnique).toHaveBeenCalledWith({
        where: { questionIdParent: questionIdParent },
        include: { children: true },
      });
    });
  });
});
