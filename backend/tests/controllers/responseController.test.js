// const {
//   createResponse,
//   updateResponse,
//   deleteResponse,
//   getAllResponseByProject,
// } = require("../../controllers/responseController");
// const { prisma } = require("../../prisma/prismaClient");
// const { mockResponse } = require("../helpers/responseHelper");
// const { expectError } = require("../helpers/errorHelper");

// jest.mock("../../prisma/prismaClient", () => ({
//   prisma: {
//     response: {
//       create: jest.fn(),
//       findMany: jest.fn(),
//       update: jest.fn(),
//       delete: jest.fn(),
//       findUnique: jest.fn(),
//     },
//   },
// }));

// describe("Create Response Controller", () => {
//   let req, res;

//   beforeEach(() => {
//     jest.clearAllMocks();
//     console.error = jest.fn();

//     req = {
//       body: {
//         label: "Sample answer",
//         projectId: 1,
//         questionId: 1,
//         optionId: null,
//         questionIdParent: null,
//       },
//     };
//     res = mockResponse();
//   });

//   it("should create a response successfully", async () => {
//     const mockedResponse = {
//       responseId: 1,
//       ...req.body,
//     };
//     prisma.response.create.mockResolvedValue(mockedResponse);

//     await createResponse(req, res);

//     expect(prisma.response.create).toHaveBeenCalledWith({
//       data: {
//         label: req.body.label,
//         projectId: req.body.projectId,
//         questionId: req.body.questionId,
//         optionId: req.body.optionId,
//         questionIdParent: req.body.questionIdParent,
//       },
//     });
//     expect(res.status).toHaveBeenCalledWith(201);
//     expect(res.json).toHaveBeenCalledWith(mockedResponse);
//   });

//   it("should handle errors during response creation and return 500", async () => {
//     await expectError(
//       createResponse,
//       req,
//       res,
//       () => prisma.response.create.mockRejectedValue(new Error("DB error")),
//       500,
//       "Internal Server Error"
//     );
//     expect(prisma.response.create).toHaveBeenCalled();
//   });
// });

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
