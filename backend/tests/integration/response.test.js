const request = require("supertest");
const app = require("../../index");
const responseService = require("../../services/responseService");
const { newResponse } = require("../helpers/facory_function");
const {
  seedQuestionWithOptions,
  seedProjectWithResponses,
  seeResponseWithSubresponse,
  seedWithProjectAndQuestion,
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
      // Created a project manually via prisma studio for test
      // Temporary until we can create a project ourself
      // Fetch the project to get the projectId
      const project = await global.prisma.project.findUnique({
        where: { projectId: 1 },
      });
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

    // TODO: after modify the controller/service
    // it("should return 400 status if label is missing or empty", () => {

    // });

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
      const res = await request(app).get("/api/response/get/project/1");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(0);
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

  describe("GET - /api/response/get/:responseId/subresponse", () => {
    it("should return the subresponse list of a response and 200 status", async () => {
      const { responseParent, _ } = await seeResponseWithSubresponse();

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

    // TODO: after modify the controller/service
    // it("should return 400 status if label is missing or empty", () => {

    // });

    it("should return 404 status if response does not exist", async () => {
      const res = await request(app)
        .patch("/api/response/update/999")
        .send({ label: "a" });

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
