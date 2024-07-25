import express from 'express';

const router = express.Router() 

router.get('/', async (req, res) => {
    try {
        res.status(200).json({ message: 'Server is up and running!' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error!' });
    }
});

module.exports = router;