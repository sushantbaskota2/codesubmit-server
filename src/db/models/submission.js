const mongoose = require('mongoose');
const validator = require('validator');

const submissionSchema = new mongoose.Schema(
    {
        problemId: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true
        },
        studentId: {
            type: mongoose.SchemaTypes.ObjectId,
            required: true
        },
        submissionCode: {
            type: String,
            required: true
        },
        score: {
            type: Number
        }
    },
    { timestamps: true }
);

const Submission= mongoose.model('Submission', submissionSchema);
module.exports = Submission;

