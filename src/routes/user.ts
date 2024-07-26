import express, { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
const { updateCustomerInfo } = require('../utils');
const catchError = require('../helpers/error');

const prisma = new PrismaClient();
const router = express.Router();

async function getUsers (req: Request, res: Response) {
    const users = await prisma.user.findMany();
    const usersCount = users.length;
    const usersList = users.map(user => {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }
    });
    res.status(200).json({ usersList, usersCount, success: true });
}

async function getUserById (req:Request, res:Response) {
    const userId = req.params.id;
    const user = await prisma.user.findFirst(
        {
            where: {id:  userId },
            include: {
                Customer: true,
                Order: true
            }
        }
    )

    if (!user) {
        res.status(404).json({ message: 'User not found!', success: false });
        return;
    }

    const { password, ...userData } = user;
    res.status(200).json({user: userData, success: true});
};

async function updateCustomerInfoByUserId (req: Request, res: Response) {
    // Update the user's customer information
    // This is a custom route that updates the user's customer information
    const userId = req.params.id;
    const { address, phoneNumber } = req.body;

    if (!address || !phoneNumber || address.length < 10 || phoneNumber.length < 10) {
        res.status(400).json({ message: "Invalid fields! 'Address' and 'Phone number' are required and must be at least 10 characters.", success: false });
        return;
    }
    
    // Check if the user exists before updating the customer information
    const userExists = await prisma.user.findFirst({
        where: { id: userId },
        include: { Customer: true } // Include the customer information
    });

    if (!userExists) {
        res.status(404).json({ message: 'User not found!', success: false });
        return;
    }

    const user = await updateCustomerInfo({
        userId,
        address,
        phoneNumber
    });
    const { password, ...userData } = user;
    res.status(200).json({ user: userData, success: true });
}

async function updateUserById (req: Request, res: Response) {
    const userId = req.params.id;
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        res.status(400).json({ message: 'Invalid fields! try updating username or email or password.', success: false });
        return;
    }
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            username,
            email,
            password
        }
    });

    const { password: _, ...userData } = user;
    res.status(200).json({ user: userData, success: true });
}

async function deleteUserById (req: Request, res: Response) {
    const userId = req.params.id;
    await prisma.user.delete({
        where: { id: userId }
    });

    res.status(200).json({ message: 'User deleted successfully!', success: true });
}

router.get('/users/', catchError(getUsers));
router.get('/user/:id', catchError(getUserById));
router.put('/user/:id', catchError(updateUserById));
router.put('/user/:id/customer', catchError(updateCustomerInfoByUserId));
router.delete('/user/:id', catchError(deleteUserById));

module.exports = router;