import express from 'express';
import { PrismaClient } from '@prisma/client';
const { addInventoryItem } = require('../utils');

const prisma = new PrismaClient();
const router = express.Router();

router.get('/products/', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { category: true }
        });

        res.status(200).json({ products, success: true });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!', success: false });
    }
});

router.get('/product/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await prisma.product.findFirst(
            {
                where: {id:  productId },
                include: { category: true }
            }
        )

        res.status(200).json({product, success: true})
    } catch (error) {
        res.status(500).json({ message: 'Server Error!', success: false})
    }
});

router.post('/product/', async (req, res) => {
    try {
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
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error!', success: false });
    }
});

router.put('/product/:id', async (req ,res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: 'Server Error!', success: false });
    }
});

router.delete('/product/:id', async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: 'Server Error!', success: false });
    }
});


module.exports = router;