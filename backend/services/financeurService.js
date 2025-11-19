const { prisma } = require('../prisma/prismaClient');

/**
 * Create a new financeur
 * @param {string} financeurName - Name of the financeur
 * @returns {Promise<Object>} Created financeur object
 */
module.exports.createFinanceur = async (financeurName) => {
  return await prisma.financeur.create({
    data: {
      FinanceurName: financeurName,
    },
  });
};

/**
 * Get all financeurs
 * @returns {Promise<Array>} List of all financeurs
 */
module.exports.getAllFinanceurs = async () => {
  return await prisma.financeur.findMany({
    include: {
      FinanceurProjet: true,
    },
  });
};

/**
 * Get a specific financeur by ID
 * @param {number} financeurId - ID of the financeur
 * @returns {Promise<Object|null>} Financeur object or null if not found
 */
module.exports.getFinanceurById = async (financeurId) => {
  return await prisma.financeur.findUnique({
    where: { financeurId: parseInt(financeurId, 10) },
    include: {
      FinanceurProjet: {
        include: {
          project: true,
        },
      },
    },
  });
};

/**
 * Update a financeur
 * @param {number} financeurId - ID of the financeur to update
 * @param {Object} data - Data to update (e.g., { FinanceurName: "New Name" })
 * @returns {Promise<Object>} Updated financeur object
 */
module.exports.updateFinanceur = async (financeurId, data) => {
  return await prisma.financeur.update({
    where: { financeurId: parseInt(financeurId, 10) },
    data: data,
    include: {
      FinanceurProjet: true,
    },
  });
};

/**
 * Delete a financeur
 * @param {number} financeurId - ID of the financeur to delete
 * @returns {Promise<Object>} Deleted financeur object
 */
module.exports.deleteFinanceur = async (financeurId) => {
  return await prisma.financeur.delete({
    where: { financeurId: parseInt(financeurId, 10) },
  });
};

/**
 * Get financeurs for a specific project
 * @param {number} projectId - ID of the project
 * @returns {Promise<Array>} List of financeurs for the project
 */
module.exports.getFinanceursByProject = async (projectId) => {
  return await prisma.financeurProjet.findMany({
    where: { projectId: parseInt(projectId, 10) },
    include: {
      financeur: true,
      project: true,
    },
  });
};

/**
 * Add a financeur to a project (or update the relationship)
 * @param {number} projectId - ID of the project
 * @param {number} financeurId - ID of the financeur
 * @param {number} pourcentage - Funding percentage
 * @param {number} montant - Funding amount
 * @returns {Promise<Object>} Created/Updated FinanceurProjet relation
 */
module.exports.addFinanceurToProject = async (projectId, financeurId, pourcentage, montant) => {
  return await prisma.financeurProjet.upsert({
    where: {
      projectId_financeurId: {
        projectId: parseInt(projectId, 10),
        financeurId: parseInt(financeurId, 10),
      },
    },
    update: {
      pourcentage: parseInt(pourcentage, 10),
      montant: parseInt(montant, 10),
    },
    create: {
      projectId: parseInt(projectId, 10),
      financeurId: parseInt(financeurId, 10),
      pourcentage: parseInt(pourcentage, 10),
      montant: parseInt(montant, 10),
    },
    include: {
      financeur: true,
      project: true,
    },
  });
};

/**
 * Remove a financeur from a project
 * @param {number} projectId - ID of the project
 * @param {number} financeurId - ID of the financeur
 * @returns {Promise<Object>} Deleted FinanceurProjet relation
 */
module.exports.removeFinanceurFromProject = async (projectId, financeurId) => {
  return await prisma.financeurProjet.delete({
    where: {
      projectId_financeurId: {
        projectId: parseInt(projectId, 10),
        financeurId: parseInt(financeurId, 10),
      },
    },
  });
};
