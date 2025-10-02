function getPaginationOptions(page = 1, limit = 10) {
  const take = limit;
  const skip = (page - 1) * limit;
  return { skip, take, page, limit };
}

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
