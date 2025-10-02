/**
 * Helper function to generate pagination options for database queries.
 *
 * @function getPaginationOptions
 * @param {number} [page=1] - The current page number (1-based).
 * @param {number} [limit=10] - The number of items per page.
 * @returns {Object} an object containing:
 * - skip: Number of items to skip (for offset).
 * - take: Number of items to take (page size).
 * - page: The current page number.
 * - limit: The number of items per page.
 */
function getPaginationOptions(page = 1, limit = 10) {
  const take = limit;
  const skip = (page - 1) * limit;
  return { skip, take, page, limit };
}

/**
 * Helper function to generate pagination metadata.
 *
 * @function getPaginationMeta
 * @param {number} totalItems - Total number of items available.
 * @param {number} page - The current page number.
 * @param {number} limit - The number of items per page.
 * @returns {Object} an object containing:
 * - totalItems: Total number of items.
 * - currentPage: The current page number.
 * - pageSize: The number of items per page.
 * - totalPages: The total number of pages.
 */
function getPaginationMeta(totalItems, page, limit) {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    totalItems,
    currentPage: page,
    pageSize: limit,
    totalPages,
  };
}

module.exports = { getPaginationOptions, getPaginationMeta };
