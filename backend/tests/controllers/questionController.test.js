/**
 * @fileoverview
 * Unit tests for the Question Controller.
 * Covers all controller endpoints: create, read, update, delete, and query by various parameters.
 * Uses Jest and mocks the questionService layer and mock validateId function.
 */

const questionController = require("../../controllers/questionController");
const questionService = require("../../services/questionService");
const { createMockResponse } = require("../helpers/responseHelper");
const {
  invalidOrMissingStatus,
  notFoundStatus,
  internalServerErrorStatus,
} = require("../helpers/errorHelper");

// Mock questionService layer to isolate business logic
jest.mock("../../services/questionService");

describe("Question Controller", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    res = createMockResponse();
    next = jest.fn();
  });

  /**
   * Test suite for creating questions
   */
  describe("createQuestion", () => {
    beforeEach(() => {
      req = {
        body: {
          label: "Sample Question",
          category: "General",
          numberOfSelectionableOpt: 2,
          isRelevant: true,
          hasMultipleOpenResponse: false,
          shouldMultiply: false,
          questionIdParent: null,
        },
      };
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
        hasMultipleOpenResponse: req.body.hasMultipleOpenResponse,
        shouldMultiply: req.body.shouldMultiply,
        questionIdParent: req.body.questionIdParent,
        types: [],
        projects: [],
        options: [],
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockQuestion);
    });

    it("should create a question with types and return 201 status", async () => {
      req.body.types = [1, 2];
      const mockQuestion = { questionId: 1, ...req.body };
      questionService.createQuestion.mockResolvedValue(mockQuestion);

      await questionController.createQuestion(req, res, next);

      expect(questionService.createQuestion).toHaveBeenCalledWith({
        label: req.body.label,
        category: req.body.category,
        numberOfSelectionableOpt: req.body.numberOfSelectionableOpt,
        isRelevant: req.body.isRelevant,
        hasMultipleOpenResponse: req.body.hasMultipleOpenResponse,
        shouldMultiply: req.body.shouldMultiply,
        questionIdParent: req.body.questionIdParent,
        types: req.body.types,
        projects: [],
        options: [],
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockQuestion);
    });

    it("should return 400 if a required field is missing", async () => {
      req.body.label = "";
      await invalidOrMissingStatus(
        questionController.createQuestion,
        req,
        res,
        questionService.createQuestion,
        "label and category are required"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        questionController.createQuestion,
        req,
        res,
        questionService.createQuestion
      );
    });
  });

  /**
   * Test suite for fetching questions
   */
  describe("getAllQuestions", () => {
    beforeEach(() => {
      req = {};
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
      await internalServerErrorStatus(
        questionController.getAllQuestions,
        req,
        res,
        questionService.getAllQuestions
      );
    });
  });

  /**
   * Test suite for updating questions
   */
  describe("updateQuestion", () => {
    beforeEach(() => {
      req = {
        params: { questionId: 1 },
        body: {
          label: "Updated Question",
          category: "Updated Category",
          numberOfSelectionableOpt: 3,
          isRelevant: false,
          hasMultipleOpenResponse: true,
          shouldMultiply: false,
          questionIdParent: null,
        },
      };
    });

    it("should update a question and return 200 status", async () => {
      const mockUpdatedQuestion = { questionId: 1, ...req.body };
      questionService.updateQuestion.mockResolvedValue(mockUpdatedQuestion);

      await questionController.updateQuestion(req, res, next);

      expect(questionService.updateQuestion).toHaveBeenCalledWith(
        Number(req.params.questionId),
        {
          label: req.body.label,
          category: req.body.category,
          numberOfSelectionableOpt: req.body.numberOfSelectionableOpt,
          isRelevant: req.body.isRelevant,
          hasMultipleOpenResponse: req.body.hasMultipleOpenResponse,
          shouldMultiply: req.body.shouldMultiply,
          questionIdParent: req.body.questionIdParent,
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedQuestion);
    });

    it("should update a question that add/remove type/project and return 200 status", async () => {
      req.body.addType = [1, 2];
      req.body.removeType = [3];
      req.body.addProject = [4];
      req.body.removeProject = [5];
      const mockUpdatedQuestion = { questionId: 1, ...req.body };
      questionService.updateQuestion.mockResolvedValue(mockUpdatedQuestion);

      await questionController.updateQuestion(req, res, next);

      expect(questionService.updateQuestion).toHaveBeenCalledWith(
        Number(req.params.questionId),
        {
          label: req.body.label,
          category: req.body.category,
          numberOfSelectionableOpt: req.body.numberOfSelectionableOpt,
          isRelevant: req.body.isRelevant,
          hasMultipleOpenResponse: req.body.hasMultipleOpenResponse,
          shouldMultiply: req.body.shouldMultiply,
          questionIdParent: req.body.questionIdParent,
          addType: req.body.addType,
          removeType: req.body.removeType,
          addProject: req.body.addProject,
          removeProject: req.body.removeProject,
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedQuestion);
    });

    it("should return 400 for invalid questionId", async () => {
      req.params.questionId = "invalid";
      await invalidOrMissingStatus(
        questionController.updateQuestion,
        req,
        res,
        questionService.updateQuestion,
        "Invalid questionId"
      );
    });

    it("should return 400 if a required field is missing", async () => {
      req.body.label = "";
      await invalidOrMissingStatus(
        questionController.updateQuestion,
        req,
        res,
        questionService.updateQuestion,
        "label and category are required"
      );
    });

    it("should return 404 if question not found", async () => {
      await notFoundStatus(
        questionController.updateQuestion,
        req,
        res,
        questionService.updateQuestion,
        "Question"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        questionController.updateQuestion,
        req,
        res,
        questionService.updateQuestion
      );
    });
  });

  /**
   * Test suite for deleting questions
   */
  describe("deleteQuestion", () => {
    beforeEach(() => {
      req = { params: { questionId: 1 } };
    });

    it("should delete a question and return 204 status", async () => {
      questionService.deleteQuestion.mockResolvedValue();

      await questionController.deleteQuestion(req, res, next);

      expect(questionService.deleteQuestion).toHaveBeenCalledWith(
        Number(req.params.questionId)
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("should return 400 for invalid questionId", async () => {
      req.params.questionId = "invalid";
      await invalidOrMissingStatus(
        questionController.deleteQuestion,
        req,
        res,
        questionService.deleteQuestion,
        "Invalid questionId"
      );
    });

    it("should return 404 if question not found", async () => {
      await notFoundStatus(
        questionController.deleteQuestion,
        req,
        res,
        questionService.deleteQuestion,
        "Question"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        questionController.deleteQuestion,
        req,
        res,
        questionService.deleteQuestion
      );
    });
  });

  /**
   * Test suite for fetching questions by ID
   */
  describe("getQuestionById", () => {
    beforeEach(() => {
      req = { params: { questionId: 1 } };
    });

    it("should fetch a question by ID and return 200 status", async () => {
      const mockQuestion = { questionId: 1, label: "Sample Question" };
      questionService.getQuestionById.mockResolvedValue(mockQuestion);

      await questionController.getQuestionById(req, res, next);

      expect(questionService.getQuestionById).toHaveBeenCalledWith(
        Number(req.params.questionId)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockQuestion);
    });

    it("should return 400 for invalid questionId", async () => {
      req.params.questionId = "invalid";
      await invalidOrMissingStatus(
        questionController.getQuestionById,
        req,
        res,
        questionService.getQuestionById,
        "Invalid questionId"
      );
    });

    it("should return 404 if question not found", async () => {
      req.params.questionId = 999;
      await notFoundStatus(
        questionController.getQuestionById,
        req,
        res,
        questionService.getQuestionById,
        "Question"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        questionController.getQuestionById,
        req,
        res,
        questionService.getQuestionById
      );
    });
  });

  /**
   * Test suite for fetching questions by project
   */
  describe("getQuestionsByProject", () => {
    beforeEach(() => {
      req = { params: { projectId: 1 } };
    });

    it("should fetch questions by project and return 200 status", async () => {
      const mockQuestions = [
        { questionId: 1, label: "Q1" },
        { questionId: 2, label: "Q2" },
      ];
      questionService.getQuestionsByProject.mockResolvedValue(mockQuestions);

      await questionController.getQuestionsByProject(req, res, next);

      expect(questionService.getQuestionsByProject).toHaveBeenCalledWith(
        Number(req.params.projectId)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockQuestions);
    });

    it("should return 400 for invalid projectId", async () => {
      req.params.projectId = "invalid";
      await invalidOrMissingStatus(
        questionController.getQuestionsByProject,
        req,
        res,
        questionService.getQuestionsByProject,
        "Invalid projectId"
      );
    });

    it("should return 404 if project not found", async () => {
      await notFoundStatus(
        questionController.getQuestionsByProject,
        req,
        res,
        questionService.getQuestionsByProject,
        "Project"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        questionController.getQuestionsByProject,
        req,
        res,
        questionService.getQuestionsByProject
      );
    });
  });

  /**
   * Test suite for fetching questions by category
   */
  describe("getQuestionsByCategory", () => {
    beforeEach(() => {
      req = { params: { category: "General" } };
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
      await internalServerErrorStatus(
        questionController.getQuestionsByCategory,
        req,
        res,
        questionService.getQuestionsByCategory
      );
    });
  });

  /**
   * Test suite for fetching questions by type
   */
  describe("getQuestionsByType", () => {
    beforeEach(() => {
      req = { params: { typeId: 1 } };
    });

    it("should fetch questions by type and return 200 status", async () => {
      const mockQuestions = [
        { questionId: 1, label: "Question 1", typeId: 1 },
        { questionId: 2, label: "Question 2", typeId: 1 },
      ];
      questionService.getQuestionsByType.mockResolvedValue(mockQuestions);

      await questionController.getQuestionsByType(req, res, next);

      expect(questionService.getQuestionsByType).toHaveBeenCalledWith(
        Number(req.params.typeId)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockQuestions);
    });

    it("should return 400 for invalid typeId", async () => {
      req.params.typeId = "invalid";
      await invalidOrMissingStatus(
        questionController.getQuestionsByType,
        req,
        res,
        questionService.getQuestionsByType,
        "Invalid typeId"
      );
    });

    it("should return 404 if type not found", async () => {
      await notFoundStatus(
        questionController.getQuestionsByType,
        req,
        res,
        questionService.getQuestionsByType,
        "Type"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        questionController.getQuestionsByType,
        req,
        res,
        questionService.getQuestionsByType
      );
    });
  });

  /**
   * Test suite for fetching questions by parent
   */
  describe("getSubQuestions", () => {
    beforeEach(() => {
      req = { params: { questionId: 1 } };
    });

    it("should fetch sub-questions and return 200 status", async () => {
      const mockSubQuestions = [
        { questionId: 2, label: "Sub Question 1", questionIdParent: 1 },
        { questionId: 3, label: "Sub Question 2", questionIdParent: 1 },
      ];
      questionService.getSubQuestions.mockResolvedValue(mockSubQuestions);

      await questionController.getSubQuestions(req, res, next);

      expect(questionService.getSubQuestions).toHaveBeenCalledWith(
        Number(req.params.questionId)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockSubQuestions);
    });

    it("should return 400 for invalid parentId", async () => {
      req.params.questionId = "invalid";
      await invalidOrMissingStatus(
        questionController.getSubQuestions,
        req,
        res,
        questionService.getSubQuestions,
        "Invalid questionIdParent"
      );
    });

    it("should return 404 if parent question not found", async () => {
      await notFoundStatus(
        questionController.getSubQuestions,
        req,
        res,
        questionService.getSubQuestions,
        "QuestionParent"
      );
    });

    it("should handle service errors and return 500 status", async () => {
      await internalServerErrorStatus(
        questionController.getSubQuestions,
        req,
        res,
        questionService.getSubQuestions
      );
    });
  });
});
