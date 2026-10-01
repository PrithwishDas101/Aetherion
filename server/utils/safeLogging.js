const SAFE_CONTEXT_KEYS = new Set([
  "chatId",
  "messageId",
  "pollId",
  "type",
  "event",
  "userId",
  "resourceType",
  "hasFile",
]);

const SAFE_OBJECT_ID = /^[a-f\d]{24}$/i;
const SAFE_ERROR_NAMES = new Set([
  "Error",
  "TypeError",
  "RangeError",
  "SyntaxError",
  "ReferenceError",
  "URIError",
  "AggregateError",
  "MongoServerError",
  "MongoNetworkError",
  "MongoServerSelectionError",
  "MongooseError",
  "ValidationError",
  "CastError",
  "MulterError",
  "JsonWebTokenError",
  "TokenExpiredError",
  "NotBeforeError",
  "CloudinaryError",
]);
const SAFE_ERROR_CODES = new Set([
  "ERR_NETWORK",
  "ERR_BAD_REQUEST",
  "ERR_BAD_RESPONSE",
  "ECONNABORTED",
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EAI_AGAIN",
  "EPIPE",
  "ENOMEM",
  "LIMIT_FILE_SIZE",
  "LIMIT_FILE_COUNT",
  "LIMIT_PART_COUNT",
  "LIMIT_FIELD_KEY",
  "LIMIT_FIELD_VALUE",
  "LIMIT_FIELD_COUNT",
  "LIMIT_UNEXPECTED_FILE",
]);
const SAFE_TYPES = new Set([
  "text",
  "image",
  "gif",
  "video",
  "document",
  "location",
  "contact",
  "poll",
]);
const SAFE_EVENTS = new Set([
  "send-message",
  "typing",
  "stop-typing",
  "poll-updated",
  "get-presence",
]);
const SAFE_RESOURCE_TYPES = new Set(["image", "video", "raw"]);

const getSafeErrorDetails = (error) => {
  const details = {};

  if (SAFE_ERROR_NAMES.has(error?.name)) {
    details.errorName = error.name;
  }

  if (Number.isSafeInteger(error?.code)) {
    details.errorCode = error.code;
  } else if (
    typeof error?.code === "string" &&
    SAFE_ERROR_CODES.has(error.code)
  ) {
    details.errorCode = error.code;
  }

  const status = error?.statusCode ?? error?.status ?? error?.http_code;

  if (Number.isInteger(status) && status >= 100 && status <= 599) {
    details.status = status;
  }

  return details;
};

export const logSafeError = (operation, error, context = {}) => {
  const details = {};

  for (const [key, value] of Object.entries(context)) {
    if (!SAFE_CONTEXT_KEYS.has(key)) {
      continue;
    }

    if (
      ["chatId", "messageId", "pollId", "userId"].includes(key) &&
      typeof value === "string" &&
      SAFE_OBJECT_ID.test(value)
    ) {
      details[key] = value;
    } else if (key === "type" && SAFE_TYPES.has(value)) {
      details[key] = value;
    } else if (key === "event" && SAFE_EVENTS.has(value)) {
      details[key] = value;
    } else if (
      key === "resourceType" &&
      SAFE_RESOURCE_TYPES.has(value)
    ) {
      details[key] = value;
    } else if (key === "hasFile" && typeof value === "boolean") {
      details[key] = value;
    }
  }

  console.error(`${operation} failed`, {
    ...details,
    ...getSafeErrorDetails(error),
  });
};

export const logSafeDiagnostic = (operation, context = {}) => {
  const details = {};

  for (const [key, value] of Object.entries(context)) {
    if (!SAFE_CONTEXT_KEYS.has(key)) {
      continue;
    }

    if (
      ["chatId", "messageId", "pollId", "userId"].includes(key) &&
      typeof value === "string" &&
      SAFE_OBJECT_ID.test(value)
    ) {
      details[key] = value;
    } else if (key === "type" && SAFE_TYPES.has(value)) {
      details[key] = value;
    } else if (key === "event" && SAFE_EVENTS.has(value)) {
      details[key] = value;
    } else if (
      key === "resourceType" &&
      SAFE_RESOURCE_TYPES.has(value)
    ) {
      details[key] = value;
    } else if (key === "hasFile" && typeof value === "boolean") {
      details[key] = value;
    }
  }

  console.log(operation, details);
};