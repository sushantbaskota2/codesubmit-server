const mongoose = require('mongoose');
const validator = require('validator');

const problemSchema = new mongoose.Schema({
    courseID: {
        type: mongoose.SchemaTypes.ObjectId
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    author: {
        type: mongoose.SchemaTypes.ObjectId
    },
    testcases: [
        {
            input: {
                type: String
            },
            output: {
                type: String
            }
        }
    ],
    assign: {
        type: mongoose.SchemaTypes.Boolean
    },
    starterCode: {
        type: String
    }
});

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;
