import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Sweet from '../src/models/sweet.model.js';
import User from '../src/models/user.model.js';
// Import app dynamically to ensure mocks/env are loaded if needed
const app = (await import('../src/app.js')).default;

let mongoServer;
let adminToken;
let userToken;
let sweetId;

// --- SETUP ---
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

describe('Restock Endpoint (Admin Protected)', () => {

    beforeEach(async () => {
        // 1. Create Admin
        const admin = await User.create({
            username: 'adminUser',
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin'
        });
        adminToken = admin.generateAccessToken();

        // 2. Create Normal User
        const user = await User.create({
            username: 'normalUser',
            email: 'user@test.com',
            password: 'password123',
            role: 'user'
        });
        userToken = user.generateAccessToken();

        // 3. Create a Sweet with Stock = 10
        const sweet = await Sweet.create({
            name: 'Kaju Katli',
            category: 'Dry',
            price: 500,
            quantity: 10
        });
        sweetId = sweet._id;
    });

    const getUrl = (id) => `/api/v1/sweets/${id}/restock`;

    // --- HAPPY PATH ---
    it('should allow Admin to increase stock', async () => {
        const addQty = 50;

        const res = await request(app)
            .post(getUrl(sweetId))
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ quantity: addQty });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toMatch(/Restock successful/i);
        expect(res.body.newQuantity).toBe(60); // 10 + 50 = 60

        // Verify DB
        const updatedSweet = await Sweet.findById(sweetId);
        expect(updatedSweet.quantity).toBe(60);
    });

    // --- SECURITY TESTS ---
    it('should return 403 Forbidden if user is NOT admin', async () => {
        const res = await request(app)
            .post(getUrl(sweetId))
            .set('Authorization', `Bearer ${userToken}`)
            .send({ quantity: 10 });

        expect(res.statusCode).toEqual(403);
    });

    it('should return 401 Unauthorized if no token is provided', async () => {
        const res = await request(app)
            .post(getUrl(sweetId))
            .send({ quantity: 10 });

        expect(res.statusCode).toEqual(401);
    });

    // --- VALIDATION TESTS ---
    it('should return 400 if quantity is negative or zero', async () => {
        const res = await request(app)
            .post(getUrl(sweetId))
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ quantity: -5 });

        expect(res.statusCode).toEqual(400);
    });

    it('should return 404 if sweet does not exist', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .post(getUrl(fakeId))
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ quantity: 10 });

        expect(res.statusCode).toEqual(404);
    });
});