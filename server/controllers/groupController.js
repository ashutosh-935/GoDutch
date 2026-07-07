const Group = require('../models/Group');
const { nanoid } = require('nanoid');

const createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const groupId = nanoid(8);
    const group = new Group({ name, groupId });
    await group.save();

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findOne({ groupId });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createGroup, getGroup };
