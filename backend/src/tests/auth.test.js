import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { prismaMock } from './setup.js';
import bcrypt from 'bcryptjs';

process.env.JWT_SECRET = 'test_secret';

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Mock prisma.user.findUnique returning null (no existing user)
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Mock prisma.user.create returning the newly created user
      const mockUser = {
        id: '123',
        name: 'Test Tenant',
        email: 'test@tenant.com',
        role: 'TENANT',
        password: 'hashed-password',
      };
      prismaMock.user.create.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Tenant',
          email: 'test@tenant.com',
          password: 'password123',
          role: 'TENANT'
        });

      // Status could be 201 created. AppError might return standard success response structure
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.role).toBe('TENANT');
    });

    it('should fail to register if user already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: '123' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Existing',
          email: 'test@tenant.com',
          password: 'pass',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockPassword = 'password123';
      const hashedPassword = await bcrypt.hash(mockPassword, 10);
      
      prismaMock.user.findUnique.mockResolvedValue({
        id: '123',
        email: 'test@tenant.com',
        password: hashedPassword,
        role: 'TENANT'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@tenant.com',
          password: mockPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should fail login if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'notfound@tenant.com',
          password: 'pass',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });
});
