const questionController = require("../../controllers/questionController");
const questionService = require("../../services/questionService");
const { createMockResponse } = require("../helpers/responseHelper");
const { expectError } = require("../helpers/errorHelper");

jest.mock("../../services/questionService");

describe("Question Controller - createQuestion", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {
      body: {
        label: "Sample Question",
        category: "General",
        numberOfSelectionableOpt: 2,
        isRelevant: true,
        hasMultipleResponse: false,
        questionIdParent: null,
      },
    };
    res = createMockResponse();
    next = jest.fn();
  });

  it("should create a question and return 201 status", async () => {
    const mockQuestion = { questionId: 1, ...req.body };
    questionService.createQuestion.mockResolvedValue(mockQuestion);

    await questionController.createQuestion(req, res, next);

    expect(questionService.createQuestion).toHaveBeenCalledWith({
      label: req.body.label,
      category: req.body.category,
      numberOfSelectionableOpt: req.body.numberOfSelectionableOpt,
      isRelevant: req.body.isRelevant,
      hasMultipleResponse: req.body.hasMultipleResponse,
      questionIdParent: req.body.questionIdParent,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockQuestion);
  });

  it("should handle service errors and return 500 status", async () => {
    await expectError(
      questionController.createQuestion,
      req,
      res,
      () =>
        questionService.createQuestion.mockRejectedValue(
          new Error("Database error")
        ),
      500,
      "Internal server error"
    );
    expect(questionService.createQuestion).toHaveBeenCalled();
  });
});

describe("Question Controller - getAllQuestions", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {};
    res = createMockResponse();
    next = jest.fn();
  });

  it("should fetch all questions and return 200 status", async () => {
    const mockQuestions = [
      { questionId: 1, label: "Question 1" },
      { questionId: 2, label: "Question 2" },
    ];
    questionService.getAllQuestions.mockResolvedValue(mockQuestions);

    await questionController.getAllQuestions(req, res, next);

    expect(questionService.getAllQuestions).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockQuestions);
  });

  it("should handle service errors and return 500 status", async () => {
    await expectError(
      questionController.getAllQuestions,
      req,
      res,
      () =>
        questionService.getAllQuestions.mockRejectedValue(
          new Error("Database error")
        ),
      500,
      "Internal server error"
    );
    expect(questionService.getAllQuestions).toHaveBeenCalled();
  });
});

describe("Question Controller - updateQuestion", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {
      params: { questionId: 1 },
      body: {
        label: "Updated Question",
        category: "Updated Category",
        numberOfSelectionableOpt: 3,
        isRelevant: false,
        hasMultipleResponse: true,
        questionIdParent: null,
      },
    };
    res = createMockResponse();
    next = jest.fn();
  });

  it("should udate a question and return 200 status", async () => {
    const mockUpdatedQuestion = { questionId: 1, ...req.body };
    questionService.updateQuestion.mockResolvedValue(mockUpdatedQuestion);

    await questionController.updateQuestion(req, res, next);

    expect(questionService.updateQuestion).toHaveBeenCalledWith(
      parseInt(req.params.questionId),
      {
        label: req.body.label,
        category: req.body.category,
        numberOfSelectionableOpt: req.body.numberOfSelectionableOpt,
        isRelevant: req.body.isRelevant,
        hasMultipleResponse: req.body.hasMultipleResponse,
        questionIdParent: req.body.questionIdParent,
      }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUpdatedQuestion);
  });

  it("should handle service errors and return 500 status", async () => {
    await expectError(
      questionController.updateQuestion,
      req,
      res,
      () =>
        questionService.updateQuestion.mockRejectedValue(
          new Error("Database error")
        ),
      500,
      "Internal server error"
    );
    expect(questionService.updateQuestion).toHaveBeenCalled();
  });

  it("should return 400 for invalid questionId", async () => {
    req.params.questionId = "invalid";
    await expectError(
      questionController.updateQuestion,
      req,
      res,
      () => {},
      400,
      "Bad request: Invalid questionId"
    );
    expect(questionService.updateQuestion).not.toHaveBeenCalled();
  });

  it("should return 404 if question not found", async () => {
    await expectError(
      questionController.updateQuestion,
      req,
      res,
      () => questionService.updateQuestion.mockRejectedValue({ status: 404 }),
      404,
      "Question not found"
    );
    expect(questionService.updateQuestion).toHaveBeenCalled();
  });
});

describe("Question Controller - deleteQuestion", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {
      params: { questionId: 1 },
    };
    res = createMockResponse();
    next = jest.fn();
  });

  it("should delete a question and return 204 status", async () => {
    questionService.deleteQuestion.mockResolvedValue();

    await questionController.deleteQuestion(req, res, next);

    expect(questionService.deleteQuestion).toHaveBeenCalledWith(
      parseInt(req.params.questionId)
    );
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("should handle service errors and return 500 status", async () => {
    await expectError(
      questionController.deleteQuestion,
      req,
      res,
      () =>
        questionService.deleteQuestion.mockRejectedValue(
          new Error("Database error")
        ),
      500,
      "Internal server error"
    );
    expect(questionService.deleteQuestion).toHaveBeenCalled();
  });

  it("should return 400 for invalid questionId", async () => {
    req.params.questionId = "invalid";
    await expectError(
      questionController.deleteQuestion,
      req,
      res,
      () => {},
      400,
      "Bad request: Invalid questionId"
    );
    expect(questionService.deleteQuestion).not.toHaveBeenCalled();
  });

  it("should return 404 if question not found", async () => {
    await expectError(
      questionController.deleteQuestion,
      req,
      res,
      () => questionService.deleteQuestion.mockRejectedValue({ status: 404 }),
      404,
      "Question not found"
    );
    expect(questionService.deleteQuestion).toHaveBeenCalled();
  });
});

