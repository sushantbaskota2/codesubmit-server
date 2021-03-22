const express = require('express');
const router = express.Router();
const Problem = require('../db/models/problem');
const auth = require('../middleware/auth');
//Add a problem
router.post('/problems', auth, async (req, res) => {
    console.log(req);
    try {
        if (!req.user.instructor) {
            throw new Error('Not an instructor');
        }

        const problem = new Problem({ ...req.body, author: req.user._id });
        await problem.save();
        res.send(problem);
    } catch (e) {
        res.send(e);
    }
});

//Get all problems
router.get('/problems', async (req, res) => {
    try {
        const problems = await Problem.find({});
        res.send(problems);
    } catch (e) {
        res.send(e);
    }
});

router.get('/problems/student', auth, async (req, res) => {
    console.log('wahts ups');
    try {
        let problemsAcc = [];
        let problems;

        for (let i = 0; i < req.user.courses.length; i++) {
            problems = await Problem.find({ courseID: req.user.courses[i] });
            if (problems.length > 0) {
                problemsAcc.push(...problems);
            }
        }

        problemsAcc = problemsAcc.filter((problem) => problem.assign);
        res.send(problemsAcc);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});
//Get all problems from an instructor
router.get('/instructor/problems', auth, async (req, res) => {
    console.log('aayo');
    try {
        const problems = await Problem.find({ author: req.user._id });
        res.send(problems);
    } catch (e) {
        res.send(e);
    }
});

router.get('/problems/problem/:id', async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        res.send(problem);
    } catch (error) {
        res.status(404).send(error);
    }
});

//Get all problems for a course
router.get('/problems/:courseID', async (req, res) => {
    try {
        const problems = await Problem.find({ courseID: req.params.courseID });
        res.send(problems);
    } catch (e) {
        res.send(e);
    }
});

//Update a problem
router.patch('/problems/:id', async (req, res) => {
    try {
        const problem = await Problem.findByIdAndUpdate(req.params.id, { ...req.body });
        await problem.save();
        res.send({ message: 'Changes made.' });
    } catch (error) {
        res.send({ message: 'Error updating' });
    }
});

//Delete a problem
router.delete('/problems/:id', async (req, res) => {
    try {
        await Problem.findByIdAndDelete(req.params.id);
        res.send({ message: 'Successfully deleted' });
    } catch (error) {
        console.log(error);
        res.send({ message: 'Error deleting a problem.' });
    }
});

module.exports = router;
