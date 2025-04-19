import { describe, it, expect, beforeAll, afterAll, test } from 'vitest';
import pool from './../../src/config/db'; // Adjust the path as necessary
import { getAll, getById, create, update, deleteRoom, getByName, getByRoomAndBuilding } from '../../src/models/roomModel';

describe('Room Model', () => {
    let testRoomId;
    
    beforeAll(async () => {
        const { rows } = await pool.query(
            `INSERT INTO t_rooms (room_name, room_seating_capacity, room_type, building_name, is_active, created_on, updated_on) 
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING ROOM_ID`,
            ['room test6', 5, 'Lecture', "Block test", true]
        );
        testRoomId = rows[0].room_id;
    });

    afterAll(async () => {
        // Teardown: Delete the test room
        let name = 'room new';
        await pool.query('DELETE FROM t_rooms WHERE ROOM_NAME = $1', [name]);
    });

    it('should get all rooms', async () => {
        const rooms = await getAll();
        expect(Array.isArray(rooms)).toBe(true);
    });

    it('should get a room by ID', async () => {
        console.log('[TEST] testRoomId:', testRoomId);
        const room = await getById(testRoomId);
        expect(room).toBeDefined();
        expect(room.room_id).toBe(testRoomId);
    });

    it('should return undefined for non-existent room ID', async () => {
        const room = await getById(999999); 
        expect(room).toBeUndefined();
    });
    
    it('should return undefined for non-existent room name', async () => {
        const room = await getByName('non-existent-room-name');
        expect(room).toBeUndefined();
    });

    it('should get a room by name', async () => {
        const room = await getByName('room test6');
        expect(room).toBeDefined();
        expect(room.room_name).toBe('room test6');
    });

    it('should create a new room', async () => {
        const newRoom = await create({
            roomName: "room new",
            capacity: 5,
            room_type: "Lecture",
            buildingName: "block new",
            is_active: true
        });
        expect(newRoom).toBeDefined();
        expect(newRoom.room_name).toBe('room new');
    });

    it('should update a room', async () => {
        const updatedRoom = await update(testRoomId, {
            roomName: "room update",
            capacity: 10,
            room_type: "Discussion",
            buildingName: "block update",
            is_active: true
        });
        expect(updatedRoom).toBeDefined();
        expect(updatedRoom.room_name).toBe('room update');
    });

    it('should get a room by name and building name', async () => {
        const room = await getByRoomAndBuilding('room update', 'block update');
        expect(room).toBeDefined();
        expect(room.room_name).toBe('room update');
        expect(room.building_name).toBe('block update');
    });

    it('should delete a room', async () => {
        console.log(testRoomId);
        const deleted = await deleteRoom(testRoomId);
        expect(deleted).toBe(true);
    });
});
