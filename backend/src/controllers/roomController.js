const roomModel = require('../models/roomModel');
const bookingModel = require('../models/bookingModel');

const { use } = require('../routes/roomRoutes');

// Get all rooms
const getAllRooms = async (req, res) => {
    try {
        const rooms = await roomModel.getAll();
        res.json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
// Get a room by ID
const getRoomById = async (req, res) => {
    try {
        const roomId = parseInt(req.params.id, 10);
        const room = await roomModel.getById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json(room);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a room by ID
const getRoomByName = async (req, res) => {
    try {
        const name = req.body;
        const room = await roomModel.getByName(name);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json(room);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new room
const createRoom = async (req, res) => {
    try {
        console.log( req.body);
        const { roomName, capacity, room_type, buildingName, is_active} = req.body;

        if (!roomName || !capacity || !buildingName || !room_type) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if room name is already in use in building
        const exsitingBuildingName = await roomModel.getByRoomAndBuilding(roomName);
        if(exsitingBuildingName)
        {
            return res.status(400).json({ message: 'Room name is already in use within building' });
        }
        const newroom = await roomModel.create({ roomName, capacity, room_type, buildingName, is_active });
        res.status(201).json({ message: 'Room created successfully', room: newroom });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
// Update Room
const updateRoom = async (req, res) => {
    try {
        const { roomName, capacity, room_type, buildingName, is_active } = req.body;
        const updatedroom = await roomModel.update(req.params.id, { roomName, capacity, room_type, buildingName, is_active});

        if (!updatedroom) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json({ message: 'Room updated successfully', room: updatedroom });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
// Delete room
const deleteRoom = async (req, res) => {
    try {
        // Get room with bookings, if any return error
        const roomWithBooking = await bookingModel.getByRoomId(req.params.id);
        if (roomWithBooking.length > 0) {
            return res.status(400).json({ message: 'Room has bookings' });
        }

        // Delete room
        const deleted = await roomModel.deleteRoom(req.params.id);  
        if (!deleted) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
module.exports = {
    getAllRooms,
    getRoomById,
    getRoomByName,
    createRoom,
    updateRoom,
    deleteRoom
};
