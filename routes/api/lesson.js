const express = require('express');
const router = express.Router();
const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');

const Lesson = require('../../models/Lesson');


// @route   GET api/lesson/test
// @desc    Tests lesson route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'lesson Works' }));

// @route   GET api/lesson/all
// @desc    Get all lessons 
// @access  Public
router.get('/all', async (req, res) => {
    try {
        const lessons = await Lesson.find()

        if (lessons.length == 0) {
            return res.status(400).json({ msg: 'No lessons Available' });
        }

        res.json(lessons);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    POST api/lesson/add
// @desc     Add lesson
// @access   Public
router.post(
    '/add',
    // check('lessonId', 'lesson Id is required').notEmpty(),
    // check('lessonCategory', 'lessonCategory is required').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const lessonBody = req.body;
        const id = lessonBody.lessonId;

        try {
            let lesson = await Lesson.findOne({ lessonId: id });

            if (lesson) {
                return res.status(400).json({ msg: 'lesson with same Id already exists!' });
            }

            lesson = new Lesson({
                ...lessonBody
            });

            await lesson.save();
            res.json({ msg: 'lesson Added Successfully!' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

module.exports = router;
