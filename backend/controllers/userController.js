const userModel = require('../models/userModel');

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.getAll();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a user by ID
const getUserById = async (req, res) => {
    try {
        const user = await userModel.getById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new user
const createUser = async (req, res) => {
    try {
        console.log( req.body);
        const { email, full_name, password, role_id, is_active } = req.body;

        if (!email || !full_name || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newUser = await userModel.create({ email, full_name, password, role_id, is_active });
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user
const updateUser = async (req, res) => {
    try {
        const { email, full_name, password, role_id, is_active } = req.body;
        const updatedUser = await userModel.update(req.params.id, { email, full_name, password, role_id, is_active });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const deleted = await userModel.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
