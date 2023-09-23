const express = require('express');
const router = express.Router();
const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');

const Order = require('../../models/Order');


// @route   GET api/order/test
// @desc    Tests order route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'order Works' }));

// @route   GET api/order/all
// @desc    Get all orders 
// @access  Public
router.get('/all', async (req, res) => {
    try {
        const orders = await Order.find()

        if (orders.length == 0) {
            return res.status(400).json({ msg: 'No orders Available' });
        }

        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    POST api/order/add
// @desc     Add order
// @access   Public
router.post(
    '/create',
    // check('orderId', 'order Id is required').notEmpty(),
    // check('orderCategory', 'orderCategory is required').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const orderBody = req.body;
        const id = orderBody.orderId;

        try {
            let order = await Order.findOne({ orderId: id });

            if (order) {
                return res.status(400).json({ msg: 'order with same Id already exists!' });
            }

            order = new Order({
                ...orderBody
            });

            await order.save();
            res.json({ msg: 'order Added Successfully!', order: order });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

module.exports = router;
