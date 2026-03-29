const express = require('express');
const MenuItem = require('../models/MenuItem');
const router = express.Router();

// POST /menu-items – Add a new Menu Item
router.post('/', async (req, res) => {
    try {
        const menuItem = new MenuItem(req.body);
        const savedItem = await menuItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        console.error('Error creating menu item:', err.message);
        res.status(400).json({ error: err.message });
    }
});

// GET /menu-items – Retrieve the list of all food items
router.get('/', async (req, res) => {
    try {
        const items = await MenuItem.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        console.error('Error fetching menu items:', err.message);
        res.status(500).json({ error: 'Server error while fetching menu items' });
    }
});

// 3. Search Menu Items – Search for food by Name or Category
router.get('/search', async (req, res) => {
    try {
        const { name, category } = req.query;
        let filter = {};

        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }

        if (category) {
            filter.category = category;
        }

        const filteredItems = await MenuItem.find(filter).sort({ name: 1 });
        res.json(filteredItems);
    } catch (err) {
        console.error('Error searching menu items:', err.message);
        res.status(500).json({ error: 'Server error during search' });
    }
});

module.exports = router;