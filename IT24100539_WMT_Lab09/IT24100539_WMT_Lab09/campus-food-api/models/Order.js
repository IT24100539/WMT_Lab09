const mongoose = require('mongoose');

// A separate Schema for Items inside an Order (Sub-document)
const orderItemSchema = new mongoose.Schema(
    {
        menuItem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    },
    {
        _id: false
    }
);

// The main Order Schema
const orderSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    items: {
        type: [orderItemSchema],
        validate: [v => v.length > 0, 'There must be at least one food item.']
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['PLACED', 'PREPARING', 'DELIVERED', 'CANCELLED'],
        default: 'PLACED'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;