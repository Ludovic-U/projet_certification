const {
  createQuestion,
  getAllQuestions,
  updateQuestion,
  deleteQuestion,
  getQuestionById,
  getQuestionsByCategory,
  getQuestionsByType,
  getSubQuestions,
} = require("../../controllers/questionController");
const { prisma } = require("../../prisma/prismaClient");
const { mockResponse } = require("../helpers/responseHelper");
const { expectError } = require("../helpers/errorHelper");

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

describe("Create Question Controller", () => {
  let req, res;

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
    res = mockResponse();
  });

  it("should create a question successfully", async () => {
    const mockQuestion = { questionId: 1, ...req.body };
    prisma.question.create.mockResolvedValue(mockQuestion);

    await createQuestion(req, res);

    expect(prisma.question.create).toHaveBeenCalledWith({
      data: {
        label: req.body.label,
        category: req.body.category,
        numberOfSelectionableOpt: req.body.numberOfSelectionableOpt,
        isRelevant: req.body.isRelevant,
        hasMultipleResponse: req.body.hasMultipleResponse,
        questionIdParent: req.body.questionIdParent,
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockQuestion);
  });

  it("should handle prisma errors and return 500", async () => {
    await expectError(
      createQuestion,
      req,
      res,
      () => prisma.question.create.mockRejectedValue(new Error("DB error")),
      500,
      "Internal server error"
    );
    expect(prisma.question.create).toHaveBeenCalled();
  });
});

describe("Get All Questions Controller", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {};
    res = mockResponse();
  });

  it("should fetch all questions successfully", async () => {
    const mockQuestions = [
      { questionId: 1, label: "Question 1" },
      { questionId: 2, label: "Question 2" },
    ];
    prisma.question.findMany.mockResolvedValue(mockQuestions);

    await getAllQuestions(req, res);

    expect(prisma.question.findMany).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockQuestions);
  });

  it("should handle prisma errors and return 500", async () => {
    await expectError(
      getAllQuestions,
      req,
      res,
      () => prisma.question.findMany.mockRejectedValue(new Error("DB error")),
      500,
      "Internal server error"
    );
    expect(prisma.question.findMany).toHaveBeenCalled();
  });
});

describe("Update Question Controller", () => {
  let req, res;

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
    res = mockResponse();
  });

  it("should update a question successfully", async () => {
    prisma.question.findUnique.mockResolvedValue({ questionId: 1 });
    const mockUpdatedQuestion = { questionId: 1, ...req.body };
    prisma.question.update.mockResolvedValue(mockUpdatedQuestion);

    await updateQuestion(req, res);

    expect(prisma.question.update).toHaveBeenCalledWith({
      where: { questionId: parseInt(req.params.questionId) },
      data: {
        label: req.body.label,
        category: req.body.category,
        numberOfSelectionableOpt: req.body.numberOfSelectionableOpt,
        isRelevant: req.body.isRelevant,
        hasMultipleResponse: req.body.hasMultipleResponse,
        questionIdParent: req.body.questionIdParent,
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUpdatedQuestion);
  });

  it("should return 400 for invalid ID", async () => {
    req.params.questionId = "invalid";
    await expectError(updateQuestion, req, res, () => {}, 400, "Bad request");
    expect(prisma.question.update).not.toHaveBeenCalled();
  });

  it("should return 404 if question does not exist", async () => {
    await expectError(
      updateQuestion,
      req,
      res,
      () => prisma.question.findUnique.mockResolvedValue(null),
      404,
      "Question not found"
    );
    expect(prisma.question.findUnique).toHaveBeenCalled();
  });

  it("should handle prisma errors and return 500", async () => {
    await expectError(
      updateQuestion,
      req,
      res,
      () => {
        prisma.question.findUnique.mockResolvedValue({ questionId: 1 });
        prisma.question.update.mockRejectedValue(new Error("DB error"));
      },
      500,
      "Internal server error"
    );
    expect(prisma.question.update).toHaveBeenCalled();
  });
});

describe("Delete Question Controller", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {
      params: { questionId: 1 },
    };
    res = mockResponse();
  });

  it("should delete a question successfully", async () => {
    prisma.question.findUnique.mockResolvedValue({ questionId: 1 });
    prisma.question.delete.mockResolvedValue({ questionId: 1 });

    await deleteQuestion(req, res);

    expect(prisma.question.delete).toHaveBeenCalledWith({
      where: { questionId: parseInt(req.params.questionId) },
    });
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it("should return 400 for invalid ID", async () => {
    req.params.questionId = "invalid";
    await expectError(deleteQuestion, req, res, () => {}, 400, "Bad request");
    expect(prisma.question.delete).not.toHaveBeenCalled();
  });

  it("should return 404 if question does not exist", async () => {
    await expectError(
      deleteQuestion,
      req,
      res,
      () => prisma.question.findUnique.mockResolvedValue(null),
      404,
      "Question not found"
    );
    expect(prisma.question.findUnique).toHaveBeenCalled();
  });

  it("should handle prisma errors and return 500", async () => {
    await expectError(
      deleteQuestion,
      req,
      res,
      () => {
        prisma.question.findUnique.mockResolvedValue({ questionId: 1 });
        prisma.question.delete.mockRejectedValue(new Error("DB error"));
      },
      500,
      "Internal server error"
    );
    expect(prisma.question.delete).toHaveBeenCalled();
  });
});

