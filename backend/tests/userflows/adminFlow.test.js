/**
 * @fileoverview
 * Integration tests for the Admin Flow.
 *
 * @module adminFlow.test
 *
 * @description
 * Tests the full admin lifecycle operations on Questions, Types, Projects,
 * Subquestions, and Options using a seeded test database.
 * Covers:
 *  - Navigating on questions list pages.
 *  - Managing question types and linking them to projects
 *  - Creating, updating, and deleting project-specific and type-specific questions
 *  - Fetching questions by project and verifying relational integrity
 *  - Managing hierarchical relationships: questions, subquestions, and options
 *
 * Uses Supertest and a test database setup with seeded Client, Manager, and Project data.
 *
 * @example
 * // Run all integration tests for the Admin Flow
 * // NODE_ENV=test npx jest --config jest.config.userflow.js tests/userflows/adminFlow.test.js
 *
 * @tests
 * - Allowing an admin to:
 *   - Create and update question types
 *   - Link types to projects
 *   - Create type-specific and project-specific questions
 *   - Update and delete questions
 *   - Adding options to question
 *   - Fetch project-level questions and verify integrity after changes
 * - Handling hierarchical questions:
 *   - Creating a question with subquestions
 *   - Fetching subquestions
 */
const request = require("supertest");
const app = require("../../index");
const {
  seedProjectWithClientAndManager,
  seedWith12Questions,
} = require("../helpers/seed");

describe("Admin flow - Naviation", () => {
  let questions;

  beforeEach(async () => {
    // Seed db with questions
    questions = await seedWith12Questions();
  });

  it("should allow admin to navigate questions", async () => {
    // Admin retrieve the page 1 of questions (10)
    // System: fetch the first 10 questions
    const first10Questions = await request(app).get(
      `/api/question/get?page=1&limit=10`
    );

    expect(first10Questions.status).toBe(200);
    expect(first10Questions.body.data).toHaveLength(10);
    expect(first10Questions.body.data[0].questionId).toBe(1);
    expect(first10Questions.body.data[9].questionId).toBe(10);
    expect(first10Questions.body.meta).toEqual(
      expect.objectContaining({
        total: 12,
        page: 1,
        limit: 10,
        totalPages: 2,
      })
    );

    // Admin navigate to the next page.
    // System: fetch the next page of questions (2)
    const nextPage = await request(app).get(
      `/api/question/get?page=2&limit=10`
    );

    expect(nextPage.status).toBe(200);
    expect(nextPage.body.data).toHaveLength(2);
    expect(nextPage.body.data[0].questionId).toBe(11);
    expect(nextPage.body.data[1].questionId).toBe(12);
    expect(nextPage.body.meta).toEqual(
      expect.objectContaining({
        total: 12,
        page: 2,
        limit: 10,
        totalPages: 2,
      })
    );
  });
});

