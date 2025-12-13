import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { jest } from '@jest/globals';
import User from '../src/models/user.model.js';

// --- 1. MOCK SETUP ---
const mockUploadImage = jest.fn(() => Promise.resolve('https://res.cloudinary.com/demo/image/upload/v1/mock-sweet.jpg'));

jest.unstable_mockModule('../src/utils/cloudinary.js', () => ({
  uploadImage: mockUploadImage,
}));

// Import app AFTER mocking
const app = (await import('../src/app.js')).default; 

// --- 2. TEST SETUP ---
let mongoServer;
let adminToken;
let userToken;

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

describe('Sweets Endpoints (Protected)', () => {

    beforeEach(async () => {
        // Create Admin
        const admin = await User.create({
            username: 'adminUser', 
            email: 'admin@test.com', 
            password: 'password123',
            role: 'admin'
        });
        adminToken = admin.generateAccessToken();

        // Create Normal User
        const user = await User.create({
            username: 'normalUser', 
            email: 'user@test.com', 
            password: 'password123',
            role: 'user'
        });
        userToken = user.generateAccessToken();
    });

    const ENDPOINT = '/api/v1/sweets';

    describe(`POST ${ENDPOINT}`, () => {

        // --- Happy Path ---
        it('should create a new sweet with image URL when Admin uploads file', async () => {
            const buffer = Buffer.from('fake-image-content');

            const res = await request(app)
                .post(ENDPOINT)
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('image', buffer, 'rasgulla.jpg')
                .field('name', 'Rasgulla')
                .field('category', 'Syrup')
                .field('price', 50)
                .field('quantity', 100);

            expect(res.statusCode).toEqual(201);
            expect(res.body.imageUrl).toEqual('https://res.cloudinary.com/demo/image/upload/v1/mock-sweet.jpg');
            expect(mockUploadImage).toHaveBeenCalledTimes(1); // Verify mock was called
        });

        // --- Authentication & Authorization Edge Cases ---
        
        it('should return 401 Unauthorized if no token is provided', async () => {
            const res = await request(app)
                .post(ENDPOINT)
                // No Authorization header
                .field('name', 'Stolen Sweet')
                .field('price', 10);

            expect(res.statusCode).toEqual(401);
        });

        it('should return 403 Forbidden if user is NOT admin', async () => {
            const res = await request(app)
                .post(ENDPOINT)
                .set('Authorization', `Bearer ${userToken}`)
                .field('name', 'Hacked Sweet')
                .field('price', 10)
                .field('quantity', 10);

            expect(res.statusCode).toEqual(403);
        });

        // --- Input Validation Edge Cases ---

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post(ENDPOINT)
                .set('Authorization', `Bearer ${adminToken}`)
                .field('category', 'Syrup'); // Name, Price, Quantity missing

            expect(res.statusCode).toEqual(400);
        });

        it('should return 400/500 if price is invalid (string text)', async () => {
            const res = await request(app)
                .post(ENDPOINT)
                .set('Authorization', `Bearer ${adminToken}`)
                .field('name', 'Bad Price Sweet')
                .field('category', 'Test')
                .field('price', 'not-a-number') // Invalid
                .field('quantity', 10);

            expect(res.statusCode).toBeGreaterThanOrEqual(400); 
        });

        it('should return 400/500 if quantity is negative', async () => {
            const res = await request(app)
                .post(ENDPOINT)
                .set('Authorization', `Bearer ${adminToken}`)
                .field('name', 'Negative Sweet')
                .field('category', 'Test')
                .field('price', 50)
                .field('quantity', -5); // Invalid (min: 0)

            expect(res.statusCode).toBeGreaterThanOrEqual(400); 
        });

        // --- File Upload Edge Cases ---

        it('should return 400/500 if uploaded file is NOT an image (e.g., .txt)', async () => {
            const textBuffer = Buffer.from('this is a text file');
            
            const res = await request(app)
                .post(ENDPOINT)
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('image', textBuffer, 'document.txt') // Wrong extension/MIME
                .field('name', 'Text File Sweet')
                .field('category', 'Test')
                .field('price', 50)
                .field('quantity', 100);

            // Multer fileFilter should reject this
            expect(res.statusCode).toBeGreaterThanOrEqual(400);
        });

        // --- External Service Failure (Cloudinary) ---

        it('should return 500 if Cloudinary upload fails', async () => {
            // Force the mock to reject specifically for this test
            mockUploadImage.mockRejectedValueOnce(new Error('Cloudinary Service Down'));

            const buffer = Buffer.from('fake-image-content');

            const res = await request(app)
                .post(ENDPOINT)
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('image', buffer, 'fail.jpg')
                .field('name', 'Fail Sweet')
                .field('category', 'Test')
                .field('price', 50)
                .field('quantity', 100);

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty('message');
        });

    });
});