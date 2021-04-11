const express = require('express');
const axios = require('axios');
const Submission = require('../db/models/submission');
const User = require('../db/models/user');
const Problem = require('../db/models/problem');
const Course = require('../db/models/course');
const router = express.Router();
const auth = require('../middleware/auth');
const CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
const CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;
const baseURL = 'https://api.jdoodle.com/v1/execute';

router.get('/instructor/submissions', auth, async (req, res) => {
    const problems = await Problem.find({ author: req.user._id });
    let submissions = [];
    for (let i = 0; i < problems.length; i++) {
        const submission = await Submission.find({ problemId: problems[i]._id });
        const submissionInfo = [];
        for (const a of submission) {
            const user = await User.findById(a.studentId);
            const course = await Course.findById(problems[i].courseID);
            submissionInfo.push({
                name: user.name,
                problemName: problems[i].title,
                courseID: course.courseID,
                ...a._doc
            });
        }
        submissions.push(...submissionInfo);
    }
    res.send(submissions);
});

router.post('/solve', async (req, res) => {
    const { studentCode, testcases } = req.body;

    try {
        const verified = await verifyTestCases({ code: studentCode, testcases });
        res.send(verified);
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});

router.post('/submissions', async (req, res) => {
    const { problemId, score, studentId, submissionCode } = req.body;

    const submission = new Submission({ problemId, studentId, submissionCode, score });
    try {
        await submission.save();
        res.send(submission);
    } catch (e) {
        console.log(e);
        res.send(e);
    }
});

router.get('/submissions', async (req, res) => {
    try {
        const submissions = await Submission.find({});
        const submissionRef = [];
        for (let i = 0; i < submissions.length; i++) {
            const problem = await Problem.findById(submissions[i].problemId);
            submissionRef.push({ score: submissions[i].score, title: problem.title });
        }
        res.send(submissionRef);
    } catch (error) {
        res.send(error);
    }
});

router.get('/submissions/student', auth, async (req, res) => {
    try {
        const submissions = await Submission.find({ studentId: req.user._id });
        let submissionInfo = [];
        for (a of submissions) {
            const problem = await Problem.findById(a.problemId);
            const course = await Course.findById(problem.courseID);
            submissionInfo.push({
                ...a._doc,
                title: problem.title,
                courseID: course.courseID
            });
        }
        res.send(submissionInfo);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

let code = `
const student = (input)=>{
    return input.split('').reverse().join('');
}
const instructor = (input, output)=>{
    return student(input)==output;
}


`;

const runCodeThroughAPI = async ({ code, testcase }) => {
    console.log(code);
    let coder =
        code +
        ` 
    console.log(instructor("${testcase.input}", "${testcase.output}")); `;

    console.log(coder);
    try {
        let res = await axios.post(baseURL, {
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            script: coder,
            language: 'nodejs',
            versionIndex: '3',
            stdin: ''
        });
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

const verifyTestCases = async ({ code, testcases }) => {
    let o = [];
    for (let i = 0; i < testcases.length; i++) {
        let hamroResponse = await runCodeThroughAPI({ code, testcase: testcases[i] });
        console.log(hamroResponse);
        if (hamroResponse.output.includes('true')) {
            o.push({ status: 'TRUE', res: hamroResponse });
        } else if (hamroResponse.output.includes('false')) {
            o.push({ status: 'FALSE', res: hamroResponse });
        } else {
            o.push(hamroResponse);
        }
    }
    console.log(o);
    return o;
};

let testcases = [
    {
        input: 'heronepali',
        output: 'ilapenoreh'
    },
    {
        input: 'racecar',
        output: 'racecar'
    },
    {
        input: 'ladokha',
        output: 'khadinaja'
    }
];

module.exports = router;
