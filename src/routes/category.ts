import express, { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
const catchError = require('../helpers/error');

const prisma = new PrismaClient();
const router = express.Router();

async function getCategories (req: Request, res: Response) {
    const categories = await prisma.category.findMany();
    res.status(200).json({ categories, success: true });
}

async function getCategoryById (req: Request, res: Response) {  
    const categoryId = req.params.id;
    const category = await prisma.category.findFirst(
        { where: {id:  categoryId}}
    )

    res.status(200).json({category, success: true})
}

async function createCategory (req: Request, res: Response) {
    const { name } = req.body;
    const category = await prisma.category.create({
        data: {
            name
        }
    });

    res.status(200).json({ category, success: true });
}

async function updateCategory (req: Request, res: Response) {
    const categoryId = req.params.id;
    const { name } = req.body;
    const category = await prisma.category.update({
        where: { id: categoryId },
        data: {
            name
        }
    });

    res.status(200).json({ category, success: true });
}

async function deleteCategoryById (req: Request, res: Response){
    const categoryId = req.params.id;
    await prisma.category.delete({
        where: { id: categoryId }
    });

    res.status(200).json({ message: 'Category deleted successfully!', success: true });
}

router.get('/categories/', catchError(getCategories));
router.get('/category/:id', catchError(getCategoryById));
router.post('/category/', catchError(createCategory));
router.put('/category/:id', catchError(updateCategory));
router.delete('/category/:id', catchError(deleteCategoryById));

module.exports = router;