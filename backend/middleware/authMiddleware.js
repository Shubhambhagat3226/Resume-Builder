import User from '../models/UserModel.js';
import jwt from 'jsonwebtoken';

// PROTECT ROUTE
export const protect = async (req, res, next) => {
    try {
        let token = req.headers.authorization;

        // Check if token is provided in headers
        if (token && token.startsWith('Bearer')) {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } else {
            res.status(401).json({ message: 'Not authorized, no token found' });
        }
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token verification failed',
            error: error.message
        });
    }
}