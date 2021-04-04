const express = require('express');
const router = express.Router();
const User = require('../db/models/user');
const auth = require('../middleware/auth');

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get('/users/me', auth, async (req, res) => {
    try {
        res.send(req.user);
    } catch (e) {
        res.status(404).send(e);
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
});

// Get all users ---DEV ONLY---
router.get('/users', auth, async (req, res) => {
    console.log('aayo');
    try {
        const users = await User.find({});
        if (users.length <= 0) res.status(404).send({ message: 'Could not find any users' });
        res.send(users);
    } catch (error) {
        console.log(error);
        res.send({ message: 'Could not connect to the database' });
    }
});

//Add a user
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

//Get all instructors ---DEV ONLY---
router.get('/users/instructors', async (req, res) => {
    try {
        const users = await User.find({ instructor: true });
        if (users.length <= 0) res.status(404).send({ message: 'Could not find any users' });
        res.send(users);
    } catch (error) {
        res.send({ message: 'Could not connect to the database' });
    }
});

//Get all students --DEV ONLY---
router.get('/users/students', async (req, res) => {
    try {
        const users = await User.find({ instructor: false });
        if (users.length <= 0) res.status(404).send({ message: 'Could not find any users' });
        res.send(users);
    } catch (error) {
        res.send({ message: 'Could not connect to the database' });
    }
});

router.get('/courses/:id/students', async (req, res) => {
    const courseId = req.params.id;
    try {
        const users = await User.find({});
        let filteredUsers = users.filter((user) => user.courses.includes(courseId));
        res.send(filteredUsers);
    } catch (error) {}
});

module.exports = router;
