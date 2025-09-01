const responseController = require("../../controllers/responseController");
const responseService = require("../../services/responseService");
const { createMockResponse } = require("../helpers/responseHelper");
const { expectError } = require("../helpers/errorHelper");

jest.mock("../../services/responseService");

describe("Response Controller - createResponse", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();

    req = {
      body: {
        label: "Sample answer",
        projectId: 1,
        questionId: 1,
        optionId: null,
        responseIdParent: null,
      },
    };
    res = createMockResponse();
    next = jest.fn();
  });

  it("should create a response and return 201 status", async () => {
    const mockResponse = { responseId: 1, ...req.body };
    responseService.createResponse.mockResolvedValue(mockResponse);

    await responseController.createResponse(req, res, next);

    expect(responseService.createResponse).toHaveBeenCalledWith({
      label: req.body.label,
      projectId: req.body.projectId,
      questionId: req.body.questionId,
      optionId: req.body.optionId,
      responseIdParent: req.body.responseIdParent,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it("should handle service errors and return 500 status", async () => {
    await expectError(
      responseController.createResponse,
      req,
      res,
      () =>
        responseService.createResponse.mockRejectedValue(
          new Error("Database error")
        ),
      500,
      "Internal server error"
    );
    expect(responseService.createResponse).toHaveBeenCalled();
  });
});

// describe("update Response Controller", () => {
//   let req, res;

//   beforeEach(() => {
//     jest.clearAllMocks();
//     console.error = jest.fn();

//     req = {
//       params: { responseId: 1 },
//       body: {
//         label: "Updated answer",
//         projectId: 1,
//         questionId: 1,
//         optionId: null,
//         questionIdParent: null,
//       },
//     };
//     res = mockResponse();
//   });

//   it("should update a response successfully", async () => {
//     prisma.response.findUnique.mockResolvedValue({ responseId: 1 });
//     const mockedResponse = {
//       responseId: 1,
//       ...req.body,
//     };
//     prisma.response.update.mockResolvedValue(mockedResponse);

//     await updateResponse(req, res);

//     expect(prisma.response.update).toHaveBeenCalledWith({
//       where: { responseId: parseInt(req.params.responseId) },
//       data: {
//         label: req.body.label,
//         projectId: req.body.projectId,
//         questionId: req.body.questionId,
//         optionId: req.body.optionId,
//         questionIdParent: req.body.questionIdParent,
//       },
//     });
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith(mockedResponse);
//   });

//   it("should return 400 for invalid responseId", async () => {
//     req.params.responseId = "invalid";
//     await expectError(
//       updateResponse,
//       req,
//       res,
//       () => {},
//       400,
//       "Bad Request: Invalid responseId"
//     );
//     expect(prisma.response.update).not.toHaveBeenCalled();
//   });

//   it("should return 404 if response to update does not exist", async () => {
//     await expectError(
//       updateResponse,
//       req,
//       res,
//       () => prisma.response.findUnique.mockResolvedValue(null),
//       404,
//       "Response not found"
//     );
//     expect(prisma.response.update).not.toHaveBeenCalled();
//   });

//   it("should handle errors during response update and return 500", async () => {
//     await expectError(
//       updateResponse,
//       req,
//       res,
//       () => {
//         prisma.response.findUnique.mockResolvedValue({ responseId: 1 });
//         prisma.response.update.mockRejectedValue(new Error("DB error"));
//       },
//       500,
//       "Internal Server Error"
//     );
//     expect(prisma.response.update).toHaveBeenCalled();
//   });
// });

// describe("Delete Response Controller", () => {
//   let req, res;

//   beforeEach(() => {
//     jest.clearAllMocks();
//     console.error = jest.fn();

//     req = { params: { responseId: 1 } };
//     res = mockResponse();
//   });

//   it("should delete a response successfully", async () => {
//     prisma.response.findUnique.mockResolvedValue({ responseId: 1 });
//     prisma.response.delete.mockResolvedValue({ responseId: 1 });

//     await deleteResponse(req, res);

//     expect(prisma.response.delete).toHaveBeenCalledWith({
//       where: { responseId: parseInt(req.params.responseId) },
//     });
//     expect(res.status).toHaveBeenCalledWith(204);
//     expect(res.send).toHaveBeenCalled();
//   });

//   it("should return 400 for invalid responseId", async () => {
//     req.params.responseId = "invalid";
//     await expectError(
//       deleteResponse,
//       req,
//       res,
//       () => {},
//       400,
//       "Bad Request: Invalid responseId"
//     );
//     expect(prisma.response.delete).not.toHaveBeenCalled();
//   });

//   it("should return 404 if response to delete does not exist", async () => {
//     await expectError(
//       deleteResponse,
//       req,
//       res,
//       () => prisma.response.findUnique.mockResolvedValue(null),
//       404,
//       "Response not found"
//     );
//     expect(prisma.response.delete).not.toHaveBeenCalled();
//   });

//   it("should handle errors during response deletion and return 500", async () => {
//     await expectError(
//       deleteResponse,
//       req,
//       res,
//       () => {
//         prisma.response.findUnique.mockResolvedValue({ responseId: 1 });
//         prisma.response.delete.mockRejectedValue(new Error("DB error"));
//       },
//       500,
//       "Internal Server Error"
//     );
//     expect(prisma.response.delete).toHaveBeenCalled();
//   });
// });

// describe("Get all response by project Controller", () => {
//   let req, res;

//   beforeEach(() => {
//     jest.clearAllMocks();
//     console.error = jest.fn();

//     req = {
//       params: { projectId: 1 },
//     };
//     res = mockResponse();
//   });

//   it("should retrieve all responses successfully", async () => {
//     const mockedResponse = [
//       {
//         responseId: 1,
//         label: "Sample answer",
//         projectId: 1,
//         questionId: 1,
//         optionId: null,
//         questionIdParent: null,
//       },
//       {
//         responseId: 2,
//         label: "Another answer",
//         projectId: 1,
//         questionId: 2,
//         optionId: null,
//         questionIdParent: null,
//       },
//     ];
//     prisma.response.findMany.mockResolvedValue(mockedResponse);

//     await getAllResponseByProject(req, res);

//     expect(prisma.response.findMany).toHaveBeenCalledWith({
//       where: {
//         projectId: 1,
//       },
//     });
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith(mockedResponse);
//   });

//   it("should return 400 for invalid projectId", async () => {
//     req.params.projectId = "invalid";
//     await expectError(
//       getAllResponseByProject,
//       req,
//       res,
//       () => {},
//       400,
//       "Bad Request: Invalid projectId"
//     );
//     expect(prisma.response.findMany).not.toHaveBeenCalled();
//   });

//   it("should handle errors during response retrieval and return 500", async () => {
//     await expectError(
//       getAllResponseByProject,
//       req,
//       res,
//       () => prisma.response.findMany.mockRejectedValue(new Error("DB error")),
//       500,
//       "Internal Server Error"
//     );
//     expect(prisma.response.findMany).toHaveBeenCalled();
//   });
// });
