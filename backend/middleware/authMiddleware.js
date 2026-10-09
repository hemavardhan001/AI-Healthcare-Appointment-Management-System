const jwt = require('jsonwebtoken');
const { findUserById } = require('../models/userModel');

const protect = async (req, res, next) => {

    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {

        token = req.headers.authorization.split(' ')[1];

        try {

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            // Get the latest user details from the database
            const user = await findUserById(decoded.id);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Use the database as the source of truth
            req.user = {
                id: user.id,
                role: user.role,
                name: user.name,
                email: user.email
            };

            next();

        } catch (err) {

            console.error('Authentication error:', err.message);

            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });

        }

    } else {

        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });

    }

};

module.exports = protect;