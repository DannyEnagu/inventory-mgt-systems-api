const jwt = require('jsonwebtoken');
import { User } from "@prisma/client";

module.exports = {
    generateToken: (payload: Pick<User, 'id' | 'role'>) => {
        return jwt.sign({
                _id: payload.id,
                role: payload.role,
            },
            process.env.JWT_SECRET || 'SomeSecretKey',
            { expiresIn: '24h' }
        );
    },
    verifyToken: (token: string) => {
        return jwt.verify(token, process.env.JWT_SECRET);
    },
};