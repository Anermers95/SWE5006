import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import pool from './../../src/config/db'; // Adjust the path as necessary
const roomRouter = require('../../src/routes/roomRoutes'); // ✅ Use require instead of import
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/rooms', roomRouter);

let roomId;
let newRoomId;
const uniqueSuffix = Date.now();
let testRoomName = `Test Room ${uniqueSuffix}`;

describe('Room Routes', () => {
  beforeAll(async () => {
    const { rows } = await pool.query(
      `INSERT INTO t_rooms (room_name, room_seating_capacity, room_type, building_name, is_active, created_on, updated_on) 
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING room_id`,
      [testRoomName, 5, 'Lecture', 'Block test', true]
    );
    roomId = rows[0].room_id;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM t_rooms WHERE room_id = $1', [roomId]);
    if(newRoomId) {
      await pool.query('DELETE FROM t_rooms WHERE room_id = $1', [newRoomId]);
    }
  });

  it('GET /rooms - should return all rooms', async () => {
    const response = await request(app).get('/rooms/');
    expect(response.status).toBe(200);
  });

  it('GET /rooms/:id - should return room by ID', async () => {
    const response = await request(app).get(`/rooms/${roomId}`);
    expect(response.status).toBe(200);
  });

  // it('GET /rooms/:name - should return room by name', async () => {
  //   const response = await request(app).get(`/rooms/${testRoomName}`);
  //   console.log("response.body", response.body);
  //   expect(response.status).toBe(200);
  // });

  it('POST /rooms - should create a new room', async () => {
    
    const newRoom = {
      roomName: testRoomName,
      capacity: 5,
      room_type: 'Lecture',
      buildingName: 'block new',
      is_active: true,
    };
    const response = await request(app).post('/rooms').send(newRoom);
    newRoomId = response.body.room.room_id; 
    expect(response.status).toBe(201);
  });

  it('PUT /rooms/:id - should update an existing room', async () => {
    const updatedRoom = {
      roomName: 'room update',
      capacity: 10,
      room_type: 'Discussion',
      buildingName: 'block update',
      is_active: true,
    };
    const response = await request(app).put(`/rooms/${roomId}`).send(updatedRoom);
    expect(response.status).toBe(200);
  });

  it('DELETE /rooms/:id - should delete an existing room', async () => {
    const response = await request(app).delete(`/rooms/${roomId}`);
    expect(response.status).toBe(200);
  });
});
