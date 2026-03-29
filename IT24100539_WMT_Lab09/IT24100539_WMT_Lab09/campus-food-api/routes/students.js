const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// 1. POST /students 
router.post('/', async (req, res) => {
    try {
        const student = new Student(req.body);
        const savedStudent = await student.save();
        res.status(201).json(savedStudent);
    } catch (err) {
        console.error('Error creating student:', err.message);
        res.status(400).json({ error: err.message });
    }
});

// 2. GET /students 
router.get('/', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        console.error('Error fetching students:', err.message);
        res.status(500).json({ error: 'Server error while fetching students' });
    }
});

// 3. GET /students/:id 
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (err) {
        console.error('Error fetching student:', err.message);
        res.status(400).json({ error: 'Invalid student ID' });
    }
});

module.exports = router;