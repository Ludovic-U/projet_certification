const request = require("supertest");
const app = require("../../index");

describe("Question Integration Tests", () => {
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
      });

      // Verify it actually exists in the DB
      const questionInDb = await global.prisma.question.findUnique({
        where: { questionId: res.body.questionId },
      });

      expect(questionInDb).not.toBeNull();
      expect(questionInDb.label).toBe(payload.label);
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

    it("should return 400 status if label is missing", async () => {
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
  });

  describe("GET - /api/question/get", () => {
    it("should return the question list and 200 status", async () => {
      const question1 = await newQuestion({
        label: "Question 01",
        category: "Test",
      });
      const question2 = await newQuestion({ label: "Question 02" });

      const res = await request(app).get("/api/question/get");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].label).toBe(question1.label);
      expect(res.body[1].label).toBe(question2.label);
    });

    it("should return empty list if no questions found and 200 status", async () => {
      const res = await request(app).get("/api/question/get");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });
  });

  describe("GET - /api/question/get/:questionId", () => {
    it("should return the question and 200 status", async () => {
      const question1 = await newQuestion({
        label: "Question 01",
        category: "Test",
      });

      const res = await request(app).get(
        `/api/question/get/${question1.questionId}`
      );

      expect(res.status).toBe(200);
      expect(res.body.label).toBe(question1.label);
    });

    it("should return 404 status if question does not exist", async () => {
      const res = await request(app).get("/api/question/get/999");

      expect(res.status).toBe(404);
    });
  });

  describe("GET - /api/question/get/:questionId/subquestion", () => {
    it("should return the subquestion list of a question and 200 status", async () => {
      const questionParent = await newQuestion({ label: "Question 01" });
      const subquestion1 = await newQuestion({
        label: "Subquestion 01",
        questionIdParent: questionParent.questionId,
      });
      const subquestion2 = await newQuestion({
        label: "Subquestion 02",
        questionIdParent: questionParent.questionId,
      });

      const res = await request(app).get(
        `/api/question/get/${questionParent.questionId}/subquestion`
      );

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].label).toBe(subquestion1.label);
      expect(res.body[1].label).toBe(subquestion2.label);
    });

    it("should return an empty list if no subquestion found and 200 status", async () => {
      const questionParent = await newQuestion({ label: "Question 01" });

      const res = await request(app).get(
        `/api/question/get/${questionParent.questionId}/subquestion`
      );

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });

    it("should return 404 status if question does not exist", async () => {
      const res = await request(app).get(
        `/api/question/get/${questionParent.questionId}/subquestion`
      );

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH - /api/question/update/:questionId", () => {
    it("should update an existing question and return 200", async () => {
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

    it("should return 404 status if question does not exist", async () => {
      const res = await request(app)
        .patch("/api/question/update/999")
        .send({ label: "a", category: "b" });

      expect(res.status).toBe(404);
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
    });
  });
});

async function newQuestion({
  label = "Default label",
  category = "Default",
  numberOfSelectionableOpt = null,
  isRelevant = false,
  hasMultipleOpenResponse = false,
  shouldMultiply = false,
  questionIdParent = null,
} = {}) {
  const question = await global.prisma.question.create({
    data: {
      label,
      category,
      numberOfSelectionableOpt,
      isRelevant,
      hasMultipleOpenResponse,
      shouldMultiply,
      questionIdParent,
    },
  });
  return question;
}
