import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Sweet from '../src/models/sweet.model.js'; // Import model directly to seed data
import app from '../src/app.js';

let mongoServer;

// 1. Setup
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

// 2. Teardown
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// 3. Isolation
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

describe('Sweets Public Endpoints (GET)', () => {
    
    // Seed the database with some sweets before every test
    beforeEach(async () => {
        await Sweet.create([
            { name: 'Rasgulla', category: 'Syrup', price: 50, quantity: 100 },
            { name: 'Gulab Jamun', category: 'Syrup', price: 60, quantity: 50 },
            { name: 'Kaju Katli', category: 'Dry', price: 500, quantity: 20 },
            { name: 'Mysore Pak', category: 'Ghee', price: 200, quantity: 30 }
        ]);
    });

    const ENDPOINT = '/api/v1/sweets';

    it('should retrieve all sweets (default pagination)', async () => {
        const res = await request(app).get(ENDPOINT);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('sweets');
        expect(res.body.sweets.length).toBe(4); // We seeded 4 sweets
        expect(res.body).toHaveProperty('totalPages');
        expect(res.body).toHaveProperty('currentPage', 1);
    });

    it('should search sweets by name (case insensitive)', async () => {
        const res = await request(app).get(`${ENDPOINT}?search=ras`); // Partial match
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.sweets.length).toBe(1);
        expect(res.body.sweets[0].name).toEqual('Rasgulla');
    });

    it('should filter sweets by category', async () => {
        const res = await request(app).get(`${ENDPOINT}?category=Syrup`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.sweets.length).toBe(2); // Rasgulla + Gulab Jamun
    });

    it('should filter sweets by price range', async () => {
        // Find sweets between 100 and 600
        const res = await request(app).get(`${ENDPOINT}?minPrice=100&maxPrice=600`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.sweets.length).toBe(2); // Kaju Katli (500) + Mysore Pak (200)
    });

    it('should paginate results correctly', async () => {
        // Page 1, Limit 2
        const res = await request(app).get(`${ENDPOINT}?page=1&limit=2`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.sweets.length).toBe(2);
        expect(res.body.totalPages).toBe(2); // 4 items total / 2 per page = 2 pages
    });
});