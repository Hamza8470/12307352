const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Create notification
router.post("/", notificationController.createNotification);

// Get all notifications
router.get("/", notificationController.getAllNotifications);

// Get notification by ID
router.get("/:id", notificationController.getNotificationById);

// Send notification
router.post("/:id/send", notificationController.sendNotification);

// Retry failed notification
router.post("/:id/retry", notificationController.retryNotification);

// Delete notification
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
