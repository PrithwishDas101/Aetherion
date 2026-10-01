const SAFE_OBJECT_ID = /^[a-f\d]{24}$/i;
const SAFE_ERROR_NAMES = new Set([
  "Error",
  "TypeError",
  "RangeError",
  "SyntaxError",
  "ReferenceError",
  "URIError",
  "AggregateError",
  "AxiosError",
  "DOMException",
  "AbortError",
  "NetworkError",
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

export const logSafeClientError = (operation, error) => {
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

  const status = error?.response?.status ?? error?.status;

  if (Number.isInteger(status) && status >= 100 && status <= 599) {
    details.status = status;
  }

  console.error(`${operation} failed`, details);
};

export const logSafeClientDiagnostic = (operation, context = {}) => {
  const details = {};

  if (typeof context.chatId === "string" && SAFE_OBJECT_ID.test(context.chatId)) {
    details.chatId = context.chatId;
  }

  if (SAFE_TYPES.has(context.type)) {
    details.type = context.type;
  }

  for (const key of ["hasBlob", "isSending", "success"]) {
    if (typeof context[key] === "boolean") {
      details[key] = context[key];
    }
  }

  if (Number.isSafeInteger(context.index) && context.index >= 0) {
    details.index = context.index;
  }

  console.log(operation, details);
};