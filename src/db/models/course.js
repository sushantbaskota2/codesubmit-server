const mongoose = require('mongoose');
const validator = require('validator');

const courseSchema = new mongoose.Schema({
    courseID: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    }
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
