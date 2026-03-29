require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const studentRoutes = require('./routes/students');
const menuItemRoutes = require('./routes/menuItems');
const orderRoutes = require('./routes/orders');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root Route
app.get('/', (req, res) => {
    res.json({ message: "Campus Food Ordering API is running successfully!" });
});

// Routes
app.use('/students', studentRoutes);
app.use('/menu-items', menuItemRoutes);
app.use('/orders', orderRoutes);
app.use('/analytics', analyticsRoutes);

// Connect to MongoDB 
const mongoURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

mongoose.connect(mongoURI)
    .then(() => {
        console.log("Successfully connected to MongoDB Atlas!");
        // Start the server only if the database connection is successful
        app.listen(PORT, () => {
            console.log(`Server started running on port ${PORT}...`);
        });
    })
    .catch(err => {
        console.error("Database connection error:", err);
    });
