import { Product, Inventory, PrismaClient, Order, Customer } from "@prisma/client";

const prisma = new PrismaClient();

type InventoryType = Pick<Inventory, 'location' | 'quantity' | 'productId' | 'reorderLevel'>;

type InventoryData = InventoryType & {
    variation?: Record<string, any>;
};

async function updateProductStatus(productId: Product['id']) { 
    // Fetch the product along with its inventory  
    const product = await prisma.product.findFirst({  
        where: { id: productId },  
        include: { inventory: true }
    });

    if (!product) {  
        throw new Error("Product not found");  
    }

    // Determine the new status based on inventory length  
    const newStatus = product.inventory.length > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK';  

    // Update the product with the new status  
    await prisma.product.update({
        where: { id: productId },
        data: { status: newStatus },
    });
}

// Create a new inventory
async function addInventoryItem(inventory: InventoryData): Promise<Inventory> {
    try {
        const newInventory = await prisma.inventory.create({
            data: {
                ...inventory
            }
        });
        await updateProductStatus(inventory.productId);
        return newInventory;
    } catch (error) {
        throw new Error('Error adding inventory');
    }
}

// Update an existing inventory
async function updateInventoryItem(inventoryId: Inventory['id'], inventory: InventoryData): Promise<Inventory> {
    try {
        const updatedInventory = await prisma.inventory.update({
            where: { id: inventoryId },
            data: {
                ...inventory
            }
        });
        return updatedInventory;
    } catch (error) {
        throw new Error('Error updating inventory');
    }
}

async function deleteInventoryItem(inventoryId: Inventory['id']): Promise<Inventory> {
    try {
        const deletedInventory = await prisma.inventory.delete({
            where: { id: inventoryId }
        });
        return deletedInventory;
    } catch (error) {
        throw new Error('Error deleting inventory');
    }
}

async function getOrderedProducts(orderId: Order['id']) {
    const orderProducts = await prisma.orderProduct.findMany({
        where: { orderId },
        include: { product: true }
    });

    return orderProducts;
}

async function updateCustomerInfo(userData: Pick<Customer, 'userId' | 'address' | 'phoneNumber'>): Promise<Customer> {
    const customer = await prisma.customer.update({
        where: { userId: userData.userId },
        data: {
            address: userData.address,
            phoneNumber: userData.phoneNumber
        },
        include: { user: true }
    });

    return customer;
}

module.exports = {
    addInventoryItem,
    updateInventoryItem,
    updateProductStatus,
    deleteInventoryItem,
    getOrderedProducts,
    updateCustomerInfo
};

