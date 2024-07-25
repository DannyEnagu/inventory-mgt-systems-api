import express from "express";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/categories/', async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.status(200).json({ categories, success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!', success: false });
    }
});

router.get('/category/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await prisma.category.findFirst(
            { where: {id:  categoryId}}
        )

        res.status(200).json({category, success: true})
    } catch (error) {
        res.status(500).json({ message: 'Server Error!', success: false})
    }
});

router.post('/category/', async (req, res) => {
    try {
        const { name } = req.body;
        const category = await prisma.category.create({
            data: {
                name
            }
        });

        res.status(200).json({ category, success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!', success: false });
    }
});

router.put('/category/:id', async (req ,res) => {
    try {
        const categoryId = req.params.id;
        const { name } = req.body;
        const category = await prisma.category.update({
            where: { id: categoryId },
            data: {
                name
            }
        });

        res.status(200).json({ category, success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!', success: false });
    }
});

router.delete('/category/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;
        await prisma.category.delete({
            where: { id: categoryId }
        });

        res.status(200).json({ message: 'Category deleted successfully!', success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!', success: false });
    }
});

module.exports = router;

