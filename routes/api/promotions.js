const express = require('express');
const router = express.Router();
const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');

const Promotion = require('../../models/DhanvantariPromotions');

// const promotionId = "dhanvantari-Nov-2023";
// const promotionName = "Dhanvantari Promotions Nov 2023";
// const promotionType = "QR Code Scan";

// @route   GET api/promotions/test
// @desc    Tests promotions route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Promotions Works' }));

// @route   GET api/promotions/all
// @desc    Get all promotions
// @access  Public
router.get('/all', async (req, res) => {
    try {
        const promotions = await Promotion.find()

        if (promotions.length == 0) {
            return res.status(400).json({ msg: 'No promotions Available' });
        }

        res.json(promotions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    POST api/promotion/add
// @desc     Add promotions
// @access   Public
router.post(
    '/saveScanData',
    // check('lessonId', 'lesson Id is required').notEmpty(),
    // check('lessonCategory', 'lessonCategory is required').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const promotionBody = req.body;
        const devicedId = promotionBody.devicedId;

        try {
            let promotion = await Promotion.findOne({ devicedId });

            if (promotion) {
                promotion.frequency = promotion.frequency + 1;
                promotion.save();
                return res.json({ msg: 'Promotion Updated Successfully!' });
            }

            promotion = new Promotion({
                ...promotionBody
            });

            await promotion.save();
            res.json({ msg: 'Promotion Added Successfully!' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

module.exports = router;
