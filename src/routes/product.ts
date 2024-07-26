import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const { addInventoryItem } = require('../utils');
const catchError = require('../helpers/error');

const prisma = new PrismaClient();
const router = express.Router();


async function productsList (req: Request, res: Response) {
    const products = await prisma.product.findMany({
        include: { category: true }
    });

    res.status(200).json({ products, success: true });
}

async function getProductById (req: Request, res: Response) {
    const productId = req.params.id;
    const product = await prisma.product.findFirst(
        {
            where: {id:  productId },
            include: { category: true }
        }
    )

    res.status(200).json({product, success: true})
}

async function createProduct (req: Request, res: Response) {
    const {
        name,
        price,
        categoryId,
        description,
        location,
        quantity,
        reorderLevel,
        variation
    } = req.body;

    // Check if the required fields are provided
    if (!name || !price || !categoryId || !description || !quantity || !reorderLevel) {
        res.status(400).json({ message: 'Product name, price, category, description, quantity, or reorder Level is required!', success: false });
        return;
    }
    // Create a new product
    const newProd = await prisma.product.create({
        data: {
            name,
            price,
            categoryId,
            description,
            status: 'IN_STOCK',
        }
    });
    // Fetch the newly created product with the category
    const product = await prisma.product.findFirst({
        where: { id: newProd.id },
        include: { category: true }
    });
    // Return the newly created product
    res.status(200).json({ product, success: true });

    // Create a new Inventory record for the product
    await addInventoryItem({
        reorderLevel,
        quantity,
        productId: newProd.id,
        location: location || null,
        variation: variation || null
    });
}

async function updateProduct (req: Request, res: Response) {
    const productId = req.params.id;
    const { name, price, categoryId } = req.body;
    if (!productId) {
        res.status(400).json({ message: 'Product ID is required!', success: false });
        return;
    }

    if (name || !price || !categoryId) {
        res.status(400).json({ message: 'Product data name, price, or categoryId is required for data update!', success: false });
        return;
    }

    const product = await prisma.product.update({
        where: { id: productId },
        data: {...req.body}
    });

    res.status(200).json({ product, success: true });
}

async function deleteProductById (req: Request, res: Response) {
    const productId = req.params.id;
    if (!productId) {
        res.status(400).json({ message: 'Product ID is required!', success: false });
        return;
    }

    await prisma.product.delete({
        where: { id: productId }
    });

    res.status(200).json({ message: 'Product deleted successfully!', success: true });

    // Delete the inventory record for the product
    await prisma.inventory.deleteMany({
        where: { productId }
    });
}

router.get('/products/', catchError(productsList));
router.get('/product/:id', catchError(getProductById));
router.post('/product/', catchError(createProduct));
router.put('/product/:id', catchError(updateProduct));
router.delete('/product/:id', catchError(deleteProductById));

module.exports = router;