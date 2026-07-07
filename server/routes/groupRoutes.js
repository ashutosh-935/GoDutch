const express = require('express');
const { createGroup, getGroup } = require('../controllers/groupController');
const router = express.Router();

router.post('/', createGroup);
router.get('/:groupId', getGroup);

module.exports = router;
