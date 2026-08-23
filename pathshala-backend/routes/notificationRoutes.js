const express = require('express');
const { protect } = require('../middleware/auth');
const { Notification } = require('../models/Schemas');

const router = express.Router();

// All notification routes are protected
router.use(protect);

// @route GET /api/notifications
// @desc Get notifications for logged-in user
router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter(n => !n.read).length,
      notifications
    });
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/notifications/:id/read
// @desc Mark single notification as read
router.put('/:id/read', async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/notifications/read-all
// @desc Mark all notifications for user as read
router.put('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
