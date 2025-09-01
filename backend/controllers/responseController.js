const responseService = require("../services/responseService");

// Create a new response
module.exports.createResponse = async (req, res) => {
  const { label, projectId, questionId, optionId, responseIdParent } = req.body;

  try {
    const response = await responseService.createResponse({
      label: label ?? null,
      projectId: projectId,
      questionId: questionId,
      optionId: optionId ?? null,
      responseIdParent: responseIdParent ?? null,
    });
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating response:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a response by ID
module.exports.updateResponse = async (req, res) => {
  const { responseId } = req.params;
  // Check if responseId is a number
  if (isNaN(responseId)) {
    return res.status(400).json({ error: "Bad request: Invalid responseId" });
  }

  const { label, projectId, questionId, optionId, responseIdParent } = req.body;

  try {
    const response = await responseService.updateResponse(responseId, {
      label: label ?? null,
      projectId: projectId,
      questionId: questionId,
      optionId: optionId ?? null,
      responseIdParent: responseIdParent ?? null,
    });
    res.status(200).json(response);
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ error: "Response not found" });
    }
    console.error("Error updating response:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// // Delete an existing response
// module.exports.deleteResponse = async (req, res) => {
//   const { responseId } = req.params;
//   // check if id is a valid number
//   if (isNaN(responseId)) {
//     return res.status(400).json({ error: "Bad Request: Invalid responseId" });
//   }

//   try {
//     // check if response exists
//     const existingResponse = await prisma.response.findUnique({
//       where: { responseId: parseInt(responseId) },
//     });
//     if (!existingResponse) {
//       return res.status(404).json({ error: "Response not found" });
//     }

//     await prisma.response.delete({
//       where: { responseId: parseInt(responseId) },
//     });
//     res.status(204).send();
//   } catch (error) {
//     console.error("Error deleting response:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Get all responses for a project
// module.exports.getAllResponseByProject = async (req, res) => {
//   const { projectId } = req.params;
//   // check if projectId is a valid number
//   if (isNaN(projectId)) {
//     return res.status(400).json({ error: "Bad Request: Invalid projectId" });
//   }

//   try {
//     const responses = await prisma.response.findMany({
//       where: {
//         projectId: parseInt(projectId),
//       },
//     });
//     res.status(200).json(responses);
//   } catch (error) {
//     console.error("Error fetching responses:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
