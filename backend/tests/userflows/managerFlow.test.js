/**
 * @fileoverview
 * Integration tests for the Manager Flow.
 *
 * @module managerFlow.test
 *
 * @description
 * Tests the lifecycle of a Manager managing responses within a project context.
 * Covers:
 *  - Creating, updating, deleting, and fetching responses for project questions
 *  - Handling responses to option-based questions
 *  - Managing multiple responses when questions allow it
 *  - Working with nested questions and maintaining relational integrity between parent and child responses
 *
 * Uses Supertest and a test database setup with seeded Project and Question data.
 *
 * @example
 * // Run all integration tests for the Manager Flow
 * // NODE_ENV=test npx jest --config jest.config.userflow.js tests/userflows/managerFlow.test.js
 *
 * @tests
 * - Allowing a Manager to:
 *   - Create, update, fetch, and delete responses to project questions
 *   - Respond to option-based questions by selecting options
 *   - Submit multiple responses when allowed (hasMultipleOpenResponse)
 *   - Answer nested questions, linking responses to parent responses
 * - Validating system behavior:
 *   - Ensuring deleted responses cannot be retrieved
 *   - Maintaining parent-child relationships between questions and responses
 *   - Correctly returning responses when fetching questions and subquestions
 */
const request = require("supertest");
const app = require("../../index");
const { seedWithProjectAndQuestion } = require("../helpers/seed");

