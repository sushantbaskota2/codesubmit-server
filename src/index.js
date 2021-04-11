const express = require('express');
require('./db/mongoose');
const app = express();
const userRouter = require('./routers/user');

const courseRouter = require('./routers/course');
const problemRouter = require('./routers/problem');
const submissionRouter = require('./routers/submission');
const cors = require('cors');
app.use(cors({ credentials: true, origin: true }));
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(userRouter);
app.use(problemRouter);
app.use(courseRouter);
app.use(submissionRouter);

app.listen(PORT, () => {
    console.log('Running on Port: ', PORT);
});
