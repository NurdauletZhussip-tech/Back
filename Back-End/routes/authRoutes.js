const router = require('express').Router();
const { registerParent, loginParent } = require('../controllers/authController');

router.post('/register', registerParent);
router.post('/login', loginParent);

module.exports = router;