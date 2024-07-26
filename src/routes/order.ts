import express, { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
const { getOrderedProducts } = require('../utils');
const catchError = require('../helpers/error');

const prisma = new PrismaClient();
const router = express.Router();

async function orderList (req: Request, res: Response) {
    const dbOrders = await prisma.order.findMany();
    // Get ordered products for each order
    const orders = await Promise.all(dbOrders.map(async (order: any) => {
        const orderedProducts = await getOrderedProducts(order.id);
        return { ...order, products: orderedProducts };
    }));

    res.status(200).json({ orders, success: true });
}

async function getOrderById (req: Request, res: Response) {
    const orderId = req.params.id;
    const order = await prisma.order.findFirst(
        {
            where: {id:  orderId},
            include: { products: true }
        }
    )

    res.status(200).json({order, success: true})
}

async function createOrder (req: Request, res: Response) {
    const {
        customerId,
        cartProducts
    } = req.body;

    if (!customerId) {
        res.status(400).json({ message: 'Customer ID is required!', success: false });
        return;
    }

    if (!cartProducts || cartProducts.length === 0) {
        res.status(400).json({ message: 'Cart Products are required!', success: false });
        return;
    }

    // Check each product in the cart
    // If the product is not available, return an error
    for (const product of cartProducts) {
        const dbProduct = await prisma.product.findFirst({
            where: { id: product.productId }
        });

        if (!dbProduct) {
            res.status(404).json({ message: `Product with name ${product.name} not found!`, success: false });
            return;
        }

        if (dbProduct.status === 'OUT_OF_STOCK') {
            res.status(400).json({ message: `Product ${dbProduct.name} is out of stock!`, success: false });
            return;
        }
    }

    const order = await prisma.order.create({
        data: {
            userId: customerId,
            status: 'PENDING'
        },
    });

    // Create many products ordered
    if (order) {
        await prisma.orderProduct.createMany({
            data: cartProducts.map((product: any) => {
                return {
                    orderId: order.id,
                    productId: product.productId,
                    quantity: product.quantity,
                    price: product.price
                }
            }),
        });
    }

    const orderedProducts = await getOrderedProducts(order.id);

    res.status(200).json({
        order,
        orderedProducts,
        success: true
    });
}

async function updateOrderById (req: Request, res: Response) {
    const orderId = req.params.id;
    const { status } = req.body;
    if (!status) {
        res.status(400).json({ message: 'Status is required!', success: false });
        return;
    }

    if (status !== 'PENDING' && status !== 'COMPLETED' && status !== 'CANCELLED') {
        res.status(400).json({ message: 'Invalid status!', success: false });
        return;
    }

    const order = await prisma.order.update({
        where: { id: orderId },
        data: {
            status
        }
    });

    if (!order) {
        res.status(404).json({ message: 'Order not found!', success: false });
        return;
    }

    res.status(200).json({ order, success: true });
}

async function deleteOrderById (req: Request, res: Response){
    const orderId = req.params.id;

    const deleted = await prisma.order.delete({
        where: { id: orderId }
    });

    if (!deleted) {
        res.status(404).json({ message: 'Order not found!', success: false });
        return;
    }

    res.status(200).json({ message: 'Order deleted successfully!', success: true });
}

router.get('/orders/', catchError(orderList));
router.get('/order/:id', catchError(getOrderById));
router.post('/order/', catchError(createOrder));
router.put('/order/:id', catchError(updateOrderById));
router.delete('/order/:id', catchError(deleteOrderById));

module.exports = router;