/**
 * @fileoverview
 * Integration tests for the Response model.
 *
 * @module response.test
 *
 * @description
 * Tests the Response model with a test database, covering:
 *  - Creating a response record
 *  - Reading response(s) from the database
 *  - Updating response records
 *  - Deleting response records
 *  - Relations with other models
 *
 * Uses Supertest and a test database setup.
 *
 * @example
 * // Run all integration tests for the Response model
 * //  NODE_ENV=test npx jest --config jest.config.integration.js tests/integration/respojse.test.js
 *
 * @tests
 * - Successfully creating a response in the database
 * - Fetching response by ID and filters
 * - Updating response fields and saving changes
 * - Deleting a response and ensuring it no longer exists
 * - Validating relational integrity with linked models
 */
const request = require("supertest");
const app = require("../../index");
const responseService = require("../../services/responseService");
const { newResponse, newQuestion } = require("../helpers/facory_function");
const {
  seedQuestionWithOptions,
  seedProjectWithResponses,
  seedResponseWithSubresponse,
  seedWithProjectAndQuestion,
  seedProjectWithClientAndManager,
} = require("../helpers/seed");

describe("Response Integration Tests", () => {
  beforeEach(() => {
    console.error = jest.fn();
  });

  describe("POST - /api/response/create", () => {
    it("should create a response and return 201 status", async () => {
      const { project, question } = await seedWithProjectAndQuestion();
      const payload = {
        label: "Response1",
        projectId: project.projectId,
        questionId: question.questionId,
      };

      const res = await request(app).post("/api/response/create").send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        label: payload.label,
        projectId: payload.projectId,
        questionId: payload.questionId,
        optionId: null,
        responseIdParent: null,
      });

      // Verify it actually exists in the DB
      const responseInDb = await global.prisma.response.findUnique({
        where: { responseId: res.body.responseId },
      });

      expect(responseInDb).not.toBeNull();
      expect(responseInDb.label).toBe(payload.label);
    });

    it("should create a response that is an option from a question and return 201 status", async () => {
      const { project } = await seedProjectWithClientAndManager();
      const { question, options } = await seedQuestionWithOptions();
      const payload = {
        label: options[0].label,
        projectId: project.projectId,
        questionId: question.questionId,
        optionId: options[0].optionId,
      };

      const res = await request(app).post("/api/response/create").send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        label: payload.label,
        projectId: payload.projectId,
        questionId: payload.questionId,
        optionId: payload.optionId,
        responseIdParent: null,
      });

      // Verify it actually exists in the DB
      const responseInDb = await global.prisma.response.findUnique({
        where: { responseId: res.body.responseId },
      });

      expect(responseInDb).not.toBeNull();
      expect(responseInDb.label).toBe(payload.label);
    });

    it("should return 400 status if label is missing or empty", async () => {
      const { project, question } = await seedWithProjectAndQuestion();
      const payload = {
        projectId: project.projectId,
        questionId: question.questionId,
      };

      const res = await request(app).post("/api/response/create").send(payload);

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: "label", msg: "label is required" }),
        ])
      );
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(responseService, "createResponse")
        .mockRejectedValue(new Error("Database error"));

      const { project, question } = await seedWithProjectAndQuestion();
      const payload = {
        label: "Response1",
        projectId: project.projectId,
        questionId: question.questionId,
      };

      const res = await request(app).post("/api/response/create").send(payload);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      responseService.createResponse.mockRestore();
    });
  });

  describe("GET - /api/response/get/project/:projectId", () => {
    it("should return the response list of a given project and 200 status", async () => {
      const { project, _, responses } = await seedProjectWithResponses();

      const res = await request(app).get(
        `/api/response/get/project/${project.projectId}`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(responses.length);
    });

    it("should return empty list if no responses found and 200 status", async () => {
      const { project } = await seedProjectWithClientAndManager();
      const res = await request(app).get(
        `/api/response/get/project/${project.projectId}`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    it("should return 400 status if invalid projectId", async () => {
      const res = await request(app).get("/api/response/get/project/abc");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid projectId" });
    });

    it("should return 404 status if project does not exist", async () => {
      const res = await request(app).get("/api/response/get/project/999");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Project not found" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(responseService, "getResponsesByProject")
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).get("/api/response/get/project/1");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      responseService.getResponsesByProject.mockRestore();
    });
  });

  describe("GET - /api/response/get/project/:projectId/question/:questionId", () => {
    it("should return the response of a question from a given project and 200 status", async () => {
      const { project, question } = await seedWithProjectAndQuestion();
      const response = await newResponse({
        projectId: project.projectId,
        questionId: question.questionId,
      });

      const res = await request(app).get(
        `/api/response/get/project/${project.projectId}/question/${question.questionId}`
      );

      expect(res.status).toBe(200);
      expect(res.body[0].label).toBe(response.label);
      expect(res.body[0].projectId).toBe(project.projectId);
      expect(res.body[0].questionId).toBe(question.questionId);
    });

    it("should return an empty array if no response(s) found for the given question of a project and 200 status", async () => {
      const { project, question } = await seedWithProjectAndQuestion();
      const res = await request(app).get(
        `/api/response/get/project/${project.projectId}/question/${question.questionId}`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    it("should return 400 status if Invalid projectId", async () => {
      const res = await request(app).get(
        `/api/response/get/project/abc/question/1`
      );

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid projectId" });
    });

    it("should return 404 status if project does not exist", async () => {
      const question = await newQuestion();

      const res = await request(app).get(
        `/api/response/get/project/999/question/${question.questionId}`
      );

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Project not found" });
    });

    it("should return 404 status if question does not exist", async () => {
      const { project, _ } = await seedWithProjectAndQuestion();
      const res = await request(app).get(
        `/api/response/get/project/${project.projectId}/question/999`
      );

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Question not found" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(responseService, "getResponsesByQuestionOfProject")
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).get(
        "/api/response/get/project/1/question/1"
      );

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      responseService.getResponsesByQuestionOfProject.mockRestore();
    });
  });

  describe("GET - /api/response/get/:responseId/subresponse", () => {
    it("should return the subresponse list of a response and 200 status", async () => {
      const { responseParent, _ } = await seedResponseWithSubresponse();

      const res = await request(app).get(
        `/api/response/get/${responseParent.responseId}/subresponse`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(responseParent.children.length);
      expect(res.body[0].responseIdParent).toBe(responseParent.responseId);
    });

    it("should return an empty list if no subresponse found and 200 status", async () => {
      const { project, question } = await seedWithProjectAndQuestion();
      const responseParent = await newResponse({
        projectId: project.projectId,
        questionId: question.questionId,
      });

      const res = await request(app).get(
        `/api/response/get/${responseParent.responseId}/subresponse`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    it("should return 400 status if invalid responseIdParent", async () => {
      const res = await request(app).get(`/api/response/get/abc/subresponse`);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid responseId" });
    });

    it("should return 404 status if parent response does not exist", async () => {
      const res = await request(app).get(`/api/response/get/999/subresponse`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "ResponseParent not found" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(responseService, "getSubResponses")
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).get("/api/response/get/1/subresponse");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      responseService.getSubResponses.mockRestore();
    });
  });

  describe("PATCH - /api/response/update/:responseId", () => {
    it("should update an existing response and return 200 status", async () => {
      const { project, question } = await seedWithProjectAndQuestion();
      const response = await newResponse({
        projectId: project.projectId,
        questionId: question.questionId,
      });
      const newData = { label: "new Response Label" };

      const res = await request(app)
        .patch(`/api/response/update/${response.responseId}`)
        .send(newData);

      expect(res.status).toBe(200);
      expect(res.body.label).toBe(newData.label);
    });

    it("should return 400 status if label is missing or empty", async () => {
      const { project, question } = await seedWithProjectAndQuestion();
      const response = await newResponse({
        projectId: project.projectId,
        questionId: question.questionId,
      });
      const newData = { label: "" };

      const res = await request(app)
        .patch(`/api/response/update/${response.responseId}`)
        .send(newData);

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: "label", msg: "label is required" }),
        ])
      );
    });

    it("should return 400 status if invalid responseId", async () => {
      const res = await request(app)
        .patch("/api/response/update/abc")
        .send({ label: "label" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid responseId" });
    });

    it("should return 404 status if response does not exist", async () => {
      const res = await request(app)
        .patch("/api/response/update/999")
        .send({ label: "label" });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Response not found" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(responseService, "updateResponse")
        .mockRejectedValue(new Error("Database error"));

      const payload = { label: "new label" };

      const res = await request(app)
        .patch("/api/response/update/1")
        .send(payload);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      responseService.updateResponse.mockRestore();
    });
  });

  describe("DELETE - /api/response/delete/:responseId", () => {
    it("should delete an existing response and return 204 status", async () => {
      const { project, question } = await seedWithProjectAndQuestion();
      const response = await newResponse({
        projectId: project.projectId,
        questionId: question.questionId,
      });

      const res = await request(app).delete(
        `/api/response/delete/${response.responseId}`
      );

      expect(res.status).toBe(204);

      // Verify it actually delete in the DB
      const responseInDb = await global.prisma.response.findUnique({
        where: { responseId: response.responseId },
      });

      expect(responseInDb).toBeNull();
    });

    it("should return 400 status if invalid responseId", async () => {
      const res = await request(app).delete("/api/response/delete/abc");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Invalid responseId" });
    });

    it("should return 404 status if response does not exist", async () => {
      const res = await request(app).delete("/api/response/delete/999");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Response not found" });
    });

    it("should return 500 status if prisma throws an error", async () => {
      // Mock service to throw
      jest
        .spyOn(responseService, "deleteResponse")
        .mockRejectedValue(new Error("Database error"));

      const res = await request(app).delete("/api/response/delete/1");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Internal server error" });

      // Restore original implementation
      responseService.deleteResponse.mockRestore();
    });
  });
});
