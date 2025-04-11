    const userModel = require('../models/userModel');
    const jwt = require('jsonwebtoken');
    const bcrypt = require('bcryptjs');

    const loginUser = async (req, res) => {
        try {
        const { email, password } = req.body;
        
        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ message: "Missing email or password" });
        }
    
        const user = await userModel.getByEmail(email);
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        
        console.log("Hashed password from DB:", user.user_password);
        // Compare passwords directly (plaintext check)
        const isMatch = await bcrypt.compare(password.trim(), user.user_password);
        if (!isMatch) {

            console.log(isMatch);
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { userId: user.user_id, email: user.user_email, role: user.user_role_id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN } // e.g., '1h'
        );

        console.log(token);
    
        // Send user details (excluding password)
        const userData = {
            user_id: user.user_id,
            email: user.user_email,
            full_name: user.user_full_name,
            role_id: user.user_role_id,
            is_active: user.is_active,
            token
        };
    
        res.json({ message: "Login successful", user: userData });
        } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
        }
    };
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
            const userId = parseInt(req.params.id, 10);
            const user = await userModel.getById(userId);
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

            const existingEmail = await userModel.getByEmail(email);
            if(existingEmail)
            {
                return res.status(400).json({ message: 'Email is already in use' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await userModel.create({ 
                email, 
                full_name, 
                password: hashedPassword, 
                role_id, is_active });
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
            const deleted = await userModel.deleteUser(req.params.id);
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
        loginUser,
        getAllUsers,
        getUserById,
        createUser,
        updateUser,
        deleteUser
    };
