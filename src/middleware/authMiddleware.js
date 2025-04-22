const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.log("No token provided");
            return res.status(401).json({ message: 'Unauthorized', statusCode: 401 });
        }
 
        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log("No token provided");
            return res.status(401).json({ message: 'Unauthorized', statusCode: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.trainer = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token Expired', statusCode: 401 });
    }
};

module.exports = authMiddleware; 