const authMiddleware = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post("/login", userController.loginUser);
router.get('/', userController.getAllUsers);


router.get('/:id',authMiddleware, userController.getUserById);
router.post('/',authMiddleware, userController.createUser);
router.put('/:id',authMiddleware, userController.updateUser);
router.delete('/:id',authMiddleware, userController.deleteUser);

module.exports = router;
