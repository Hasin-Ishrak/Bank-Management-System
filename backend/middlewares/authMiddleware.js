const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contains id, username, and role
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

// Middleware factory to check specific roles
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden. You do not have the required role permissions.' });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRoles };