import express from 'express';

const router = express.Router({ mergeParams: true });
const testRoute = require('./api');
const productRoute = require('./product');
const categoryRoute = require('./category');
const userRoute = require('./user');
const orderRoute = require('./order');


router.use(testRoute);
router.use(productRoute);
router.use(categoryRoute);
router.use(userRoute);
router.use(orderRoute);

module.exports = router;