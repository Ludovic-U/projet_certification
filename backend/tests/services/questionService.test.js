const questionService = require("../../services/questionService");
const { prisma } = require("../../prisma/prismaClient");

jest.mock("../../prisma/prismaClient", () => ({
  prisma: {
    question: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("Question Service - createQuestion", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create and return a new question", async () => {
    const mockQuestionData = {
      label: "Question test ?",
      category: "General",
      numberOfSelectionableOpt: 0,
      isRelevant: true,
      hasMultipleResponse: false,
      questionIdParent: null,
    };

    const mockCreatedQuestion = {
      id: 1,
      ...mockQuestionData,
    };

    prisma.question.create.mockResolvedValue(mockCreatedQuestion);

    const result = await questionService.createQuestion({
      data: mockQuestionData,
    });

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
      questionService.createQuestion({ data: mockQuestionData })
    ).rejects.toThrow("Database error");

    expect(prisma.question.create).toHaveBeenCalledWith({
      data: mockQuestionData,
    });
  });

  it("should handle empty data gracefully", async () => {
    const mockError = new Error("Invalid data");
    prisma.question.create.mockRejectedValue(mockError);

    await expect(questionService.createQuestion({ data: {} })).rejects.toThrow(
      "Invalid data"
    );

    expect(prisma.question.create).toHaveBeenCalledWith({ data: {} });
  });
});

describe("Question Service - getAllQuestions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return a list of questions", async () => {
    const mockQuestions = [
      {
        id: 1,
        label: "Question 1?",
        category: "General",
        numberOfSelectionableOpt: 0,
        isRelevant: true,
        hasMultipleResponse: false,
        questionIdParent: null,
      },
      {
        id: 2,
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