describe("Manager Flow", () => {
  let project;

  beforeEach(async () => {
    const seeded = await seedWithProjectAndQuestion();
    project = seeded.project;
    questionSeed = seeded.question;
  });

  it("should allow a Manager of a project to manage a response of a question", async () => {
    // System: fetch the project question to display
    const questions = await request(app).get(
      `/api/question/get/project/${project.projectId}`
    );
    expect(questions.status).toBe(200);

    // The question
    const question = questions.body[0];

    // Manager enter response data
    const payload = {
      label: "Response of the question",
      projectId: project.projectId,
      questionId: question.questionId,
    };

    // System: create the response in db
    const createdResponse = await request(app)
      .post("/api/response/create")
      .send(payload);
    expect(createdResponse.status).toBe(201);
    expect(createdResponse.body).toMatchObject({
      label: "Response of the question",
      projectId: project.projectId,
      questionId: question.questionId,
    });

    // System: fetch the response of the question
    const fetchResponse = await request(app).get(
      `/api/response/get/project/${project.projectId}/question/${question.questionId}`
    );
    expect(fetchResponse.status).toBe(200);
    expect(fetchResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Response of the question",
          projectId: project.projectId,
          questionId: question.questionId,
        }),
      ])
    );

    // Manager update the response
    const newData = {
      label: "Updated response to the question",
      projectId: project.projectId,
      questionId: question.questionId,
    };
    const updatedResponse = await request(app)
      .patch(`/api/response/update/${fetchResponse.body[0].responseId}`)
      .send(newData);
    expect(updatedResponse.status).toBe(200);

    // System: refetch the response of the question
    const refetchResponse = await request(app).get(
      `/api/response/get/project/${project.projectId}/question/${question.questionId}`
    );
    expect(refetchResponse.status).toBe(200);
    expect(refetchResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Updated response to the question",
          projectId: project.projectId,
          questionId: question.questionId,
        }),
      ])
    );

    // Manager delete the response of the question
    const deletedResponse = await request(app).delete(
      `/api/response/delete/${refetchResponse.body[0].responseId}`
    );
    expect(deletedResponse.status).toBe(204);

    //System: try fetching the deleted response of the question
    const checkDeletedResponse = await request(app).get(
      `/api/response/get/${refetchResponse.body[0].responseId}`
    );
    expect(checkDeletedResponse.status).toBe(404);

    // System: fetch the project question with no response
    const refetchQuestion = await request(app).get(
      `/api/question/get/${question.questionId}`
    );
    expect(refetchQuestion.status).toBe(200);
    expect(refetchQuestion.body.responses).toHaveLength(0);
  });

  it("should allow a Manager to manage a response to a options-question", async () => {
    // Setup: add an options-question to the project
    const createdOptionsQuestion = await request(app)
      .post(`/api/question/create`)
      .send({
        label: "A question with options",
        category: "Idea",
        numberOfSelectionableOpt: 1,
        projects: [project.projectId],
        options: ["Opt1", "Opt2"],
      });
    expect(createdOptionsQuestion.status).toBe(201);

    // System: fetch questions of a project
    const questions = await request(app).get(
      `/api/question/get/project/${project.projectId}`
    );
    expect(questions.status).toBe(200);
    expect(questions.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Default Question",
          category: "Default",
        }),
        expect.objectContaining({
          label: "A question with options",
          category: "Idea",
        }),
      ])
    );

    // System: fetch the options-question
    const optionsQuestion = await request(app).get(
      `/api/question/get/${questions.body[1].questionId}`
    );
    expect(optionsQuestion.status).toBe(200);
    expect(optionsQuestion.body.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Opt1",
          questionId: optionsQuestion.body.questionId,
        }),
        expect.objectContaining({
          label: "Opt2",
          questionId: optionsQuestion.body.questionId,
        }),
      ])
    );

    // Manager choose an option for response
    const payload = {
      label: optionsQuestion.body.options[1].label,
      projectId: project.projectId,
      questionId: optionsQuestion.body.questionId,
      optionId: optionsQuestion.body.options[1].optionId,
    };

    // System: create the reponse based on the choosen option
    const optionResponse = await request(app)
      .post(`/api/response/create`)
      .send(payload);
    expect(optionResponse.status).toBe(201);

    // System refetch the options-question with the response
    const refetchOptionsQuestion = await request(app).get(
      `/api/question/get/${questions.body[1].questionId}`
    );
    expect(refetchOptionsQuestion.status).toBe(200);
  });

  it("should allow a Manager to make multiple responses if question hasMultipleOpenResponse", async () => {
    // Setup: create a question to have multiple responses question
    const createdMultResQuestion = await request(app)
      .post(`/api/question/create`)
      .send({
        label: "A question with multiple response",
        category: "Idea",
        hasMultipleOpenResponse: true,
        projects: [project.projectId],
      });
    expect(createdMultResQuestion.status).toBe(201);

    // System: fetch questions to project
    const questions = await request(app).get(
      `/api/question/get/project/${project.projectId}`
    );
    expect(questions.status).toBe(200);

    // The question with multiple responses
    const multResQuestion = questions.body[1];

    // Manager enter responses data
    const payload1 = {
      label: "Response 1",
      projectId: project.projectId,
      questionId: multResQuestion.questionId,
    };

    const payload2 = {
      label: "Response 2",
      projectId: project.projectId,
      questionId: multResQuestion.questionId,
    };

    const payload3 = {
      label: "Response 3",
      projectId: project.projectId,
      questionId: multResQuestion.questionId,
    };

    // Create responses
    const response1 = await request(app)
      .post(`/api/response/create`)
      .send(payload1);

    const response2 = await request(app)
      .post(`/api/response/create`)
      .send(payload2);

    const response3 = await request(app)
      .post(`/api/response/create`)
      .send(payload3);
    expect(response1.status).toBe(201);
    expect(response2.status).toBe(201);
    expect(response3.status).toBe(201);

    // System fetch the question with responses
    const refetchmultResQuestion = await request(app).get(
      `/api/question/get/${multResQuestion.questionId}`
    );
    expect(refetchmultResQuestion.status).toBe(200);
    expect(refetchmultResQuestion.body.responses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Response 1",
          projectId: project.projectId,
          questionId: multResQuestion.questionId,
        }),
        expect.objectContaining({
          label: "Response 2",
          projectId: project.projectId,
          questionId: multResQuestion.questionId,
        }),
        expect.objectContaining({
          label: "Response 3",
          projectId: project.projectId,
          questionId: multResQuestion.questionId,
        }),
      ])
    );
  });

  it("should allow Manager to respond to nested questions", async () => {
    // Setup: added a nested question to the question
    const nestedQuestion = await request(app)
      .post(`/api/question/create`)
      .send({
        label: "Nested Question",
        category: "Idea",
        projectId: project.projectId,
        questionIdParent: questionSeed.questionId,
      });
    expect(nestedQuestion.status).toBe(201);

    // System: fetch parent question
    const parentQuestion = await request(app).get(
      `/api/question/get/${questionSeed.questionId}`
    );
    expect(parentQuestion.status).toBe(200);
    expect(parentQuestion.body.responses).toHaveLength(0);
    expect(parentQuestion.body.children).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Nested Question",
          category: "Idea",
          questionIdParent: questionSeed.questionId,
        }),
      ])
    );

    // Manager answer the the question
    const createdParentQuestionRes = await request(app)
      .post(`/api/response/create`)
      .send({
        label: "Response to parent question",
        projectId: project.projectId,
        questionId: parentQuestion.body.questionId,
      });
    expect(createdParentQuestionRes.status).toBe(201);

    // System: fetch subquestions
    const subquestions = await request(app).get(
      `/api/question/get/${parentQuestion.body.questionId}/subquestion`
    );
    expect(subquestions.status).toBe(200);

    // The subquestion
    const subquestion = subquestions.body[0];

    // Manager answer the subquestion
    const createdSubquestionRes = await request(app)
      .post(`/api/response/create`)
      .send({
        label: "Response to subquestion",
        projectId: project.projectId,
        questionId: subquestion.questionId,
        responseIdParent: createdParentQuestionRes.body.responseId,
      });
    expect(createdSubquestionRes.status).toBe(201);

    // System: refetch the parent question
    const refetchParentQuestion = await request(app).get(
      `/api/question/get/${parentQuestion.body.questionId}`
    );
    expect(refetchParentQuestion.status).toBe(200);
    expect(refetchParentQuestion.body.responses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Response to parent question",
          projectId: project.projectId,
          questionId: parentQuestion.body.questionId,
        }),
      ])
    );
    expect(refetchParentQuestion.body.children[0].responses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Response to subquestion",
          projectId: project.projectId,
          questionId: subquestion.questionId,
          responseIdParent: createdParentQuestionRes.body.responseId,
        }),
      ])
    );
  });
});
