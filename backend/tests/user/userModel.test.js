import { describe, it, expect, beforeAll, afterAll, test } from 'vitest';
import pool from './../../src/config/db'; // Adjust the path as necessary
import { getAll, getById, create, update, deleteUser, getByEmail } from './../../src/models/userModel';

describe('User Model', () => {
    let testUserId;

    beforeAll(async () => {
        // Setup: Create a test user to use in the tests
        const { rows } = await pool.query(
            `INSERT INTO T_USERS (USER_EMAIL, USER_FULL_NAME, USER_PASSWORD, USER_ROLE_ID, CREATED_ON, UPDATED_ON, IS_ACTIVE) 
             VALUES ($1, $2, $3, $4, NOW(), NOW(), $5) RETURNING USER_ID`,
            ['test4@example.com', 'Test User', 'password123', 1, true]
        );
        testUserId = rows[0].user_id;
    });

    afterAll(async () => {
        // Teardown: Delete the test user
        let email = 'newuser@example.com';
        await pool.query('DELETE FROM T_USERS WHERE USER_EMAIL = $1', [email]);
    });

    it('should get all users', async () => {
        const users = await getAll();
        expect(Array.isArray(users)).toBe(true);
    });

    it('should get a user by ID', async () => {
        const user = await getById(testUserId);
        expect(user).toBeDefined();
        expect(user.user_id).toBe(testUserId);
    });

    it('should get a user by email', async () => {
        const user = await getByEmail('test4@example.com');
        expect(user).toBeDefined();
        expect(user.user_email).toBe('test4@example.com');
    });

    it('should create a new user', async () => {
        const newUser = await create({
            email: 'newuser@example.com',
            full_name: 'New User',
            password: 'newpassword123',
            role_id: 1,
            is_active: true
        });
        expect(newUser).toBeDefined();
        expect(newUser.user_email).toBe('newuser@example.com');
    });

    it('should update a user', async () => {
        const updatedUser = await update(testUserId, {
            email: 'updated@example.com',
            full_name: 'Updated User',
            password: 'updatedpassword123',
            role_id: 2,
            is_active: false
        });
        expect(updatedUser).toBeDefined();
        expect(updatedUser.user_email).toBe('updated@example.com');
    });

    it('should delete a user', async () => {
        console.log(testUserId);
        const deleted = await deleteUser(testUserId);
        expect(deleted).toBe(true);
    });
});