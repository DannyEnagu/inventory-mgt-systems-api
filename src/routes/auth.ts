import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    try {

        const userExists = await prisma.user.findFirst({
            where: {
                email,
            },
        });

        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password,
            },
        });
        res.status(201).json({ user });
    } catch (error) {
        res.status(500).json({ error });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findFirst({
            where: {
                email,
                password,
            },
        });
        if (user) {
            res.status(200).json({ user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error });
    }
});


module.exports = router;

