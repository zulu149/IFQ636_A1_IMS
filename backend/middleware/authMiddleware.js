
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }

    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    next();
};

const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
};

module.exports = { protect, authorize };
