import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../../src/controllers/userController';
import pool from '../../src/config/db'; // Assuming you're using a pool from your DB config
import { afterAll } from 'vitest';

describe('User Controller', () => {
    let testUserId;

    // Create a temporary user before all tests
    beforeAll(async () => {
        const { rows } = await pool.query(
            `INSERT INTO T_USERS (USER_EMAIL, USER_FULL_NAME, USER_PASSWORD, USER_ROLE_ID, CREATED_ON, UPDATED_ON, IS_ACTIVE) 
             VALUES ($1, $2, $3, $4, NOW(), NOW(), $5) RETURNING USER_ID`,
            ['test5@example.com', 'Test User', 'password123', 1, true]
        );
        testUserId = rows[0].user_id;
    });

    // Delete the temporary user after all tests
    afterAll(async () => {
        let email = "test2@example.com"
        await pool.query('DELETE FROM T_USERS WHERE USER_ID = $1', [testUserId]);
        await pool.query('DELETE FROM T_USERS WHERE USER_EMAIL = $1', [email]);
    });

    it('should get all users', async () => {
        const req = {};
        const res = { json: vi.fn() };
        await getAllUsers(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });

    it('should get a user by ID', async () => {
        const req = { params: { id: testUserId } }; // Use the temp user's ID
        const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
        await getUserById(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ user_id: testUserId }));
    });

    it('should create a new user', async () => {
        const req = {
            body: {
                email: 'test2@example.com',
                full_name: 'Test User 2',
                password: 'password123',
                role_id: 1,
                is_active: true
            }
        };
        const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
        await createUser(req, res);
    
        // Only check for the email and message
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'User created successfully',
            user: expect.objectContaining({
                user_email: 'test2@example.com',
            })
        }));
    });
    
    

    it('should update a user', async () => {
        const req = {
            params: { id: testUserId },
            body: {
                email: 'updated@example.com',
                full_name: 'Updated User',
                password: 'newpassword123',
                role_id: 2,
                is_active: false
            }
        };
        const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
        await updateUser(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'User updated successfully',
            user: expect.objectContaining({ user_email: 'updated@example.com' })
        }));
    });

    it('should delete a user', async () => {
        const req = { params: { id: testUserId } }; // Use the temp user's ID
        const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
        await deleteUser(req, res);
        expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    });
});
