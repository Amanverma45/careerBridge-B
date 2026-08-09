const jwt = require('jsonwebtoken');
const User = require('../model/userModel.js');

/**
 * Middleware to verify JWT token and attach user to req.user
 */
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Access Denied. No token provided." });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Invalid authorization format." });
        }

        const decoded = jwt.verify(token, "OUR_SECRETE_KEY");
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: "User not found or deleted." });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("verifyToken middleware error:", error.message);
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

module.exports = { verifyToken };
