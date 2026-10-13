import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";

import User from "../models/User.js";
import { uploadImage, deleteImage } from "../services/cloudinaryService.js";
import { logSafeError } from "../utils/safeLogging.js";

const respondToSignup = (res, authPayload = {}) =>
  res.status(200).json({
    success: true,
    message:
      "Continue to sign in. If you already have an account, use your existing password.",
    ...authPayload,
  });

const getAuthVersion = (user) => {
  const authVersion = user.authVersion === undefined ? 0 : user.authVersion;

  if (!Number.isSafeInteger(authVersion) || authVersion < 0) {
    throw new Error("Invalid user auth version");
  }

  return authVersion;
};

// SIGNUP
export const signup = async (req, res) => {
  let uploadedProfilePicPublicId = "";

  try {
    // 1. Get data from request body
    const { firstName, lastName, email, password } = req.body;

    // 2. Check required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields",
      });
    }

    // 3. Normalize input
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 4. Validate names
    if (normalizedFirstName.length < 2 || normalizedFirstName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "First name must be between 2 and 50 characters",
      });
    }

    if (normalizedLastName.length < 2 || normalizedLastName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Last name must be between 2 and 50 characters",
      });
    }

    // 5. Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // 6. Validate password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // 7. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return respondToSignup(res);
    }

    // 8. Upload optional profile picture
    let profilePic = "";
    let profilePicPublicId = "";

    if (req.file) {
      const uploadResult = await uploadImage(
        req.file.buffer,
        "aetherion/profile-pictures",
      );

      profilePic = uploadResult.secure_url;
      profilePicPublicId = uploadResult.public_id;

      uploadedProfilePicPublicId = uploadResult.public_id;
    }

    // 9. Create user
    const newUser = await User.create({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      email: normalizedEmail,
      password: hashedPassword,
      profilePic,
      profilePicPublicId,
    });

    const token = jwt.sign(
      {
        userId: newUser._id,
        authVersion: getAuthVersion(newUser),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return respondToSignup(res, {
      token,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        avatarDecoration: newUser.avatarDecoration,
      },
    });
  } catch (error) {
    logSafeError("Signup", error);

    // Clean up Cloudinary image if
    // MongoDB/user creation failed
    if (uploadedProfilePicPublicId) {
      try {
        await deleteImage(uploadedProfilePicPublicId);

        console.log("Cloudinary signup cleanup completed.");
      } catch (cleanupError) {
        logSafeError("Signup image cleanup", cleanupError);
      }
    }

    // Duplicate email
    if (error.code === 11000) {
      return respondToSignup(res);
    }

    // Mongoose validation error
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((error) => error.message)
          .join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    // 1. Get credentials from request body
    const { email, password } = req.body;

    // 2. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 3. Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // 4. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // 5. Find user
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password +authVersion");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 6. Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 7. Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        authVersion: getAuthVersion(user),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // 8. Return token and safe user data
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePic: user.profilePic,
        avatarDecoration: user.avatarDecoration,
      },
    });
  } catch (error) {
    logSafeError("Login", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $inc: { authVersion: 1 } },
      { new: true, fields: { _id: 1 } },
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid or expired token",
      });
    }

    const io = req.app.get("io");

    if (typeof io?.in === "function") {
      try {
        await io.in(String(req.user.userId)).disconnectSockets(true);
      } catch (error) {
        logSafeError("Logout socket disconnect", error);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    logSafeError("Logout", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Social sign-in verifies the Supabase access token, then issues an Aetherion JWT.
export const oauthLogin = async (req, res) => {
  try {
    const { accessToken } = req.body || {};
    if (typeof accessToken !== "string" || !accessToken.trim()) {
      return res.status(400).json({ success: false, message: "A valid social sign-in session is required." });
    }
    const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(503).json({ success: false, message: "Social sign-in is not configured on the server yet." });
    }
    const verified = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${accessToken}` },
    });
    if (!verified.ok) {
      return res.status(401).json({ success: false, message: "Your social sign-in session is invalid or expired. Please try again." });
    }
    const authUser = await verified.json();
    const providers = [
      authUser?.app_metadata?.provider,
      ...(Array.isArray(authUser?.identities) ? authUser.identities.map((identity) => identity?.provider) : []),
    ].filter(Boolean);
    if (!providers.some((provider) => ["google", "github"].includes(provider))) {
      return res.status(403).json({ success: false, message: "Please sign in with Google or GitHub." });
    }
    const email = typeof authUser.email === "string" ? authUser.email.trim().toLowerCase() : "";
    if (!email || !authUser.email_confirmed_at) {
      return res.status(403).json({ success: false, message: "This provider account must supply a verified email address." });
    }
    const metadata = authUser.user_metadata || {};
    const displayName = String(metadata.full_name || metadata.name || metadata.user_name || metadata.preferred_username || "").trim();
    const parts = displayName.split(/\s+/).filter(Boolean);
    const first = (parts.shift() || String(metadata.given_name || "Aetherion")).slice(0, 50);
    const last = (parts.join(" ") || String(metadata.family_name || "Member")).slice(0, 50);
    const avatar = typeof metadata.avatar_url === "string" ? metadata.avatar_url : typeof metadata.picture === "string" ? metadata.picture : "";
    let user = await User.findOne({ email }).select("+authVersion");
    if (!user) {
      const unusablePassword = await bcrypt.hash(randomBytes(32).toString("hex"), 10);
      try {
        user = await User.create({
          firstName: first.length >= 2 ? first : "Aetherion",
          lastName: last.length >= 2 ? last : "Member",
          email,
          password: unusablePassword,
          profilePic: avatar,
        });
      } catch (error) {
        if (error.code !== 11000) throw error;
        user = await User.findOne({ email }).select("+authVersion");
        if (!user) throw error;
      }
    }
    if (!user) return res.status(500).json({ success: false, message: "Unable to create your account. Please try again." });
    const token = jwt.sign({ userId: user._id, authVersion: getAuthVersion(user) }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.status(200).json({
      success: true,
      message: "Social login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePic: user.profilePic,
        avatarDecoration: user.avatarDecoration,
      },
    });
  } catch (error) {
    logSafeError("Social login", error);
    return res.status(500).json({ success: false, message: "Social sign-in failed. Please try again." });
  }
};
