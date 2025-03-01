import { describe, it, expect, vi, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import pool from './../../src/config/db'; // Adjust the path as necessary
import roomRouter from '../../src/routes/roomRoutes'; // Ensure the correct path to userRoutes
import * as roomController from '../../src/controllers/roomController'; // Using import syntax
const cors = require('cors');

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
app.use('/rooms', roomRouter);
let roomId;

describe('Room Routes', () => {
    beforeAll(async () => {
        const { rows } = await pool.query(
            `INSERT INTO t_rooms (room_name, room_seating_capacity, room_type, building_name, is_active, created_on, updated_on) 
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING ROOM_ID`,
            ['room test2', 5, 'Lecture', "Block test", true]
        );
        roomId = rows[0].room_id;

        console.log(roomId);
      });
    
    afterAll(async()=>{
        let roomName = 'room test2';
        await pool.query('DELETE FROM t_rooms WHERE ROOM_NAME = $1', [roomName]);
        let newRoomName = 'room new'
        await pool.query('DELETE FROM t_rooms WHERE ROOM_NAME = $1', [newRoomName]);

    })

    it('GET /rooms - should call getAllRooms', async () => {
        const response = await request(app).get('/rooms');
        expect(response.status).toBe(200);
    });

  it('GET /rooms/:id - should call getRoomById', async () => {
    const response = await request(app).get(`/rooms/${roomId}`);
    expect(response.status).toBe(200);
  });

  it('POST /rooms - should call createRoom', async () => {
    const newRoom = { rooName: 'room new',
        capacity: 5,
        room_type: 'Lecture',
        buildingName: 'block new',
        is_active: true };
    const response = await request(app).post('/rooms').send(newRoom);
    expect(response.status).toBe(201);
  });

  it('PUT /rooms/:id - should call updateRoom', async () => {
    const updatedRoom = { rooName: 'room update',
      capacity: 10,
      room_type: 'Discussion',
      buildingName: 'block update',
      is_active: true };
    const response = await request(app).put(`/rooms/${roomId}`).send(updatedRoom);
    expect(response.status).toBe(200);
  });

  it('DELETE /rooms/:id - should call deleteRoom', async () => {
    const response = await request(app).delete(`/rooms/${roomId}`);
    expect(response.status).toBe(200);
  });
});