describe("Question Contoller - getQuestionById", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {
      params: { questionId: 1 },
    };
    res = createMockResponse();
    next = jest.fn();
  });

  it("should fetch a question by ID and return 200 status", async () => {
    const mockQuestion = { questionId: 1, label: "Sample Question" };
    questionService.getQuestionById.mockResolvedValue(mockQuestion);

    await questionController.getQuestionById(req, res, next);

    expect(questionService.getQuestionById).toHaveBeenCalledWith(
      parseInt(req.params.questionId)
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockQuestion);
  });

  it("should handle service errors and return 500 status", async () => {
    await expectError(
      questionController.getQuestionById,
      req,
      res,
      () =>
        questionService.getQuestionById.mockRejectedValue(
          new Error("Database error")
        ),
      500,
      "Internal server error"
    );
    expect(questionService.getQuestionById).toHaveBeenCalled();
  });

  it("should return 400 for invalid questionId", async () => {
    req.params.questionId = "invalid";
    await expectError(
      questionController.getQuestionById,
      req,
      res,
      () => {},
      400,
      "Bad request: Invalid questionId"
    );
    expect(questionService.getQuestionById).not.toHaveBeenCalled();
  });

  it("should return 404 if question not found", async () => {
    await expectError(
      questionController.getQuestionById,
      req,
      res,
      () =>
        questionService.getQuestionById.mockRejectedValue({
          status: 404,
        }),
      404,
      "Question not found"
    );
    expect(questionService.getQuestionById).toHaveBeenCalled();
  });
});

// TODO: Add tests for getQuestionsByProject controller when implemented

describe("Question Controller - getQuestionsByCategory", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {
      params: { category: "General" },
    };
    res = createMockResponse();
    next = jest.fn();
  });

  it("should fetch questions by category and return 200 status", async () => {
    const mockQuestions = [
      { questionId: 1, label: "Question 1", category: "General" },
      { questionId: 2, label: "Question 2", category: "General" },
    ];
    questionService.getQuestionsByCategory.mockResolvedValue(mockQuestions);

    await questionController.getQuestionsByCategory(req, res, next);

    expect(questionService.getQuestionsByCategory).toHaveBeenCalledWith(
      req.params.category
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockQuestions);
  });

  it("should handle service errors and return 500 status", async () => {
    await expectError(
      questionController.getQuestionsByCategory,
      req,
      res,
      () =>
        questionService.getQuestionsByCategory.mockRejectedValue(
          new Error("Database error")
        ),
      500,
      "Internal server error"
    );
    expect(questionService.getQuestionsByCategory).toHaveBeenCalled();
  });
});

describe("Question Controller - getQuestionsByType", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {
      params: { typeId: 1 },
    };
    res = createMockResponse();
    next = jest.fn();
  });

  it("should fetch questions by type and return 200 status", async () => {
    const mockQuestions = [
      { questionId: 1, label: "Question 1", typeId: 1 },
      { questionId: 2, label: "Question 2", typeId: 1 },
    ];
    questionService.getQuestionsByType.mockResolvedValue(mockQuestions);

    await questionController.getQuestionsByType(req, res, next);

    expect(questionService.getQuestionsByType).toHaveBeenCalledWith(
      parseInt(req.params.typeId)
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockQuestions);
  });

  it("should handle service errors and return 500 status", async () => {
    await expectError(
      questionController.getQuestionsByType,
      req,
      res,
      () =>
        questionService.getQuestionsByType.mockRejectedValue(
          new Error("Database error")
        ),
      500,
      "Internal server error"
    );
    expect(questionService.getQuestionsByType).toHaveBeenCalled();
  });

  it("should return 400 for invalid typeId", async () => {
    req.params.typeId = "invalid";
    await expectError(
      questionController.getQuestionsByType,
      req,
      res,
      () => {},
      400,
      "Bad request: Invalid typeId"
    );
    expect(questionService.getQuestionsByType).not.toHaveBeenCalled();
  });
});

// describe("Get Sub Questions Controller", () => {
//   let req, res;

//   beforeEach(() => {
//     jest.clearAllMocks();
//     console.error = jest.fn();

//     req = {
//       params: { parentId: 1 },
//     };
//     res = mockResponse();
//   });

//   it("should fetch sub-questions successfully", async () => {
//     const mockSubQuestions = [
//       { questionId: 2, label: "Sub Question 1", questionIdParent: 1 },
//       { questionId: 3, label: "Sub Question 2", questionIdParent: 1 },
//     ];
//     prisma.question.findMany.mockResolvedValue(mockSubQuestions);

//     await getSubQuestions(req, res);

//     expect(prisma.question.findMany).toHaveBeenCalledWith({
//       where: { questionIdParent: parseInt(req.params.parentId) },
//     });
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith(mockSubQuestions);
//   });

//   it("should return 400 for invalid parentId", async () => {
//     req.params.parentId = "invalid";
//     await expectError(getSubQuestions, req, res, () => {}, 400, "Bad request");
//     expect(prisma.question.findMany).not.toHaveBeenCalled();
//   });

//   it("should handle prisma errors and return 500", async () => {
//     await expectError(
//       getSubQuestions,
//       req,
//       res,
//       () => prisma.question.findMany.mockRejectedValue(new Error("DB error")),
//       500,
//       "Internal server error"
//     );
//     expect(prisma.question.findMany).toHaveBeenCalled();
//   });
// });
