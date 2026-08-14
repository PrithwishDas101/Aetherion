import rateLimit from "express-rate-limit";

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