import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();

const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    //   const users = await prisma.user.findMany();
    try {
        res.send(200).json({ message: 'Server is up and running!' });
    } catch (error) {
        res.send(500).json({ message: 'Server Error!' });
    }
});

export default router;