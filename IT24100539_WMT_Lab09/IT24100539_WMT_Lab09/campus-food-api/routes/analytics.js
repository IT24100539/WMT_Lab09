const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const router = express.Router();


// 8.1 Total Amount Spent by a Student

router.get('/total-spent/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ error: 'Invalid student ID format' });
        }

        const result = await Order.aggregate([
            { $match: { student: new mongoose.Types.ObjectId(studentId) } },
            {
                $group: {
                    _id: '$student',
                    totalSpent: { $sum: '$totalPrice' }
                }
            }
        ]);

        const totalSpent = result.length > 0 ? result[0].totalSpent : 0;
        res.json({ studentId, totalSpent });
    } catch (err) {
        console.error('Total spent error:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// 8.2 Top Selling Menu Items

router.get('/top-menu-items', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;

        const topItems = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.menuItem',
                    totalQuantity: { $sum: '$items.quantity' }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'menuitems',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'menuItem'
                }
            },
            { $unwind: '$menuItem' }
        ]);

        res.json(topItems);
    } catch (err) {
        console.error('Top items error:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});


// 8.3 Daily Order Counts

router.get('/daily-orders', async (req, res) => {
    try {
        const dailyCounts = await Order.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Grouping by date string
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(dailyCounts);
    } catch (err) {
        console.error('Daily orders error:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;