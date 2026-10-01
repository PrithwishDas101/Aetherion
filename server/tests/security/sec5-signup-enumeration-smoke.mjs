import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

import User from "../../models/User.js";
import { signup } from "../../controllers/authController.js";

const originalFindOne = User.findOne;
const originalCreate = User.create;
const originalConsoleError = console.error;
const originalJwtSecret = process.env.JWT_SECRET;
const jwtSecret = "sec5-signup-smoke-secret";
const createdUserId = "000000000000000000000001";

const validFields = {
  firstName: "Taylor",
  lastName: "Example",
  password: "correct horse",
};

const runSignup = async ({
  email,
  omitEmail = false,
  existingEmail = false,
  createError = null,
}) => {
  let findOneCalls = 0;
  let createCalls = 0;
  let createdUser;

  User.findOne = async (query) => {
    findOneCalls += 1;
    assert.equal(query.email, String(email || "").trim().toLowerCase());
    return existingEmail ? { _id: "000000000000000000000002" } : null;
  };
  User.create = async (payload) => {
    createCalls += 1;
    createdUser = payload;

    if (createError) {
      throw createError;
    }

    return { ...payload, _id: createdUserId, avatarDecoration: "none" };
  };

  const req = {
    body: {
      ...validFields,
      ...(omitEmail ? {} : { email }),
    },
  };
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };

  await signup(req, res);

  return { ...res, findOneCalls, createCalls, createdUser };
};

try {
  console.error = () => {};
  process.env.JWT_SECRET = jwtSecret;

  const emailPath = User.schema.path("email");
  assert.equal(emailPath.options.unique, true);
  assert.equal(emailPath.options.lowercase, true);
  assert.equal(emailPath.options.trim, true);

  const newAddress = await runSignup({ email: "new@example.com" });
  assert.equal(newAddress.statusCode, 200);
  assert.equal(newAddress.body.success, true);
  assert.equal(typeof newAddress.body.token, "string");
  assert.equal(newAddress.body.user.email, "new@example.com");
  assert.equal(String(jwt.verify(newAddress.body.token, jwtSecret).userId), createdUserId);
  assert.equal(newAddress.findOneCalls, 1);
  assert.equal(newAddress.createCalls, 1);

  const duplicateCase = await runSignup({
    email: "EXISTING@example.com",
    existingEmail: true,
  });
  const duplicateWhitespace = await runSignup({
    email: " Existing@example.com ",
    existingEmail: true,
  });

  for (const duplicate of [duplicateCase, duplicateWhitespace]) {
    assert.equal(duplicate.statusCode, 200);
    assert.equal(duplicate.body.success, newAddress.body.success);
    assert.equal(duplicate.body.message, newAddress.body.message);
    assert.equal(duplicate.body.token, undefined);
    assert.equal(duplicate.body.user, undefined);
    assert.doesNotMatch(duplicate.body.message, /email is already registered/i);
    assert.equal(duplicate.findOneCalls, 1);
    assert.equal(duplicate.createCalls, 0);
  }
  console.log("new signup: JWT verifies and safe user payload is returned");
  console.log("existing addresses: neutral response has no token/user; casing/spacing normalized");

  const duplicateRace = await runSignup({
    email: "race@example.com",
    createError: { code: 11000 },
  });
  assert.equal(duplicateRace.statusCode, 200);
  assert.equal(duplicateRace.body.success, newAddress.body.success);
  assert.equal(duplicateRace.body.message, newAddress.body.message);
  assert.equal(duplicateRace.body.token, undefined);
  assert.equal(duplicateRace.body.user, undefined);
  assert.doesNotMatch(duplicateRace.body.message, /email is already registered/i);
  assert.equal(duplicateRace.findOneCalls, 1);
  assert.equal(duplicateRace.createCalls, 1);
  console.log("duplicate-key race: unique-index error gets the same neutral response");

  const malformed = await runSignup({ email: "not-an-email" });
  assert.equal(malformed.statusCode, 400);
  assert.equal(malformed.findOneCalls, 0);
  assert.equal(malformed.createCalls, 0);
  console.log("malformed email: rejected before account creation");

  const missing = await runSignup({ omitEmail: true });
  assert.equal(missing.statusCode, 400);
  assert.equal(missing.findOneCalls, 0);
  assert.equal(missing.createCalls, 0);
  console.log("missing email: rejected before account creation");
} finally {
  User.findOne = originalFindOne;
  User.create = originalCreate;
  console.error = originalConsoleError;

  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalJwtSecret;
  }
}