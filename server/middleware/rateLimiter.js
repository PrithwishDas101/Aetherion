import rateLimit from "express-rate-limit";

const rateLimitMessage = {
  success: false,
  message: "Too many requests. Please try again later.",
};

const createAuthenticatedUserLimiter = ({ windowMs, max }) =>
  rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => `user:${req.user.userId}`,
    message: rateLimitMessage,
    standardHeaders: true,
    legacyHeaders: false,
  });

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 100,

  message: {
    success: false,
    message: "Too many requests. Please try again after 15 minutes.",
  },

  standardHeaders: true,

  legacyHeaders: false,
});

export const profilePictureLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 5,

  message: {
    success: false,
    message:
      "Too many profile picture uploads. Please try again after 15 minutes.",
  },

  standardHeaders: true,

  legacyHeaders: false,
});

export const removeProfilePictureLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,

  message: {
    success: false,
    message:
      "Too many profile picture removal attempts. Please try again after 15 minutes.",
  },

  standardHeaders: true,
  legacyHeaders: false,
});

export const messageIpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: rateLimitMessage,
  standardHeaders: true,
  legacyHeaders: false,
});

export const messageUserLimiter = createAuthenticatedUserLimiter({
  windowMs: 60 * 1000,
  max: 60,
});

export const contactRequestUserLimiter = createAuthenticatedUserLimiter({
  windowMs: 5 * 60 * 1000,
  max: 10,
});

export const chatCreationUserLimiter = createAuthenticatedUserLimiter({
  windowMs: 5 * 60 * 1000,
  max: 20,
});

export const pollCreationUserLimiter = createAuthenticatedUserLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
});

export const pollVoteUserLimiter = createAuthenticatedUserLimiter({
  windowMs: 60 * 1000,
  max: 20,
});
