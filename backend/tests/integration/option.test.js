/**
 * @fileoverview
 * Integration tests for the Option model.
 *
 * @module response.test
 *
 * @description
 * Tests the Option model with a test database, covering:
 *  - Creating a option record
 *  - Reading option(s) from the database
 *  - Updating option records
 *  - Deleting option records
 *  - Relations with other models
 *
 * Uses Supertest and a test database setup.
 *
 * @example
 * // Run all integration tests for the Option model
 * //  NODE_ENV=test npx jest --config jest.config.integration.js tests/integration/option.test.js
 *
 * @tests
 * - Successfully creating a option in the database
 * - Fetching option by ID and filters
 * - Updating option fields and saving changes
 * - Deleting a option and ensuring it no longer exists
 * - Validating relational integrity with linked models
 */
const request = require("supertest");
const app = require("../../index");
const optionService = require("../../services/optionService");
const { newQuestion, newOption } = require("../helpers/facory_function");
const { seedQuestionWithOptions } = require("../helpers/seed");

describe("Option Integration Tests", () => {
  beforeEach(() => {
    console.error = jest.fn();
  });

  describe("POST - /api/option/create", () => {
    it("should create an option for a question and return 201 status", async () => {
      const question = await newQuestion();
      const payload = { label: "Option 1", questionId: question.questionId };

      const res = await request(app).post("/api/option/create").send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        label: payload.label,
        questionId: payload.questionId,
      });

      // Verify it actually exists in the DB
      const optionInDb = await global.prisma.option.findUnique({
        where: { optionId: res.body.optionId },
      });

      expect(optionInDb).not.toBeNull();
      expect(optionInDb.label).toBe(payload.label);
    });

    it("should return 400 status if a required field is missing or empty", async () => {
      const payload = { questionId: [1] };

      const res = await request(app).post("/api/option/create").send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "label is required" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(optionService, "createOption")
        .mockRejectedValue(new Error("Database error"));

      const payload = { label: "Opt1" };

      const res = await request(app).post("/api/option/create").send(payload);

      expect(res.status).toBe(500);

      // Restore orginal implementation
      optionService.createOption.mockRestore();
    });
  });

  describe("GET - /api/option/get/:optionId", () => {
    it("should return the option and 200 status", async () => {
      const question = await newQuestion();
      const option = await newOption({ questionId: question.questionId });

      const res = await request(app).get(`/api/option/get/${option.optionId}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        label: option.label,
        questionId: option.questionId,
      });
      expect(res.body.questionId).toBe(question.questionId);
    });

    it("should return 400 status if invalid optionId", async () => {
      const res = await request(app).get("/api/option/get/abc");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid optionId" });
    });
    it("should return 404 status if option does not exist", async () => {
      const res = await request(app).get("/api/option/get/999");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Option not found" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(optionService, "getOptionById")
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).get("/api/option/get/1");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      optionService.getOptionById.mockRestore();
    });
  });

  describe("GET - /api/option/get/question/:questionId", () => {
    it("should return the option list of a given question and return 200 status", async () => {
      const { question, options } = await seedQuestionWithOptions();

      const res = await request(app).get(
        `/api/option/get/question/${question.questionId}`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(options.length);
      res.body.forEach((o) => {
        expect(o.questionId).toBe(question.questionId);
      });
    });

    it("should return 400 status if invalid questionId", async () => {
      const res = await request(app).get("/api/option/get/question/abc");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid questionId" });
    });

    it("should return 404 status if the question does not exist", async () => {
      const res = await request(app).get("/api/option/get/question/999");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Question not found" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(optionService, "getOptionsByQuestion")
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).get("/api/option/get/question/1");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      optionService.getOptionsByQuestion.mockRestore();
    });
  });

  describe("PATCH - /api/option/update/:optionId", () => {
    it("should update an existing option and return 200 status", async () => {
      const question = await newQuestion();
      const option = await newOption({ questionId: question.questionId });
      const newData = { label: "newOpt", questionId: option.questionId };

      const res = await request(app)
        .patch(`/api/option/update/${option.optionId}`)
        .send(newData);

      expect(res.status).toBe(200);
      expect(res.body.label).toBe(newData.label);
    });

    it("should return 400 status if required field is missing or empty", async () => {
      const question = await newQuestion();
      const option = await newOption({ questionId: question.questionId });
      const newData = { label: "", questionId: option.questionId };

      const res = await request(app)
        .patch(`/api/option/update/${option.optionId}`)
        .send(newData);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "label is required" });
    });

    it("should return 400 if invalid optionId", async () => {
      const question = await newQuestion();
      const res = await request(app)
        .patch("/api/option/update/abc")
        .send({ label: "newOpt", questionId: question.questionId });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid optionId" });
    });

    it("should return 404 if option does not exist", async () => {
      const question = await newQuestion();
      const res = await request(app)
        .patch("/api/option/update/999")
        .send({ label: "newOpt", questionId: question.questionId });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Option not found" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      const question = await newQuestion();
      // Mock service to throw
      jest
        .spyOn(optionService, "updateOption")
        .mockRejectedValue(new Error("Database error"));

      const payload = { label: "new label", questionId: question.questionId };

      const res = await request(app)
        .patch("/api/option/update/1")
        .send(payload);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      optionService.updateOption.mockRestore();
    });
  });

  describe("DELETE - /api/option/delete/:optionId", () => {
    it("should delete an existing option and return 204 status", async () => {
      const { question, options } = await seedQuestionWithOptions(); // Options.length = 2

      const res = await request(app).delete(
        `/api/option/delete/${options[1].optionId}`
      );

      expect(res.status).toBe(204);

      //Verify it's actually delete in the DB
      const optionInDb = await global.prisma.option.findUnique({
        where: { optionId: options[1].optionId },
      });

      expect(optionInDb).toBeNull();

      //Verify the question does not have the option anymore in the DB
      const questionInDb = await global.prisma.question.findUnique({
        where: { questionId: question.questionId },
        include: { options: true },
      });

      expect(questionInDb.options).toHaveLength(options.length - 1);
    });

    it("should return 400 status if invalid optionId", async () => {
      const res = await request(app).delete("/api/option/delete/abc");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid optionId" });
    });

    it("should return 404 status if option does not exist", async () => {
      const res = await request(app).delete("/api/option/delete/999");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Option not found" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(optionService, "deleteOption")
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).delete("/api/option/delete/1");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      optionService.deleteOption.mockRestore();
    });
  });
});
