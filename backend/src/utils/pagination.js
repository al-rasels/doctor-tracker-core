export const calculatePagination = (params = {}, totalCount = 0) => {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  const meta = {
    page,
    limit,
    total: totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };

  return { page, limit, skip, meta };
};

