const { Router } = require('express');
const { saveFeedback } = require('../controllers/feedbackController');

const router = Router();

router.post('/', saveFeedback);

module.exports = router;