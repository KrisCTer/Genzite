export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Parse and sanitize pagination query params.
 * Defaults: page=1, limit=20. Max limit=100.
 */
export function parsePagination(query: { page?: string | number; limit?: string | number }): PaginationParams {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  return { page, limit };
}

/**
 * Calculate the skip value for Prisma queries.
 */
export function paginationSkip(params: PaginationParams): number {
  return (params.page - 1) * params.limit;
}

/**
 * Build a paginated response from Prisma query results.
 */
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResult<T> {
  return {
    data,
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit),
  };
}
