import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';

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

describe('Auth Endpoints', () => {
    describe('POST /api/auth/register', () => {
        
        // ---Happy Path---
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/v1/users/register')
                .send({
                    username: 'Candyman',
                    email: 'candyman123@gmail.com',
                    password: 'password123',
                });
            
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'User registered successfully');
            
            // Verify user is actually in DB
            const User = import('../src/models/user.model.js');
            const user = await User.findOne({ username: 'Candyman' });
            expect(user).toBeTruthy();
        });

        // --- Validation Errors ---
        it('should reject registration if username is missing', async () => {
            const res = await request(app)
                .post('/api/v1/users/register')
                .send({ password: 'password123' }); 
            
            expect(res.statusCode).toEqual(400);
        });

        it('should reject registration if email is missing', async () => {
            const res = await request(app)
                .post('/api/v1/users/register')
                .send({ username: 'Candyman' });
            
            expect(res.statusCode).toEqual(400);
        });

        it('should reject registration if password is missing', async () => {
            const res = await request(app)
                .post('/api/v1/users/register')
                .send({ username: 'Candyman' });
            
            expect(res.statusCode).toEqual(400);
        });

        it('should reject registration if all fields missing', async () => {
            const res = await request(app)
                .post('/api/v1/users/register')
                .send({}); 
            
            expect(res.statusCode).toEqual(400);
        });

        it('should reject registration if password is too short', async () => {
            const res = await request(app)
                .post('/api/v1/users/register')
                .send({
                    username: 'WeakUser',
                    password: '123' 
                });
            
            expect(res.statusCode).toEqual(400);
        });

        

        // --- Logic Errors ---
        it('should reject duplicate usernames', async () => {
            // 1. Create the first user
            await request(app).post('/api/v1/users/register').send({
                username: 'TwinUser',
                email: 'twinuser123@gmail.com',
                password: 'password123'
            });

            // 2. Try to create the exact same user again
            const res = await request(app)
                .post('/api/v1/users/register')
                .send({
                    username: 'TwinUser',
                    email: 'twinuser123@gmail.com',
                    password: 'newpassword'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message');
        });
        it('should reject duplicate email', async () => {
            // 1. Create the first user
            await request(app).post('/api/v1/users/register').send({
                username: 'TwinUser1',
                email: 'twinuser123@gmail.com',
                password: 'password123'
            });

            // 2. Try to create the exact same user again
            const res = await request(app)
                .post('/api/v1/users/register')
                .send({
                    username: 'TwinUser2',
                    email: 'twinuser123@gmail.com',
                    password: 'newpassword'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message');
        });
    });
});