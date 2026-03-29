import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { prismaMock } from './setup.js';
import jwt from 'jsonwebtoken';

const TEST_SECRET = 'test_secret';
process.env.JWT_SECRET = TEST_SECRET;

describe('Property API', () => {
  let validToken;
  let ownerToken;

  beforeEach(() => {
    validToken = jwt.sign({ id: 'user123', role: 'TENANT' }, TEST_SECRET);
    ownerToken = jwt.sign({ id: 'owner123', role: 'OWNER' }, TEST_SECRET);
  });

  describe('GET /api/properties', () => {
    it('should fetch all properties', async () => {
      const mockProperties = [
        { id: '1', title: 'Nice Apartment', location: 'NYC', price: 1500 }
      ];
      
      prismaMock.property.count.mockResolvedValue(1);
      prismaMock.property.findMany.mockResolvedValue(mockProperties);

      const response = await request(app).get('/api/properties');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.properties ? response.body.data.properties : response.body.data).toEqual(mockProperties);
    });
  });

  describe('POST /api/properties', () => {
    it('should return 400 validation error if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'Missing other fields'
        });

      expect(response.status).toBe(400); // Because of validation middleware
    });

    it('should create property successfully', async () => {
      const mockProperty = {
        id: 'prop123',
        title: 'New Listing',
        location: 'LA',
        price: 2000,
        ownerId: 'owner123'
      };

      prismaMock.property.create.mockResolvedValue(mockProperty);

      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          title: 'New Listing',
          location: 'LA',
          price: 2000,
          description: 'A great place',
          status: 'AVAILABLE' // required by some schemas maybe
        });

      // Assuming created() returns 201
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProperty);
    });
  });
});
