const request = require("supertest");
const app = require("../../index");
const questionService = require("../../services/questionService");
const { newQuestion, newType } = require("../helpers/facory_function");
const {
  seedWith3Questions,
  seedQuestionWithSubquestion,
  seedQuestionsWithCategory,
  seedQuestionsWithType,
  seedProjectWithQuestions,
} = require("../helpers/seed");

describe("Question Integration Tests", () => {
  beforeEach(() => {
    console.error = jest.fn();
  });

  describe("POST - /api/question/create", () => {
    it("should create a question and return 201 status", async () => {
      const payload = {
        label: "Integration Test Question",
        category: "testing",
        numberOfSelectionableOpt: 3,
        isRelevant: true,
      };

      const res = await request(app).post("/api/question/create").send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        label: payload.label,
        category: payload.category,
        numberOfSelectionableOpt: payload.numberOfSelectionableOpt,
        isRelevant: payload.isRelevant,
        hasMultipleOpenResponse: false,
        shouldMultiply: false,
        questionIdParent: null,
        projects: [],
        types: [],
      });

      // Verify it actually exists in the DB
      const questionInDb = await global.prisma.question.findUnique({
        where: { questionId: res.body.questionId },
      });

      expect(questionInDb).not.toBeNull();
      expect(questionInDb.label).toBe(payload.label);
    });

    it("should create a question with type and return 201 status", async () => {
      const type = await newType({ label: "Type1" });

      const payload = {
        label: "Integration Test Question",
        category: "testing",
        types: [type.typeId],
      };

      const res = await request(app).post("/api/question/create").send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        label: payload.label,
        category: payload.category,
        numberOfSelectionableOpt: null,
        isRelevant: false,
        hasMultipleOpenResponse: false,
        shouldMultiply: false,
        questionIdParent: null,
      });
      expect(res.body.types).toEqual([
        {
          typeId: type.typeId,
          label: type.label,
        },
      ]);

      // Verify it actually exists in the DB
      const questionInDb = await global.prisma.question.findUnique({
        where: { questionId: res.body.questionId },
        include: { projects: true, types: true },
      });

      expect(questionInDb).not.toBeNull();
      expect(questionInDb.label).toBe(payload.label);
      expect(questionInDb.types.map((t) => t.typeId)).toContain(type.typeId);
    });

    it("should return 400 status if label is missing", async () => {
      const payload = {
        label: "",
        category: "testing",
        numberOfSelectionableOpt: 3,
        isRelevant: true,
      };

      const res = await request(app).post("/api/question/create").send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "label and category are required" });
    });

    it("should return 400 status if category is missing", async () => {
      const payload = {
        label: "Test",
        category: "",
        numberOfSelectionableOpt: 3,
        isRelevant: true,
      };

      const res = await request(app).post("/api/question/create").send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "label and category are required" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(questionService, "createQuestion")
        .mockRejectedValue(new Error("Database error"));

      const payload = {
        label: "Broken Question",
        category: "testing",
      };

      const res = await request(app).post("/api/question/create").send(payload);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      questionService.createQuestion.mockRestore();
    });
  });

  describe("GET - /api/question/get", () => {
    it("should return the question list (3) and 200 status", async () => {
      const questions = await seedWith3Questions();

      const res = await request(app).get("/api/question/get");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(questions.length);
    });

    it("should return empty list if no questions found and 200 status", async () => {
      const res = await request(app).get("/api/question/get");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(questionService, "getAllQuestions")
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).get("/api/question/get");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      questionService.getAllQuestions.mockRestore();
    });
  });

  describe("GET - /api/question/get/:questionId", () => {
    it("should return the question and 200 status", async () => {
      const question = await newQuestion({ label: "Question Test 1" });

      const res = await request(app).get(
        `/api/question/get/${question.questionId}`
      );

      expect(res.status).toBe(200);
      expect(res.body.label).toBe(question.label);
    });

    it("should return 404 status if question does not exist", async () => {
      const res = await request(app).get("/api/question/get/999");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Question not found" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(questionService, "getQuestionById")
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).get("/api/question/get/1");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      questionService.getQuestionById.mockRestore();
    });
  });

  describe("GET - /api/question/get/:questionId/subquestion", () => {
    it("should return the subquestion list of a question and 200 status", async () => {
      const { questionParent, _ } = await seedQuestionWithSubquestion();

      const res = await request(app).get(
        `/api/question/get/${questionParent.questionId}/subquestion`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(questionParent.children.length);
      expect(res.body[0].questionIdParent).toEqual(questionParent.questionId);
    });

    it("should return an empty list if no subquestion found and 200 status", async () => {
      const questionParent = await newQuestion({ label: "Question 01" });

      const res = await request(app).get(
        `/api/question/get/${questionParent.questionId}/subquestion`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    it("should return 404 status if parent question does not exist", async () => {
      const res = await request(app).get(`/api/question/get/999/subquestion`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "QuestionParent not found" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(questionService, "getSubQuestions")
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).get("/api/question/get/1/subquestion");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      questionService.getSubQuestions.mockRestore();
    });
  });

  describe("PATCH - /api/question/update/:questionId", () => {
    it("should update an existing question and return 200 status", async () => {
      const question = await newQuestion();
      const newData = {
        label: "This has been updated",
        category: question.category,
      };

      const res = await request(app)
        .patch(`/api/question/update/${question.questionId}`)
        .send(newData);

      expect(res.status).toBe(200);
      expect(res.body.questionId).toBe(question.questionId);
      expect(res.body.label).toBe(newData.label);
    });

    it("should update for adding a type to an existing question and return 200 status", async () => {
      const type = await newType({ label: "Type1" });

      const question = await newQuestion();
      const newData = {
        label: question.label,
        category: question.category,
        addType: [type.typeId],
      };

      const res = await request(app)
        .patch(`/api/question/update/${question.questionId}`)
        .send(newData);

      expect(res.status).toBe(200);
      expect(res.body.questionId).toBe(question.questionId);
      expect(res.body.types).toEqual([
        {
          typeId: type.typeId,
          label: type.label,
        },
      ]);
    });

    it("should update for removing a type to an existing question and return 200 status", async () => {
      const type = await newType({ label: "Type1" });

      const question = await newQuestion({ types: [type.typeId] });
      const newData = {
        label: question.label,
        category: question.category,
        removeType: [type.typeId],
      };

      const res = await request(app)
        .patch(`/api/question/update/${question.questionId}`)
        .send(newData);

      expect(res.status).toBe(200);
      expect(res.body.questionId).toBe(question.questionId);
      expect(res.body.types).toEqual([]);
    });

    it("should return 400 status if new label data is empty", async () => {
      const question = await newQuestion();
      const newData = {
        label: "",
        category: question.category,
      };

      const res = await request(app)
        .patch(`/api/question/update/${question.questionId}`)
        .send(newData);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "label and category are required" });
    });

    it("should return 400 status if new category data is empty", async () => {
      const question = await newQuestion();
      const newData = {
        label: question.label,
        category: "",
      };

      const res = await request(app)
        .patch(`/api/question/update/${question.questionId}`)
        .send(newData);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "label and category are required" });
    });

    it("should return 404 status if question does not exist", async () => {
      const res = await request(app)
        .patch("/api/question/update/999")
        .send({ label: "a", category: "b" });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Question not found" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(questionService, "updateQuestion")
        .mockRejectedValue(new Error("Database error"));

      const payload = {
        label: "new label",
        category: "new category",
      };

      const res = await request(app)
        .patch("/api/question/update/1")
        .send(payload);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      questionService.updateQuestion.mockRestore();
    });
  });

  describe("DELETE - /api/question/delete/:questionId", () => {
    it("should delete an existing question and return 204 status", async () => {
      const question = await newQuestion();

      const res = await request(app).delete(
        `/api/question/delete/${question.questionId}`
      );

      expect(res.status).toBe(204);

      // Verify it actually delete in the DB
      const questionInDb = await global.prisma.question.findUnique({
        where: { questionId: question.questionId },
      });

      expect(questionInDb).toBeNull();
    });

    it("should return 404 status if question does not exist", async () => {
      const res = await request(app).delete("/api/question/delete/999");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Question not found" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(questionService, "deleteQuestion")
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).delete("/api/question/delete/1");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      questionService.deleteQuestion.mockRestore();
    });
  });

  describe("GET - /api/question/get/project/:projectId", () => {
    it("should return a question list of the given project and 200 status", async () => {
      const { project, question, typeQuestions } =
        await seedProjectWithQuestions();

      const res = await request(app).get(
        `/api/question/get/project/${project.projectId}`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength([question, ...typeQuestions].length);
    });

    it("should return 404 status if project does not exist", async () => {
      const res = await request(app).get("/api/question/get/project/999");

      expect(res.status).toBe(404);
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(questionService, "getQuestionsByProject")
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).get("/api/question/get/project/1");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      questionService.getQuestionsByProject.mockRestore();
    });
  });

  describe("GET - /api/question/get/category/:category", () => {
    it("should return questions of the given category", async () => {
      const category = "Testing";
      const questions = await seedQuestionsWithCategory(category);

      // Seed a question that has another category
      await newQuestion({ label: "Other Question", category: "Other" });

      const res = await request(app).get(
        `/api/question/get/category/${category}`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(questions.length);
      // Check that all returned questions have the correct category
      res.body.forEach((q) => {
        expect(q.category).toBe(category);
      });
    });

    it("should return an empty array if no question found for the given category", async () => {
      const res = await request(app).get(`/api/question/get/category/qwerty`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(questionService, "getQuestionsByCategory")
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).get("/api/question/get/category/qwert");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      questionService.getQuestionsByCategory.mockRestore();
    });
  });

  describe("GET - /api/question/type/:typeId", () => {
    it("should return questions of the given type", async () => {
      const { type, questions } = await seedQuestionsWithType();

      // Seed another question that has another type
      const otherType = await newType({ label: "Type2" });
      await newQuestion({ types: [otherType.typeId] });

      const res = await request(app).get(
        `/api/question/get/type/${type.typeId}`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(questions.length);
      // Check that all returned questions have the correct typeId
      res.body.forEach((q) => {
        expect(q.types).toEqual([{ typeId: type.typeId, label: "Type1" }]);
      });
    });

    it("should return an empty list if no questions found for the given type", async () => {
      const type = await newType({ label: "Type1" });

      const res = await request(app).get(
        `/api/question/get/type/${type.typeId}`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    it("should return 404 status if type does not exist", async () => {
      const res = await request(app).get("/api/question/get/type/999");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Type not found" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(questionService, "getQuestionsByType")
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).get("/api/question/get/type/1");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      questionService.getQuestionsByType.mockRestore();
    });
  });
});
