const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../model/userModel.js');
const adminController = require('../controller/adminController.js');

// Admin Authorization Middleware
const verifyAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Invalid authorization format" });
        }

        const decoded = jwt.verify(token, "OUR_SECRETE_KEY");
        const user = await User.findById(decoded.userId);
        
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admin role required." });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("verifyAdmin error:", error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// Admin Routes (all protected by verifyAdmin)
router.get('/users', verifyAdmin, adminController.getUsers);
router.get('/recruiters', verifyAdmin, adminController.getRecruiters);
router.get('/jobs', verifyAdmin, adminController.getJobs);
router.delete('/user/:id', verifyAdmin, adminController.deleteUser);
router.delete('/job/:id', verifyAdmin, adminController.deleteJob);

module.exports = router;
