import express from "express";
import { PrismaClient } from '@prisma/client';
const { updateCustomerInfo } = require('../utils');

const prisma = new PrismaClient();
const router = express.Router();

router.get('/users/', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json({ users, success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!', success: false });
    }
});

router.get('/user/:id', async (req, res) => {
    try {
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

        res.status(200).json({user, success: true})
    } catch (error) {
        res.status(500).json({ message: 'Server Error!', success: false})
    }
});

router.post('/user/', async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role
        } = req.body;

        const formattedName = name.replace(/\s/g, '_').toLowerCase();

        if (!name || !email || !password) {
            res.status(400).json({ message: 'User name, email, and password are required!', success: false });
            return;
        }

        if (name.length < 3 || name.length > 50 || !name.includes(' ')) {
            res.status(400).json({ message: 'Invalid name! Name must be between 3 and 50 characters and must contain a space.', success: false });
            return;
        }
        if (typeof role === 'string' && role !== 'ADMIN' && role !== 'STAFF') {
            res.status(400).json({ message: "Invalid role! Use either 'ADMIN' or 'STAFF'", success: false });
            return;
        }

        // Check if the email is already in use
        const userExists = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username: formattedName }
                ]
            }
        });

        if (userExists) {
            res.status(400).json({ message: 'User already exit.', success: false });
            return;
        }

        const user = await prisma.user.create({
            data: {
                password,
                email,
                username: formattedName, // Generate a username from the name
                role: role || null
            }
        });

        // Remove the password from the response
        const { password: _, ...userData } = user;
        res.status(200).json({ user: userData, success: true });

        // Create a new customer if the role is not specified
        if (!role) {
            await prisma.customer.create({
                data: { userId: user.id }
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error!', success: false });
    }
});

router.put('/user/:id/customer', async (req, res) => {
    // Update the user's customer information
    // This is a custom route that updates the user's customer information
    try {
        const userId = req.params.id;
        const { address, phoneNumber } = req.body;

        if (!address || !phoneNumber || address.length < 10 || phoneNumber.length < 10) {
            res.status(400).json({ message: "Invalid fields! 'Address' and 'Phone number' are required and must be at least 10 characters.", success: false });
            return;
        }
        
        // Check if the user exists before updating the customer information
        const userExists = await prisma.user.findFirst({
            where: { id: userId }
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

        res.status(200).json({ user, success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!', success: false });
        console.error(error);
    }
});

router.put('/user/:id', async (req ,res) => {
    try {
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

        res.status(200).json({ user, success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!', success: false });
    }
});

router.delete('/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        await prisma.user.delete({
            where: { id: userId }
        });

        res.status(200).json({ message: 'User deleted successfully!', success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!', success: false });
    }
});

module.exports = router;