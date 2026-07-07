const express = require('express');
const { getMembers, addMember, deleteMember } = require('../controllers/memberController');
const router = express.Router();

router.get('/:groupId/members', getMembers);
router.post('/:groupId/members', addMember);
router.delete('/:groupId/members/:memberId', deleteMember);

module.exports = router;
