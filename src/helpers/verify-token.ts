import { Request, Response, NextFunction } from 'express';
const { verifyToken } = require('./jwt-token');

// declare global {
//     namespace Express {
//       interface Request {
//         user?: any;
//       }
//     }
//   }

const verifyBearerToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const bearerToken = req.headers.authorization;
        if (!bearerToken) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = bearerToken.split(' ')[1];
        verifyToken(token);
        // req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
}

module.exports = verifyBearerToken;