describe("Get Question By ID Controller", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {
      params: { questionId: 1 },
    };
    res = mockResponse();
  });

  it("should fetch a question by ID successfully", async () => {
    const mockQuestion = { questionId: 1, label: "Sample Question" };
    prisma.question.findUnique.mockResolvedValue(mockQuestion);

    await getQuestionById(req, res);

    expect(prisma.question.findUnique).toHaveBeenCalledWith({
      where: { questionId: parseInt(req.params.questionId) },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockQuestion);
  });

  it("should return 400 for invalid ID", async () => {
    req.params.questionId = "invalid";
    await expectError(getQuestionById, req, res, () => {}, 400, "Bad request");
    expect(prisma.question.findUnique).not.toHaveBeenCalled();
  });

  it("should return 404 if question does not exist", async () => {
    await expectError(
      getQuestionById,
      req,
      res,
      () => prisma.question.findUnique.mockResolvedValue(null),
      404,
      "Question not found"
    );
    expect(prisma.question.findUnique).toHaveBeenCalled();
  });

  it("should handle prisma errors and return 500", async () => {
    await expectError(
      getQuestionById,
      req,
      res,
      () => prisma.question.findUnique.mockRejectedValue(new Error("DB error")),
      500,
      "Internal server error"
    );
    expect(prisma.question.findUnique).toHaveBeenCalled();
  });
});

// TODO: Add test for getQuestionsByProject

describe("Get Questions By Category Controller", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    req = { params: { category: "General" } };
    res = mockResponse();
  });

  it("should fetch questions by category successfully", async () => {
    const mockQuestions = [
      { questionId: 1, label: "Question 1", category: "General" },
      { questionId: 2, label: "Question 2", category: "General" },
    ];
    prisma.question.findMany.mockResolvedValue(mockQuestions);

    await getQuestionsByCategory(req, res);

    expect(prisma.question.findMany).toHaveBeenCalledWith({
      where: { category: req.params.category },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockQuestions);
  });

  it("should handle prisma errors and return 500", async () => {
    await expectError(
      getQuestionsByCategory,
      req,
      res,
      () => prisma.question.findMany.mockRejectedValue(new Error("DB error")),
      500,
      "Internal server error"
    );
    expect(prisma.question.findMany).toHaveBeenCalled();
  });
});

describe("Get Question By Type Controller", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {
      params: { typeId: 1 },
    };
    res = mockResponse();
  });

  it("should fetch questions by type successfully", async () => {
    const mockQuestions = [
      { questionId: 1, label: "Question 1", typeId: 1 },
      { questionId: 2, label: "Question 2", typeId: 2 },
    ];
    prisma.question.findMany.mockResolvedValue(mockQuestions);

    await getQuestionsByType(req, res);

    expect(prisma.question.findMany).toHaveBeenCalledWith({
      where: { types: { some: { typeId: req.params.typeId } } },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockQuestions);
  });

  it("should return 400 for invalid typeId", async () => {
    req.params.typeId = "invalid";
    await expectError(
      getQuestionsByType,
      req,
      res,
      () => {},
      400,
      "Bad request"
    );
    expect(prisma.question.findMany).not.toHaveBeenCalled();
  });

  it("should handle prisma errors and return 500", async () => {
    await expectError(
      getQuestionsByType,
      req,
      res,
      () => prisma.question.findMany.mockRejectedValue(new Error("DB error")),
      500,
      "Internal server error"
    );
    expect(prisma.question.findMany).toHaveBeenCalled();
  });
});

describe("Get Sub Questions Controller", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {
      params: { parentId: 1 },
    };
    res = mockResponse();
  });

  it("should fetch sub-questions successfully", async () => {
    const mockSubQuestions = [
      { questionId: 2, label: "Sub Question 1", questionIdParent: 1 },
      { questionId: 3, label: "Sub Question 2", questionIdParent: 1 },
    ];
    prisma.question.findMany.mockResolvedValue(mockSubQuestions);

    await getSubQuestions(req, res);

    expect(prisma.question.findMany).toHaveBeenCalledWith({
      where: { questionIdParent: parseInt(req.params.parentId) },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockSubQuestions);
  });

  it("should return 400 for invalid parentId", async () => {
    req.params.parentId = "invalid";
    await expectError(getSubQuestions, req, res, () => {}, 400, "Bad request");
    expect(prisma.question.findMany).not.toHaveBeenCalled();
  });

  it("should handle prisma errors and return 500", async () => {
    await expectError(
      getSubQuestions,
      req,
      res,
      () => prisma.question.findMany.mockRejectedValue(new Error("DB error")),
      500,
      "Internal server error"
    );
    expect(prisma.question.findMany).toHaveBeenCalled();
  });
});
