const express = require('express');
const axios = require('axios');
const router = express.Router();
const CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
const CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;
const baseURL = 'https://api.jdoodle.com/v1/execute';

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
        return res.data.output;
    } catch (error) {
        console.log(error);
    }
};

const verifyTestCases = async ({ code, testcases }) => {
    let o = [];
    for (let i = 0; i < testcases.length; i++) {
        let hamroResponse = await runCodeThroughAPI({ code, testcase: testcases[i] });
        console.log(hamroResponse);
        if (hamroResponse.includes('true')) {
            o.push('TRUE');
        } else if (hamroResponse.includes('false')) {
            o.push('FALSE');
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
