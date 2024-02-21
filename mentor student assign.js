const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mentor_student_db', { useNewUrlParser: true, useUnifiedTopology: true });

// Define Mentor schema
const mentorSchema = new mongoose.Schema({
    name: String
});
const Mentor = mongoose.model('Mentor', mentorSchema);

// Define Student schema
const studentSchema = new mongoose.Schema({
    name: String,
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' }
});
const Student = mongoose.model('Student', studentSchema);

// API to create a Mentor
app.post('/mentors', async (req, res) => {
    const { name } = req.body;
    try {
        const mentor = new Mentor({ name });
        await mentor.save();
        res.status(201).json(mentor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API to create a Student
app.post('/students', async (req, res) => {
    const { name } = req.body;
    try {
        const student = new Student({ name });
        await student.save();
        res.status(201).json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API to assign a Student to a Mentor
app.put('/students/:studentId/assign-mentor/:mentorId', async (req, res) => {
    const { studentId, mentorId } = req.params;
    try {
        const student = await Student.findById(studentId);
        const mentor = await Mentor.findById(mentorId);
        if (!student || !mentor) {
            return res.status(404).json({ error: 'Student or Mentor not found' });
        }
        student.mentor = mentorId;
        await student.save();
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API to show all students for a particular mentor
app.get('/mentors/:mentorId/students', async (req, res) => {
    const { mentorId } = req.params;
    try {
        const students = await Student.find({ mentor: mentorId });
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API to show the previously assigned mentor for a particular student
app.get('/students/:studentId/previous-mentor', async (req, res) => {
    const { studentId } = req.params;
    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        const previousMentor = await Mentor.findById(student.mentor);
        res.json(previousMentor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
