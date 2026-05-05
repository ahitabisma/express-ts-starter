import { Request } from "express";
import { FilteringQuery, RangedFilter, SearchFilterItem } from "../types/filter.type";

export function checkFilteringQuery(req: Request): FilteringQuery {
  const filter: FilteringQuery = {};

  if (req.query.orderKey) filter.orderKey = req.query.orderKey.toString();
  if (req.query.orderRule) filter.orderRule = req.query.orderRule.toString();
  if (req.query.filters)
    filter.filters = JSON.parse(req.query.filters.toString());
  if (req.query.searchFilters)
    filter.searchFilters = JSON.parse(req.query.searchFilters.toString());
  if (req.query.rangedFilters)
    filter.rangedFilters = JSON.parse(
      req.query.rangedFilters.toString(),
    ) as RangedFilter[];
  if (req.query.rows) filter.rows = Number(req.query.rows);
  if (req.query.page) filter.page = Number(req.query.page);
  if (req.query.q) filter.q = req.query.q.toString();

  return filter;
}

export interface BuildPrismaResult {
  where: Record<string, any>;
  orderBy: Record<string, string>;
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export function buildPrismaQuery(
  filter: FilteringQuery,
  allowedFields: string[],
  defaultOrder?: Record<string, string>,
): BuildPrismaResult {
  const where: Record<string, any> = {};

  // ── exact match ───────────────────────────────────────────────
  if (filter.filters) {
    for (const [key, value] of Object.entries(filter.filters)) {
      if (!allowedFields.includes(key)) continue;
      if (value === null || value === undefined) continue;
      where[key] = Array.isArray(value) ? { in: value } : value;
    }
  }

  // ── LIKE / contains — single table only ───────────────────────
  // Format object: { "title": "seo" }
  // Format array:  [{ field: "title", value: "seo" }, { field: "status", value: "active" }]
  // Catatan: untuk cross-table search pakai filter.q, ditangani di service
  if (filter.searchFilters) {
    if (Array.isArray(filter.searchFilters)) {
      const conditions = (filter.searchFilters as SearchFilterItem[])
        .filter((item) => allowedFields.includes(item.field) && item.value)
        .map((item) => ({ [item.field]: { contains: String(item.value) } }));

      if (conditions.length === 1) {
        Object.assign(where, conditions[0]);
      } else if (conditions.length > 1) {
        where.OR = conditions;
      }
    } else {
      for (const [key, value] of Object.entries(filter.searchFilters)) {
        if (!allowedFields.includes(key)) continue;
        if (!value) continue;
        where[key] = { contains: String(value) };
      }
    }
  }

  // ── ranged (between) ──────────────────────────────────────────
  if (filter.rangedFilters) {
    for (const range of filter.rangedFilters) {
      if (!allowedFields.includes(range.key)) continue;
      where[range.key] = {
        ...(range.from != null ? { gte: range.from } : {}),
        ...(range.to != null ? { lte: range.to } : {}),
      };
    }
  }

  // ── order ─────────────────────────────────────────────────────
  let orderBy: Record<string, string> = defaultOrder ?? { createdAt: "desc" };
  if (filter.orderKey && allowedFields.includes(filter.orderKey)) {
    const rule = filter.orderRule?.toLowerCase() === "asc" ? "asc" : "desc";
    orderBy = { [filter.orderKey]: rule };
  }

  // ── pagination ────────────────────────────────────────────────
  const limit = filter.rows ? Math.min(Math.max(filter.rows, 1), 100) : 10;
  const page = filter.page ? Math.max(filter.page, 1) : 1;
  const skip = (page - 1) * limit;

  return { where, orderBy, skip, take: limit, page, limit };
}

export function wrapPaginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
