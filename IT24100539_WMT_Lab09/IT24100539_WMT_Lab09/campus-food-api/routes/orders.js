const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const router = express.Router();

// Helper Function: To calculate total prices
async function calculateTotalPrice(items) {
    let total = 0;
    for (const item of items) {
        const menuItem = await MenuItem.findById(item.menuItem);
        if (!menuItem) {
            throw new Error(`Food item (MenuItem ID: ${item.menuItem}) not found.`);
        }
        total += menuItem.price * item.quantity;
    }
    return total;
}

// POST /orders – Placing an order
router.post('/', async (req, res) => {
    try {
        const { student, items } = req.body;

        if (!student || !items || items.length === 0) {
            return res.status(400).json({ error: "Please include a student and at least one food item." });
        }

        const totalPrice = await calculateTotalPrice(items);

        const newOrder = new Order({
            student,
            items,
            totalPrice,
            status: 'PLACED'
        });

        const savedOrder = await newOrder.save();

        const populatedOrder = await Order.findById(savedOrder._id)
            .populate('student')
            .populate('items.menuItem');

        res.status(201).json(populatedOrder);
    } catch (err) {
        console.error('Error placing order:', err.message);
        res.status(400).json({ error: err.message });
    }
});

// GET /orders – View all orders (with Pagination)
router.get('/', async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('student')
            .populate('items.menuItem');

        const totalOrders = await Order.countDocuments();

        res.json({
            totalOrders,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalOrders / limit),
            orders
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /orders/:id – View a single specific order
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('student')
            .populate('items.menuItem');

        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(400).json({ error: 'Invalid order ID' });
    }
});

// PATCH /orders/:id/status – Change the status of an order
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatuses = ['PLACED', 'PREPARING', 'DELIVERED', 'CANCELLED'];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('student').populate('items.menuItem');

        if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /orders/:id – Delete an order
router.delete('/:id', async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) return res.status(404).json({ error: 'Order not found' });
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: 'Invalid order ID' });
    }
});

module.exports = router;