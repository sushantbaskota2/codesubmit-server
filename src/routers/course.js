const express = require('express');
const router = express.Router();
const Course = require('../db/models/course');
const User = require('../db/models/user');
const auth = require('../middleware/auth');
//Get all courses ---DEV ONLY---
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find({});
        if (courses.length <= 0) res.status(404).send({ message: 'No courses found!' });
        res.send(courses);
    } catch (error) {
        res.status(500).send({ message: "Couldn't retrieve data from the database" });
    }
});

router.get('/courses/student', auth, async (req, res) => {
    console.log('aaye');
    try {
        let courses = req.user.courses;
        const coursesResult = [];
        for (let i = 0; i < req.user.courses.length; i++) {
            let course = await Course.findById(req.user.courses[i]);
            coursesResult.push(course);
        }

        res.send(coursesResult);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

//Add courses ---REQUIRED AUTH LATER ---
router.post('/courses', auth, async (req, res) => {
    const course = new Course({ ...req.body, author: req.user._id });
    try {
        if (!req.user.instructor) {
            throw new Error('Students cannot create a course');
        }

        await course.save();
        res.send(course);
    } catch (error) {
        res.status(500).send({ message: 'There was an error adding a course.', error });
    }
});

// Get Courses for instructors ---NEEDS AUTH ---
router.get('/courses/:author', auth, async (req, res) => {
    try {
        if (req.user._id != req.params.author) {
            throw new Error('You cannot access courses that you are not an author of');
        } else {
            const courses = await Course.find({ author: req.user._id });
            // courses.length === 0 ? res.status(404).send({ message: 'No course found' }) : '';
            res.send(courses);
        }
    } catch (error) {
        res.send(error);
    }
});

router.get('/course/:id', async (req, res) => {
    console.log(req.params.id);
    try {
        const courses = await Course.findById(req.params.id);
        res.send(courses);
    } catch (error) {
        res.send(error);
        console.log(error);
    }
});
//Enroll a Student in a course --NEEDS AUTHENTICATION ---

const enrollStudent = async (studentEmail, courseId) => {
    console.log(studentEmail);
    const student = await User.findOne({ email: studentEmail });
    student.courses.addToSet(courseId);
    console.log(student);
    await student.save();
};

router.post('/courses/enroll/:courseId', async (req, res) => {
    try {
        for (let i = 0; i < req.body.studentEmails.length; i++) {
            enrollStudent(req.body.studentEmails[i], req.params.courseId);
        }

        res.send({ message: 'success' });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

router.post('/courses/unenroll/:courseId', async (req, res) => {
    try {
        const user = await User.findById(req.body.studentId);
        user.courses = user.courses.filter((course) => course != req.params.courseId);
        await user.save();
        res.send(user);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

module.exports = router;