describe("Admin Flow - Management", () => {
  let project;

  beforeEach(async () => {
    // Seed db with a Client, a User (Manager) and a project
    const seeded = await seedProjectWithClientAndManager();
    project = seeded.project;
  });

  it("should allow admin to manage questions to a project", async () => {
    // Admin creates a new type
    const createdType = await request(app)
      .post("/api/type/create")
      .send({ label: "General" });
    expect(createdType.status).toBe(201);

    // Admin create a type-specific question
    const createdTypeQuestion = await request(app)
      .post("/api/question/create")
      .send({
        label: "A general question",
        category: "Idea",
        types: [createdType.body.typeId],
      });
    expect(createdTypeQuestion.status).toBe(201);

    // Admin links the type to the project
    const updatedType = await request(app)
      .patch(`/api/type/update/${createdType.body.typeId}`)
      .send({ label: createdType.body.label, addProject: [project.projectId] });
    expect(updatedType.status).toBe(200);

    // Admin creates a project-specific question
    const createdProjectQuestion = await request(app)
      .post("/api/question/create")
      .send({
        label: "Question 01",
        category: "Idea",
        projects: [project.projectId],
      });
    expect(createdProjectQuestion.status).toBe(201);

    // System: fetch all project questions
    const allquestionsFromProject = await request(app).get(
      `/api/question/get/project/${project.projectId}`
    );
    expect(allquestionsFromProject.status).toBe(200);
    expect(allquestionsFromProject.body).toHaveLength(2);
    expect(allquestionsFromProject.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "A general question",
          category: "Idea",
        }),
        expect.objectContaining({ label: "Question 01", category: "Idea" }),
      ])
    );

    // Admin update the type-specific question
    const updatedTypeQuestion = await request(app)
      .patch(`/api/question/update/${createdTypeQuestion.body.questionId}`)
      .send({
        label: "Updated Question Label",
        category: createdTypeQuestion.body.category,
      });
    expect(updatedTypeQuestion.status).toBe(200);
    expect(updatedTypeQuestion.body.label).toBe("Updated Question Label");

    // Admin delete the project-specific question
    const deletedProjectQuestion = await request(app).delete(
      `/api/question/delete/${createdProjectQuestion.body.questionId}`
    );
    expect(deletedProjectQuestion.status).toBe(204);

    // System: try fetching the deleted project-specific question
    const checkDeletedProjectQuestion = await request(app).get(
      `/api/question/get/${createdProjectQuestion.body.questionId}`
    );
    expect(checkDeletedProjectQuestion.status).toBe(404);

    // System: fetch all project questions atfer changes
    const refetchAllQuestions = await request(app).get(
      `/api/question/get/project/${project.projectId}`
    );
    expect(refetchAllQuestions.status).toBe(200);
    expect(refetchAllQuestions.body).toHaveLength(1);
    expect(refetchAllQuestions.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Updated Question Label",
          category: "Idea",
        }),
      ])
    );
  });

  it("should allow admin to create a question with options", async () => {
    // Admin create a new question
    const question = await request(app).post(`/api/question/create`).send({
      label: "Question with 4 options",
      category: "Idea",
      projectId: project.projectId,
    });
    expect(question.status).toBe(201);

    // Admin create 4 options to the question
    const option1 = await request(app).post(`/api/option/create`).send({
      label: "Opt1",
      questionId: question.body.questionId,
    });
    expect(option1.status).toBe(201);

    const option2 = await request(app).post(`/api/option/create`).send({
      label: "Opt2",
      questionId: question.body.questionId,
    });
    expect(option2.status).toBe(201);

    const option3 = await request(app).post(`/api/option/create`).send({
      label: "Opt3",
      questionId: question.body.questionId,
    });
    expect(option3.status).toBe(201);

    const option4 = await request(app).post(`/api/option/create`).send({
      label: "Opt4",
      questionId: question.body.questionId,
    });
    expect(option4.status).toBe(201);

    // System: refetch the question with options
    const questionWithOptions = await request(app).get(
      `/api/question/get/${question.body.questionId}`
    );
    expect(questionWithOptions.status).toBe(200);
    expect(questionWithOptions.body.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Opt1",
          questionId: question.body.questionId,
        }),
        expect.objectContaining({
          label: "Opt2",
          questionId: question.body.questionId,
        }),
        expect.objectContaining({
          label: "Opt3",
          questionId: question.body.questionId,
        }),
        expect.objectContaining({
          label: "Opt4",
          questionId: question.body.questionId,
        }),
      ])
    );
  });

  it("should allow admin to create a question with subquestions with/without options", async () => {
    // Admin create a new question
    const createdQuestion = await request(app)
      .post("/api/question/create")
      .send({
        label: "Question 01",
        category: "Idea",
      });
    expect(createdQuestion.status).toBe(201);

    // Admin create a new subquestion
    const createdSubquestion1 = await request(app)
      .post("/api/question/create")
      .send({
        label: "Subquestion 01 of Question 01",
        category: "Idea",
        questionIdParent: createdQuestion.body.questionId,
      });
    expect(createdSubquestion1.status).toBe(201);

    // Admin create a new subquestion that will have 2 option
    const createdSubquestion2 = await request(app)
      .post("/api/question/create")
      .send({
        label: "Subquestion 02 of Question 01",
        category: "Idea",
        numberOfSelectionableOpt: 1,
        questionIdParent: createdQuestion.body.questionId,
      });
    expect(createdSubquestion2.status).toBe(201);

    // Admin create 2 new options for the subquestion
    const option1 = await request(app).post("/api/option/create").send({
      label: "Option 01 of Subquestion 02",
      questionId: createdSubquestion2.body.questionId,
    });
    expect(option1.status).toBe(201);

    const option2 = await request(app).post("/api/option/create").send({
      label: "Option 02 of Subquestion 02",
      questionId: createdSubquestion2.body.questionId,
    });
    expect(option2.status).toBe(201);

    // System: fetch the first question
    const firstQuestion = await request(app).get(
      `/api/question/get/${createdQuestion.body.questionId}`
    );
    expect(firstQuestion.status).toBe(200);
    expect(firstQuestion.body.label).toBe("Question 01");

    // System: fetch the first question subquestions
    const allSubquestions = await request(app).get(
      `/api/question/get/${firstQuestion.body.questionId}/subquestion`
    );
    expect(allSubquestions.status).toBe(200);
    expect(allSubquestions.body).toHaveLength(2);
    expect(allSubquestions.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Subquestion 01 of Question 01" }),
        expect.objectContaining({ label: "Subquestion 02 of Question 01" }),
      ])
    );

    // System: fetch the subquestion with options
    const subquestionWithOptions = await request(app).get(
      `/api/question/get/${allSubquestions.body[1].questionId}`
    );
    expect(subquestionWithOptions.status).toBe(200);
    expect(subquestionWithOptions.body.options).toHaveLength(2);
    expect(subquestionWithOptions.body.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Option 01 of Subquestion 02",
          questionId: createdSubquestion2.body.questionId,
        }),
        expect.objectContaining({
          label: "Option 02 of Subquestion 02",
          questionId: createdSubquestion2.body.questionId,
        }),
      ])
    );
  });
});
