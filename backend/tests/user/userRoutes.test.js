import { describe, it, expect, vi, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import pool from './../../src/config/db'; // Adjust the path as necessary
import userRouter from '../../src/routes/userRoutes'; // Ensure the correct path to userRoutes
import * as userController from '../../src/controllers/userController'; // Using import syntax
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Mock the controller functions using ESModules import
// vi.mock('../../src/controllers/userController', () => ({
//   getAllUsers: vi.fn((req, res) => res.status(200).json({ message: 'All users fetched' })),
//   getUserById: vi.fn((req, res) => res.status(200).json({ message: 'User fetched by ID' })),
//   createUser: vi.fn((req, res) => res.status(201).json({ message: 'User created' })),
//   updateUser: vi.fn((req, res) => res.status(200).json({ message: 'User updated' })),
//   deleteUser: vi.fn((req, res) => res.status(200).json({ message: 'User deleted' })),
// }));

const app = express();
app.use(cors());
app.use(express.json());
app.use('/users', userRouter);
let userId;
let testEmail = `testuser_${Date.now()}@example.com`;
let createdUserId;
let newUserId;
describe('User Routes', () => {
    beforeAll(async () => {
        const { rows } = await pool.query(
            `INSERT INTO T_USERS (USER_EMAIL, USER_FULL_NAME, USER_PASSWORD, USER_ROLE_ID, CREATED_ON, UPDATED_ON, IS_ACTIVE) 
             VALUES ($1, $2, $3, $4, NOW(), NOW(), $5) RETURNING USER_ID`,
            [testEmail, 'Test User', 'password123', 1, true]
        );
        userId = rows[0].user_id;

        console.log(userId);
      });
    
    afterAll(async()=>{
        // let email = 'test2@example.com';
        await pool.query('DELETE FROM T_USERS WHERE USER_EMAIL = $1', [testEmail]);
        // let newUserEmail = 'newuser@example.com'
        await pool.query('DELETE FROM T_USERS WHERE USER_EMAIL = $1', [createdUserId]);
        if(newUserId) {
            await pool.query('DELETE FROM T_USERS WHERE USER_ID = $1', [newUserId]);
        }
    })

    it('GET /users - should call getAllUsers', async () => {
        const response = await request(app).get('/users');
        
        expect(response.status).toBe(200);
    });

  it('GET /users/:id - should call getUserById', async () => {
    const token = jwt.sign({ id: userId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    const response = await request(app)
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`); // ✅ Attach token in Authorization header

    expect(response.status).toBe(200);
  });

  it('POST /users - should call createUser', async () => {
    const newUser = { email: `newuser_${Date.now()}@example.com`,
        full_name: 'New User',
        password: 'newpassword123',
        role_id: 1,
        is_active: true };
    const response = await request(app).post('/users').send(newUser);
    newUserId = response.body.user.user_id; // Store the created user ID for cleanup
    expect(response.status).toBe(201);
  });

  it('PUT /users/:id - should call updateUser', async () => {
    const updatedUser = { email: 'updated@example.com',
        full_name: 'Updated User',
        password: 'updatedpassword123',
        role_id: 2,
        is_active: false };
    const token = jwt.sign({ id: userId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const response = await request(app)
    .put(`/users/${userId}`)
    .set('Authorization', `Bearer ${token}`)
    .send(updatedUser);
    expect(response.status).toBe(200);
  });

  it('DELETE /users/:id - should call deleteUser', async () => {
    const token = jwt.sign({ id: userId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const response = await request(app).delete(`/users/${userId}`).set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });
});
