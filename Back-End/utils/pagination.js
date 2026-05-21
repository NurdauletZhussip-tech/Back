function toPositiveInteger(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getPagination(query = {}, defaultLimit = 20) {
  const page = toPositiveInteger(query.page, 1);
  const limit = toPositiveInteger(query.limit, defaultLimit);

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
}

function buildPaginationMeta(totalItems, page, limit) {
  return {
    totalItems,
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    itemsPerPage: limit
  };
}

module.exports = {
  buildPaginationMeta,
  getPagination,
  toPositiveInteger
};
