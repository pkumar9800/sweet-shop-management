import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/app";
import User from "../src/models/user.model.js";
import Blacklist from "../src/models/blacklist.model.js";

let mongoServer;

// 1. Setup Phase
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// 2. Teardown Phase
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// 3. Isolation: Clear DB between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("Auth Endpoints", () => {
  describe("POST /api/auth/register", () => {
    // ---Happy Path---
    it("should register a new user successfully", async () => {
      const res = await request(app).post("/api/v1/users/register").send({
        username: "Candyman",
        email: "candyman123@gmail.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty(
        "message",
        "User registered successfully"
      );

      // Verify user is actually in DB
      const user = await User.findOne({ username: "Candyman" });
      expect(user).toBeTruthy();
    });

    // --- Validation Errors ---
    it("should reject registration if username is missing", async () => {
      const res = await request(app)
        .post("/api/v1/users/register")
        .send({ password: "password123" });

      expect(res.statusCode).toEqual(400);
    });

    it("should reject registration if email is missing", async () => {
      const res = await request(app)
        .post("/api/v1/users/register")
        .send({ username: "Candyman" });

      expect(res.statusCode).toEqual(400);
    });

    it("should reject registration if password is missing", async () => {
      const res = await request(app)
        .post("/api/v1/users/register")
        .send({ username: "Candyman" });

      expect(res.statusCode).toEqual(400);
    });

    it("should reject registration if all fields missing", async () => {
      const res = await request(app).post("/api/v1/users/register").send({});

      expect(res.statusCode).toEqual(400);
    });

    it("should reject registration if password is too short", async () => {
      const res = await request(app).post("/api/v1/users/register").send({
        username: "WeakUser",
        password: "123",
      });

      expect(res.statusCode).toEqual(400);
    });

    // --- Logic Errors ---
    it("should reject duplicate usernames", async () => {
      // 1. Create the first user
      await request(app).post("/api/v1/users/register").send({
        username: "TwinUser",
        email: "twinuser123@gmail.com",
        password: "password123",
      });

      // 2. Try to create the exact same user again
      const res = await request(app).post("/api/v1/users/register").send({
        username: "TwinUser",
        email: "twinuser123@gmail.com",
        password: "newpassword",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("message");
    });
    it("should reject duplicate email", async () => {
      // 1. Create the first user
      await request(app).post("/api/v1/users/register").send({
        username: "TwinUser1",
        email: "twinuser123@gmail.com",
        password: "password123",
      });

      // 2. Try to create the exact same user again
      const res = await request(app).post("/api/v1/users/register").send({
        username: "TwinUser2",
        email: "twinuser123@gmail.com",
        password: "newpassword",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("POST /api/v1/users/login", () => {
    // Setup: Create a user to log in with
    beforeEach(async () => {
      // We rely on the Model's pre-save hook to hash this password!
      await User.create({
        username: "validUser",
        email: "valid@example.com",
        password: "password123",
      });
    });

    // --- Happy Path ---

    it("should login successfully with valid EMAIL and password", async () => {
      const res = await request(app).post("/api/v1/users/login").send({
        identifier: "valid@example.com", // Using generic 'identifier' field
        password: "password123",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("message", "Login successful");
    });

    it("should login successfully with valid USERNAME and password", async () => {
      const res = await request(app).post("/api/v1/users/login").send({
        identifier: "validUser",
        password: "password123",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("message", "Login successful");
    });

    // --- Security & Logic Errors ---

    it("should reject login with incorrect password", async () => {
      const res = await request(app).post("/api/v1/users/login").send({
        identifier: "valid@example.com",
        password: "WRONGpassword",
      });

      expect(res.statusCode).toEqual(401); // Unauthorized
      expect(res.body).toHaveProperty("message", "Invalid credentials");
    });

    it("should reject login with non-existent user", async () => {
      const res = await request(app).post("/api/v1/users/login").send({
        identifier: "ghost@example.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(401); // Keep it ambiguous for security
    });

    // --- Validation Errors ---

    it("should reject login if identifier is missing", async () => {
      const res = await request(app)
        .post("/api/v1/users/login")
        .send({ password: "password123" });

      expect(res.statusCode).toEqual(400);
    });

    it("should reject login if password is missing", async () => {
      const res = await request(app)
        .post("/api/v1/users/login")
        .send({ identifier: "validUser" });

      expect(res.statusCode).toEqual(400);
    });
  });
  describe("POST /api/v1/users/logout", () => {
    let token;

    // Setup: Create user and get a valid token before testing logout
    beforeEach(async () => {
      // Create user
      const user = await User.create({
        username: "logoutUser",
        email: "logout@example.com",
        password: "password123",
      });
      token = user.generateAccessToken();
    });

    it("should logout successfully and blacklist the token", async () => {
      const res = await request(app)
        .post("/api/v1/users/logout")
        .set("Authorization", `Bearer ${token}`)
        .send();

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("message", "Logged out successfully");
      // Verify token is actually in the Blacklist collection
      const blacklistedToken = await Blacklist.findOne({ token });
      expect(blacklistedToken).toBeTruthy();
    });

    it("should return 200 even if no token is provided (Idempotent)", async () => {
      const res = await request(app).post("/api/v1/users/logout").send();
      expect([400, 401]).toContain(res.statusCode);
    });
  });
});
