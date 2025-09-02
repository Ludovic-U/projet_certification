const questionService = require("../../services/questionService");
const { prisma } = require("../../prisma/prismaClient");
const { checkIdExistence } = require("../../utils/checkIdExistence");

jest.mock("../../prisma/prismaClient", () => ({
  prisma: {
    question: {
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

describe("Question Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createQuestion", () => {
    it("should create and return a new question", async () => {
      const mockQuestionData = {
        label: "Question test ?",
        category: "General",
        numberOfSelectionableOpt: 0,
        isRelevant: true,
        hasMultipleResponse: false,
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

    it("should throw an error if creation fails", async () => {
      const mockQuestionData = {
        label: "Question test ?",
        category: "General",
        numberOfSelectionableOpt: 0,
        isRelevant: true,
        hasMultipleResponse: false,
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

    it("should handle empty data gracefully", async () => {
      const mockError = new Error("Invalid data");

      prisma.question.create.mockRejectedValue(mockError);

      await expect(questionService.createQuestion({})).rejects.toThrow(
        "Invalid data"
      );
      expect(prisma.question.create).toHaveBeenCalledWith({ data: {} });
    });
  });

  describe("getAllQuestions", () => {
    it("should return a list of questions", async () => {
      const mockQuestions = [
        {
          questionId: 1,
          label: "Question 1?",
          category: "General",
          numberOfSelectionableOpt: 0,
          isRelevant: true,
          hasMultipleResponse: false,
          questionIdParent: null,
        },
        {
          questionId: 2,
          label: "Question 2?",
          category: "Specific",
          numberOfSelectionableOpt: 2,
          isRelevant: false,
          hasMultipleResponse: true,
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

  describe("updateQuestion", () => {
    it("should update and return the updated question", async () => {
      const questionId = 1;
      const mockUpdateData = {
        label: "Updated Question?",
        category: "Updated Category",
        numberOfSelectionableOpt: 1,
        isRelevant: false,
        hasMultipleResponse: true,
        questionIdParent: null,
      };
      const mockUpdatedQuestion = { questionId: questionId, ...mockUpdateData };

      // Mock the existence check to pass
      checkIdExistence.mockResolvedValue(true);

      prisma.question.update.mockResolvedValue(mockUpdatedQuestion);

      const result = await questionService.updateQuestion(
        questionId,
        mockUpdateData
      );

      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.question,
        questionId,
        "Question not found"
      );
      expect(prisma.question.update).toHaveBeenCalledWith({
        where: { questionId: questionId },
        data: mockUpdateData,
      });
      expect(result).toEqual(mockUpdatedQuestion);
    });

    it("should throw an error if the question does not exist", async () => {
      const questionId = 999;
      const mockUpdateData = {
        label: "Non-existent Question?",
        category: "None",
        numberOfSelectionableOpt: 0,
        isRelevant: false,
        hasMultipleResponse: false,
        questionIdParent: null,
      };

      // Mock the existence check to fail
      const mockError = new Error("Question not found");
      mockError.status = 404;
      checkIdExistence.mockRejectedValue(mockError);

      await expect(
        questionService.updateQuestion(questionId, mockUpdateData)
      ).rejects.toThrow("Question not found");
      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.question,
        questionId,
        "Question not found"
      );
      expect(prisma.question.update).not.toHaveBeenCalled();
    });

    it("should throw an error if update fails", async () => {
      const questionId = 1;
      const mockUpdateData = {
        label: "Failed Update?",
        category: "Error",
        numberOfSelectionableOpt: 0,
        isRelevant: false,
        hasMultipleResponse: false,
        questionIdParent: null,
      };

      // Mock the existence check to pass
      checkIdExistence.mockResolvedValue(true);

      const mockError = new Error("Database error");

      prisma.question.update.mockRejectedValue(mockError);

      await expect(
        questionService.updateQuestion(questionId, mockUpdateData)
      ).rejects.toThrow("Database error");
      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.question,
        questionId,
        "Question not found"
      );
      expect(prisma.question.update).toHaveBeenCalledWith({
        where: { questionId: questionId },
        data: mockUpdateData,
      });
    });
  });

  describe("deleteQuestion", () => {
    it("should delete the question", async () => {
      const questionId = 1;

      // Mock the existence check to pass
      checkIdExistence.mockResolvedValue(true);

      prisma.question.delete.mockResolvedValue({ questionId: questionId });

      const result = await questionService.deleteQuestion(questionId);

      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.question,
        questionId,
        "Question not found"
      );
      expect(prisma.question.delete).toHaveBeenCalledWith({
        where: { questionId: questionId },
      });
      expect(result).toEqual({ questionId: questionId });
    });

    it("should throw an error if the question does not exist", async () => {
      const questionId = 999;

      // Mock the existence check to fail
      const mockError = new Error("Question not found");
      mockError.status = 404;
      checkIdExistence.mockRejectedValue(mockError);

      await expect(questionService.deleteQuestion(questionId)).rejects.toThrow(
        "Question not found"
      );
      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.question,
        questionId,
        "Question not found"
      );
      expect(prisma.question.delete).not.toHaveBeenCalled();
    });

    it("should throw an error if deletion fails", async () => {
      const questionId = 1;

      // Mock the existence check to pass
      checkIdExistence.mockResolvedValue(true);

      const mockError = new Error("Database error");

      prisma.question.delete.mockRejectedValue(mockError);

      await expect(questionService.deleteQuestion(questionId)).rejects.toThrow(
        "Database error"
      );
      expect(checkIdExistence).toHaveBeenCalledWith(
        prisma.question,
        questionId,
        "Question not found"
      );
      expect(prisma.question.delete).toHaveBeenCalledWith({
        where: { questionId: questionId },
      });
    });
  });

  describe("getQuestionById", () => {
    it("should return the question if found", async () => {
      const questionId = 1;
      const mockQuestion = {
        id: questionId,
        label: "Sample Question?",
        category: "General",
        numberOfSelectionableOpt: 0,
        isRelevant: true,
        hasMultipleResponse: false,
        questionIdParent: null,
      };

      prisma.question.findUnique.mockResolvedValue(mockQuestion);

      const result = await questionService.getQuestionById(questionId);

      expect(prisma.question.findUnique).toHaveBeenCalledWith({
        where: { questionId: questionId },
      });
      expect(result).toEqual(mockQuestion);
    });

    it("should throw an error if the question is not found", async () => {
      const questionId = 999;

      prisma.question.findUnique.mockResolvedValue(null);

      await expect(questionService.getQuestionById(questionId)).rejects.toThrow(
        "Question not found"
      );
      expect(prisma.question.findUnique).toHaveBeenCalledWith({
        where: { questionId: questionId },
      });
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
      });
    });
  });

  // TODO: Add tests for getQuestionsByProject when implemented

  describe("getQuestionsByCategory", () => {
    it("should return questions for the given category", async () => {
      const category = "General";
      const mockQuestions = [
        {
          questionId: 1,
          label: "Question 1?",
          category: "General",
          numberOfSelectionableOpt: 0,
          isRelevant: true,
          hasMultipleResponse: false,
          questionIdParent: null,
        },
        {
          questionId: 2,
          label: "Question 2?",
          category: "General",
          numberOfSelectionableOpt: 2,
          isRelevant: false,
          hasMultipleResponse: true,
          questionIdParent: null,
        },
      ];

      prisma.question.findMany.mockResolvedValue(mockQuestions);

      const result = await questionService.getQuestionsByCategory(category);

      expect(prisma.question.findMany).toHaveBeenCalledWith({
        where: { category: category },
      });
      expect(result).toEqual(mockQuestions);
    });

    it("should return an empty array if no questions match the category", async () => {
      const category = "NonExistentCategory";

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

  describe("getQuestionsByType", () => {
    it("should return questions for the given typeId", async () => {
      const typeId = 1;
      const mockQuestions = [
        {
          questionId: 1,
          label: "Question 1?",
          category: "General",
          numberOfSelectionableOpt: 0,
          isRelevant: true,
          hasMultipleResponse: false,
          questionIdParent: null,
        },
        {
          questionId: 2,
          label: "Question 2?",
          category: "Specific",
          numberOfSelectionableOpt: 2,
          isRelevant: false,
          hasMultipleResponse: true,
          questionIdParent: null,
        },
      ];

      prisma.question.findMany.mockResolvedValue(mockQuestions);

      const result = await questionService.getQuestionsByType(typeId);

      expect(prisma.question.findMany).toHaveBeenCalledWith({
        where: { types: { some: { typeId: typeId } } },
      });
      expect(result).toEqual(mockQuestions);
    });

    it("should return an empty array if no questions match the typeId", async () => {
      const typeId = 999;

      prisma.question.findMany.mockResolvedValue([]);

      const result = await questionService.getQuestionsByType(typeId);

      expect(prisma.question.findMany).toHaveBeenCalledWith({
        where: { types: { some: { typeId: typeId } } },
      });
      expect(result).toEqual([]);
    });

    it("should throw an error if fetching fails", async () => {
      const typeId = 1;
      const mockError = new Error("Database error");

      prisma.question.findMany.mockRejectedValue(mockError);

      await expect(questionService.getQuestionsByType(typeId)).rejects.toThrow(
        "Database error"
      );
      expect(prisma.question.findMany).toHaveBeenCalledWith({
        where: { types: { some: { typeId: typeId } } },
      });
    });
  });

  describe("getSubQuestions", () => {
    it("should return questions for the given questionIdParent", async () => {
      const questionIdParent = 1;
      const mockQuestions = [
        {
          questionId: 1,
          label: "Question 1?",
          category: "General",
          numberOfSelectionableOpt: 0,
          isRelevant: true,
          hasMultipleResponse: false,
          questionIdParent: 1,
        },
        {
          questionId: 2,
          label: "Question 2?",
          category: "Specific",
          numberOfSelectionableOpt: 2,
          isRelevant: false,
          hasMultipleResponse: true,
          questionIdParent: 1,
        },
      ];

      prisma.question.findMany.mockResolvedValue(mockQuestions);

      const result = await questionService.getSubQuestions(questionIdParent);

      expect(prisma.question.findMany).toHaveBeenCalledWith({
        where: { questionIdParent: questionIdParent },
      });
      expect(result).toEqual(mockQuestions);
    });

    it("should return an empty array if no questions match the questionIdParent", async () => {
      const questionIdParent = 999;

      prisma.question.findMany.mockResolvedValue([]);

      const result = await questionService.getSubQuestions(questionIdParent);

      expect(prisma.question.findMany).toHaveBeenCalledWith({
        where: { questionIdParent: questionIdParent },
      });
      expect(result).toEqual([]);
    });

    it("should throw an error if fetching fails", async () => {
      const questionIdParent = 1;
      const mockError = new Error("Database error");

      prisma.question.findMany.mockRejectedValue(mockError);

      await expect(
        questionService.getSubQuestions(questionIdParent)
      ).rejects.toThrow("Database error");
      expect(prisma.question.findMany).toHaveBeenCalledWith({
        where: { questionIdParent: questionIdParent },
      });
    });
  });
});
