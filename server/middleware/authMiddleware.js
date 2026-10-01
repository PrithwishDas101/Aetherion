import jwt from "jsonwebtoken";

import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid or expired token",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error("Authentication error:", error.message);

      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid or expired token",
      });
    }

    if (
      !decoded?.userId ||
      !Number.isSafeInteger(decoded.authVersion) ||
      decoded.authVersion < 0
    ) {
      console.error(
        "Authentication error: Missing or invalid authVersion in JWT payload.",
      );

      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid or expired token",
      });
    }

    const currentUser = await User.findById(decoded.userId)
      .select("+authVersion")
      .lean();

    const currentAuthVersion =
      currentUser?.authVersion === undefined ? 0 : currentUser?.authVersion;

    if (
      !currentUser ||
      !Number.isSafeInteger(currentAuthVersion) ||
      currentAuthVersion < 0 ||
      currentAuthVersion !== decoded.authVersion
    ) {
      console.error("Authentication error: JWT authVersion mismatch.");

      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid or expired token",
      });
    }

    req.user = {
      ...decoded,
      userId: String(decoded.userId),
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid or expired token",
    });
  }
};
