import { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom} from '../../src/controllers/roomController';
import pool from './../../src/config/db'; // Assuming you're using a pool from your DB config
import { afterAll, beforeAll, describe, it, expect, vi } from 'vitest';
import { deleteRoom } from '../../src/models/roomModel';

describe('Room Controller', () => {
    let testRoomId;

    // Create a temporary room before all tests
    beforeAll(async () => {
        const { rows } = await pool.query(
            `INSERT INTO t_rooms (room_name, room_seating_capacity, room_type, building_name, is_active, created_on, updated_on) 
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING ROOM_ID`,
            ['room test5', 5, 'Lecture', "Block test", true]
        );
        testRoomId = rows[0].room_id;
    });

    // Delete the temporary room after all tests
    afterAll(async () => {
        let roomName = "room test2"
        await pool.query('DELETE FROM t_rooms WHERE ROOM_ID = $1', [testRoomId]);
        await pool.query('DELETE FROM t_rooms WHERE ROOM_NAME = $1', [roomName]);
    });

    it('should get all rooms', async () => {
        const req = {};
        const res = { json: vi.fn() };
        await getAllRooms(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });

    it('should get a room by ID', async () => {
        const req = { params: { id: testRoomId } }; // Use the temp room's ID
        const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
        await getRoomById(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ room_id: testRoomId }));
    });

    it('should fail to get a room by ID if room does not exist', async () => {
        const req = { params: { id: 99999 } }; // Non-existent room ID
        const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
        await getRoomById(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Room not found' });
    });

    it('should create a new room', async () => {
        const req = {
            body: {
                roomName: "room test2",
                capacity: 5,
                room_type: "discussion",
                buildingName: "block test2",
                is_active: true
            }
        };
        const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
        await createRoom(req, res);
    
        // Only check for the room name and message
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Room created successfully',
            room: expect.objectContaining({
                room_name: 'room test2',
            })
        }));
    });

    it('should fail to create a room if missing required fields', async () => {
        const req = {
            body: {
                roomName: "room test3",
                room_type: "discussion",
                buildingName: "block test3",
                is_active: true
            }
        };
        const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
        await createRoom(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields' });
    });

    it('should fail to create a room if name already exists', async () => {
        const req = {
            body: {
                roomName: "room test5", //existing room name
                capacity: 5,
                room_type: "discussion",
                buildingName: "block test5",
                is_active: true
            }
        };
        const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
        await createRoom(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Room name is already in use' });
    });

    it('should update a room', async () => {
        const req = {
            params: { id: testRoomId },
            body: {
                roomName: "room update",
                capacity: 10,
                room_type: "lecture",
                buildingName: "block uodate",
                is_active: true
            }
        };
        const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
        await updateRoom(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Room updated successfully',
            room: expect.objectContaining({ room_name: 'room update' })
        }));
    });

    it('should fail to update a room if room does not exist', async () => {
        const req = {
            params: { id: 99999 }, // Non-existent room ID
            body: {
                roomName: "room update",
                capacity: 10,
                room_type: "lecture",
                buildingName: "block uodate",
                is_active: true
            }
        };
        const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
        await updateRoom(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Room not found' });
    });

    it('should delete a room', async () => {
        const req = { params: { id: testRoomId } }; // Use the temp room's ID
        const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
        await deleteRoom(req, res);
        expect(res.json).toHaveBeenCalledWith({ message: 'Room deleted successfully' });
    });

    it('should fail to delete a room if room does not exist', async () => {
        const req = { params: { id: 99999 } }; // Non-existent room ID
        const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
        await deleteRoom(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Room not found' });
    });
});
