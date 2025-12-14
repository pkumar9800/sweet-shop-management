import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { jest } from '@jest/globals';
import Sweet from '../src/models/sweet.model.js';
import User from '../src/models/user.model.js';

// --- 1. MOCK RAZORPAY ---
const mockCreateOrder = jest.fn(() => Promise.resolve({
    id: 'order_mock_123',
    currency: 'INR',
    amount: 5000,
    status: 'created'
}));

jest.unstable_mockModule('../src/utils/payment.js', () => ({
    createPaymentOrder: mockCreateOrder
}));

// Import app AFTER mocking
const app = (await import('../src/app.js')).default;

let mongoServer;
let userToken;
let sweetId;

// --- 2. SETUP & TEARDOWN ---
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    jest.clearAllMocks();
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

describe('Purchase Endpoint (Protected)', () => {

    beforeEach(async () => {
        // 1. Create User
        const user = await User.create({
            fullname: 'Buyer Seller',
            username: 'buyer',
            email: 'buyer@test.com',
            password: 'password123'
        });
        userToken = user.generateAccessToken();

        // 2. Create a Sweet with Stock = 10
        const sweet = await Sweet.create({
            name: 'Rasgulla',
            category: 'Syrup',
            price: 50,
            quantity: 10
        });
        sweetId = sweet._id;
    });

    const getUrl = (id) => `/api/v1/sweets/${id}/purchase`;

    // --- HAPPY PATH ---
    it('should successfully purchase a sweet and decrease stock', async () => {
        const buyQty = 2;
        
        const res = await request(app)
            .post(getUrl(sweetId))
            .set('Authorization', `Bearer ${userToken}`)
            .send({ quantity: buyQty });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Purchase successful');
        expect(res.body).toHaveProperty('orderId', 'order_mock_123'); // From Mock

        // Verify Razorpay was called
        expect(mockCreateOrder).toHaveBeenCalledTimes(1);

        // Verify Stock Decreased in DB (10 - 2 = 8)
        const updatedSweet = await Sweet.findById(sweetId);
        expect(updatedSweet.quantity).toBe(8);
    });

    // --- EDGE CASES ---

    it('should return 400 if requested quantity exceeds stock', async () => {
        const res = await request(app)
            .post(getUrl(sweetId))
            .set('Authorization', `Bearer ${userToken}`)
            .send({ quantity: 100 });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toMatch(/Insufficient stock/i);
    });

    it('should return 400 if sweet is out of stock', async () => {
        // Set stock to 0
        await Sweet.findByIdAndUpdate(sweetId, { quantity: 0 });

        const res = await request(app)
            .post(getUrl(sweetId))
            .set('Authorization', `Bearer ${userToken}`)
            .send({ quantity: 1 });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toMatch(/Out of stock/i);
    });

    it('should return 404 if sweet does not exist', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .post(getUrl(fakeId))
            .set('Authorization', `Bearer ${userToken}`)
            .send({ quantity: 1 });

        expect(res.statusCode).toEqual(404);
    });

    it('should return 400 if quantity is invalid (negative or zero)', async () => {
        const res = await request(app)
            .post(getUrl(sweetId))
            .set('Authorization', `Bearer ${userToken}`)
            .send({ quantity: -1 });

        expect(res.statusCode).toEqual(400);
    });
});