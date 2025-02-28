const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    console.log("Auth Header:", authHeader);  // Log the header to check if it's received

    if (!authHeader || !authHeader.startsWith("Bearer")) {
        console.log("No token found in request.");
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded); // Log the decoded token
        req.user = decoded; // Attach user data to request
        next();
    } catch (error) {
        console.log("Invalid token error:", error.message);
        res.status(403).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;
