/**
 * @fileoverview
 * Integration tests for the Type model.
 *
 * @module type.test
 *
 * @description
 * Tests the Type model with a test database, covering:
 *  - Creating a type record
 *  - Reading type(s) from the database
 *  - Updating type records
 *  - Deleting type records
 *  - Relations with other models
 *
 * Uses Supertest and a test database setup.
 *
 * @example
 * // Run all integration tests for the Type model
 * //  NODE_ENV=test npx jest --config jest.config.integration.js tests/integration/type.test.js
 *
 * @tests
 * - Successfully creating a type in the database
 * - Fetching type by ID and filters
 * - Updating type fields and saving changes
 * - Deleting a type and ensuring it no longer exists
 * - Validating relational integrity with linked models
 */
const request = require("supertest");
const app = require("../../index");
const typeService = require("../../services/typeService");
const { newQuestion, newType } = require("../helpers/facory_function");
const { seedWith3types } = require("../helpers/seed");

describe("Type Integration Tests", () => {
  beforeEach(() => {
    console.error = jest.fn();
  });

  describe("POST - /api/type/create", () => {
    it("should create a type and return 201 status", async () => {
      const payload = { label: "Integration Test Type" };

      const res = await request(app).post("/api/type/create").send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        label: payload.label,
        projects: [],
        questions: [],
      });

      // Verify it actually exists in the DB
      const typeInDb = await global.prisma.type.findUnique({
        where: { typeId: res.body.typeId },
        include: { projects: true, questions: true },
      });

      expect(typeInDb).not.toBeNull();
      expect(typeInDb.label).toBe(payload.label);
    });

    it("should create a type with an associated question and return 201 status", async () => {
      const question = await newQuestion({ label: "Question 1" });

      const payload = {
        label: "Type1",
        questions: [question.questionId],
      };

      const res = await request(app).post("/api/type/create").send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        label: payload.label,
        projects: [],
      });
      expect(res.body.questions).toEqual([
        {
          questionId: question.questionId,
          label: question.label,
          category: question.category,
          hasMultipleOpenResponse: question.hasMultipleOpenResponse,
          isRelevant: question.isRelevant,
          numberOfSelectionableOpt: question.numberOfSelectionableOpt,
          shouldMultiply: question.shouldMultiply,
          questionIdParent: question.questionIdParent,
        },
      ]);

      // Verify it actually exists in the DB
      const typeInDb = await global.prisma.type.findUnique({
        where: { typeId: res.body.typeId },
        include: { projects: true, questions: true },
      });

      expect(typeInDb).not.toBeNull();
      expect(typeInDb.label).toBe(payload.label);
      expect(typeInDb.questions.map((q) => q.questionId)).toContain(
        question.questionId
      );
    });

    it("should return 400 status if label is missing or empty", async () => {
      const payload = {
        label: "",
      };

      const res = await request(app).post("/api/type/create").send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "label is required" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(typeService, "createType")
        .mockRejectedValue(new Error("Database error"));

      const payload = {
        label: "Broken Type",
      };

      const res = await request(app).post("/api/type/create").send(payload);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      typeService.createType.mockRestore();
    });
  });

  describe("GET - /api/type/get", () => {
    it("should return a list of all types and 200 status", async () => {
      const types = await seedWith3types();

      const res = await request(app).get("/api/type/get");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(types.length);
    });

    it("should return empty list if no types found and 200 status", async () => {
      const res = await request(app).get("/api/type/get");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(typeService, "getAllTypes")
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).get("/api/type/get");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      typeService.getAllTypes.mockRestore();
    });
  });

  describe("GET - /api/type/get/:typeId", () => {
    it("should return the type and 200 status", async () => {
      const type = await newType({ label: "Type1" });

      const res = await request(app).get(`/api/type/get/${type.typeId}`);

      expect(res.status).toBe(200);
      expect(res.body.typeId).toBe(type.typeId);
      expect(res.body.label).toBe(type.label);
    });

    it("should return 400 status if invalid typeId", async () => {
      const res = await request(app).get("/api/type/get/abc");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid typeId" });
    });

    it("should return 404 status if type does not exist", async () => {
      const res = await request(app).get("/api/type/get/999");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Type not found" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(typeService, "getTypeById")
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).get("/api/type/get/1");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      typeService.getTypeById.mockRestore();
    });
  });

  describe("PATCH - /api/type/update/:typeId", () => {
    it("should update an existing type and return 200 status", async () => {
      const type = await newType({ label: "Type1" });
      const payload = { label: "NewTypeName" };

      const res = await request(app)
        .patch(`/api/type/update/${type.typeId}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.typeId).toBe(type.typeId);
      expect(res.body.label).toBe(type.label);
    });

    it("should update for adding a question to an existing type and return 200 status", async () => {
      const question = await newQuestion({ label: "Question 1" });
      const type = await newType({ label: "Type1" });
      const newData = {
        label: type.label,
        addQuestion: [question.questionId],
      };

      const res = await request(app)
        .patch(`/api/type/update/${type.typeId}`)
        .send(newData);

      expect(res.status).toBe(200);
      expect(res.body.typeId).toBe(type.typeId);
      expect(res.body.questions).toEqual([
        {
          questionId: question.questionId,
          label: question.label,
          category: question.category,
          hasMultipleOpenResponse: question.hasMultipleOpenResponse,
          isRelevant: question.isRelevant,
          numberOfSelectionableOpt: question.numberOfSelectionableOpt,
          shouldMultiply: question.shouldMultiply,
          questionIdParent: question.questionIdParent,
        },
      ]);
    });

    it("should update for removing a question to an existing type and return 200 status", async () => {
      const question = await newQuestion({ label: "Question 1" });
      const type = await newType({
        label: "Type1",
        questions: [question.questionId],
      });
      const newData = {
        label: type.label,
        removeQuestion: [question.questionId],
      };

      const res = await request(app)
        .patch(`/api/type/update/${type.typeId}`)
        .send(newData);

      expect(res.status).toBe(200);
      expect(res.body.typeId).toBe(type.typeId);
      expect(res.body.questions).toEqual([]);
    });

    it("should return 400 status if new label data is empty", async () => {
      const type = await newType({ label: "Type1" });
      const newData = { label: "" };

      const res = await request(app)
        .patch(`/api/type/update/${type.typeId}`)
        .send(newData);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "label is required" });
    });

    it("should return 400 status if invalid typeId", async () => {
      const res = await request(app)
        .patch("/api/type/update/abc")
        .send({ label: "test" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid typeId" });
    });

    it("should return 404 status if type does not exist", async () => {
      const res = await request(app)
        .patch("/api/type/update/999")
        .send({ label: "test" });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Type not found" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(typeService, "updateType")
        .mockRejectedValue(new Error("Database error"));

      const payload = { label: "new label" };

      const res = await request(app).patch("/api/type/update/1").send(payload);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      typeService.updateType.mockRestore();
    });
  });

  describe("DELETE - /api/type/delete/:typeId", () => {
    it("should delete an existing type and return 204 status", async () => {
      const type = await newType({ label: "Type1" });

      const res = await request(app).delete(`/api/type/delete/${type.typeId}`);

      expect(res.status).toBe(204);

      //Verify it's actually delete in the DB
      const typeInDb = await global.prisma.type.findUnique({
        where: { typeId: type.typeId },
      });

      expect(typeInDb).toBeNull();
    });

    it("should return 400 status if invalid typeId", async () => {
      const res = await request(app).delete("/api/type/delete/abc");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid typeId" });
    });

    it("should return 404 status if type does not exist", async () => {
      const res = await request(app).delete("/api/type/delete/999");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Type not found" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(typeService, "deleteType")
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).delete("/api/type/delete/1");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      typeService.deleteType.mockRestore();
    });
  });
});
