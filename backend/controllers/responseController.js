const { prisma } = require("../prisma/prismaClient");

// Create a new response
module.exports.createResponse = async (req, res) => {
  const { label, projectId, questionId, optionId, questionIdParent } = req.body;

  try {
    const response = await prisma.response.create({
      data: {
        label: label || null,
        projectId: projectId,
        questionId: questionId,
        optionId: optionId || null,
        questionIdParent: questionIdParent || null,
      },
    });
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating response:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
