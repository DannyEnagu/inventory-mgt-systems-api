import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const { generateToken } = require('../helpers/jwt-token');
const { hashPassword, comparePassword } = require('../helpers/password');
const catchError = require('../helpers/error');

const prisma = new PrismaClient();

const router = express.Router();


async function register (req: Request, res: Response) {
    // Register a new user
    // Generate a username from the name
    // Generate a token for the user
    // Create a new customer if the role is not specified
    const {
        name,
        email,
        password,
        role
    } = req.body;

    if (!name || !email || !password) {
        res.status(400).json({ message: 'User name, email, and password are required!', success: false });
        return;
    }
    // Validate the name
    if (name.length < 3 || name.length > 50 || !name.includes(' ')) {
        res.status(400).json({ message: 'Invalid name! Name must be between 3 and 50 characters and must contain a space.', success: false });
        return;
    }
    // Validate the role
    if (typeof role === 'string' && role !== 'ADMIN' && role !== 'STAFF') {
        res.status(400).json({ message: "Invalid role! Use either 'ADMIN' or 'STAFF'", success: false });
        return;
    }

    const formattedName = name.replace(/\s/g, '_').toLowerCase();
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
    // Create a new user
    const user = await prisma.user.create({
        data: {
            password: await hashPassword(password),
            email,
            username: formattedName, // Generate a username from the name
            role: role || null
        }
    });

    const token = generateToken({ id: user.id, role: user.role });

    // Remove the password from the response
    const { password: _, ...userData } = user;

    res.status(200).json({ token, user: userData, success: true });

    // Create a new customer if the role is not specified
    if (!role) {
        await prisma.customer.create({
            data: { userId: user.id }
        });
    }
}

const login = async (req: Request, res: Response) => {
    // Login a user
    // Check if the user exists
    // Validate the password
    // Generate a token for the user
    
    const { email, password } = req.body;
    const formatMail = email.replace(' ', '-').toLowerCase();

    if (!email || !password) {
        res.status(400).json({ message: 'User email and password are required!', success: false });
        return;
    }
    // Check if the user exists
    const user = await prisma.user.findFirst({
        where: {
            // email
        },
    });
    // Check if the user exists
    if (!user) {
        res.status(404).json({ message: 'Invalid Email or Password', success: false });
        return;
    }
    // Validate the password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
        res.status(404).json({ message: 'Invalid Email or Password', success: false });
        return;
    }
    
    const token = generateToken({ id: user.id, role: user.role });

    // Remove the password from the response and send the token with the user data
    const { password: _, ...userData } = user;
    res.status(200).json({ token, user: userData, success: true });
} 

router.post('/register', catchError(register));
router.post('/login', catchError(login));

module.exports = router;