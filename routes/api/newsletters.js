const express = require('express');
const router = express.Router();
const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');

const generateId = require('../../utils/uuidGenerator');
const checkClientId = require('../../middleware/checkClientId');
const getNewsletterSubsModel = require('../../models/NewsletterSubs');


// @route   GET api/newsletters/subs/test
// @desc    Tests newsletters/subs route
// @access  Public
router.get('/subs/test', (req, res) => res.json({ msg: 'Newsletter Subs api works' }));

// @route    GET api/newsletters/subs/all
// @desc     Get all newsletter subscriptions
// @access   Public
router.get('/subs/all', async (req, res) => {
    try {
        const NewsletterSubs = getNewsletterSubsModel(req.headers.client_id);
        const ns = await NewsletterSubs.find();

        if (ns.length == 0) {
            return res.status(400).json({ msg: 'No newsletter subscriptions available' });
        }

        res.json(ns);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
});

// @route    POST api/newsletter/subs/create
// @desc     Create Subscription to NewsletterSubs
// @access   Public
router.post(
    '/subs/create',
    check('email', 'Please include a valid email').isEmail(),
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const body = req.body;
        const email = body.email;

        try {
            const NewsletterSubs = getNewsletterSubsModel(req.headers.client_id);
            let ns = await NewsletterSubs.findOne({ email: email });

            if (ns) {
                console.log('Update...')
                ns.modified = Date.now;
                await ns.updateOne({ email: email });
                res.json({ msg: 'Thank you! You have subscribed to our newsletters.' });
            } else {
                ns = new NewsletterSubs({
                    ...body,
                });
                await ns.save();
                res.json({ msg: 'Thank you! You have subscribed to our newsletters.' });
            }
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error : ' + err.message);
        }
    }
);

module.exports = router;