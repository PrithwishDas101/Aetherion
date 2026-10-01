import {
  DEFAULT_LIST_PAGE_SIZE,
  MAX_LIST_PAGE,
  MAX_LIST_PAGE_SIZE,
} from "./queryLimits.js";

const parsePositiveInteger = (value) => {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const parsed = Number(value);

  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

export const getBoundedPagination = (query = {}) => {
  const requestedPage = parsePositiveInteger(query.page);
  const requestedLimit = parsePositiveInteger(query.limit);

  return {
    page: Math.min(requestedPage || 1, MAX_LIST_PAGE),
    limit: Math.min(
      requestedLimit || DEFAULT_LIST_PAGE_SIZE,
      MAX_LIST_PAGE_SIZE,
    ),
  };
};