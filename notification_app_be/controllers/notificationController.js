const Notification = require("../models/Notification");
const Log = require("../../logging_middleware/logger");

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { title, message, recipientEmail, recipientPhone, type } = req.body;

    // Validation
    if (!title || !message || !recipientEmail) {
      await Log(
        "backend",
        "warn",
        "controller",
        "Missing required fields in notification creation"
      );
      return res.status(400).json({
        success: false,
        message: "Title, message, and recipientEmail are required"
      });
    }

    const notification = new Notification({
      title,
      message,
      recipientEmail,
      recipientPhone: recipientPhone || null,
      type: type || "email",
      status: "pending"
    });

    await notification.save();

    await Log(
      "backend",
      "info",
      "controller",
      `Notification created successfully: ${notification._id}`
    );

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification
    });
  } catch (error) {
    await Log(
      "backend",
      "error",
      "controller",
      `Error creating notification: ${error.message}`
    );
    res.status(500).json({
      success: false,
      message: "Error creating notification",
      error: error.message
    });
  }
};

// Get all notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });

    await Log(
      "backend",
      "info",
      "controller",
      `Retrieved ${notifications.length} notifications`
    );

    res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    await Log(
      "backend",
      "error",
      "controller",
      `Error fetching notifications: ${error.message}`
    );
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message
    });
  }
};

// Get notification by ID
exports.getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      await Log(
        "backend",
        "warn",
        "controller",
        `Notification not found: ${id}`
      );
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    await Log(
      "backend",
      "info",
      "controller",
      `Retrieved notification: ${id}`
    );

    res.status(200).json({
      success: true,
      message: "Notification retrieved successfully",
      data: notification
    });
  } catch (error) {
    await Log(
      "backend",
      "error",
      "controller",
      `Error fetching notification: ${error.message}`
    );
    res.status(500).json({
      success: false,
      message: "Error fetching notification",
      error: error.message
    });
  }
};

// Send notification (simulate email/SMS)
exports.sendNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      await Log(
        "backend",
        "warn",
        "controller",
        `Cannot send notification - not found: ${id}`
      );
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    if (notification.status !== "pending") {
      await Log(
        "backend",
        "warn",
        "controller",
        `Cannot send notification - already sent: ${id}`
      );
      return res.status(400).json({
        success: false,
        message: `Notification is already ${notification.status}`
      });
    }

    // Simulate sending (in real app, integrate with email/SMS provider)
    const sent = simulateSending(notification);

    if (sent) {
      notification.status = "sent";
      notification.sentAt = new Date();
      await notification.save();

      await Log(
        "backend",
        "info",
        "controller",
        `Notification sent successfully: ${notification._id} to ${notification.recipientEmail}`
      );

      res.status(200).json({
        success: true,
        message: "Notification sent successfully",
        data: notification
      });
    } else {
      notification.status = "failed";
      notification.failureReason = "Simulated delivery failure";
      notification.retryCount += 1;
      await notification.save();

      await Log(
        "backend",
        "warn",
        "controller",
        `Notification delivery failed: ${notification._id}, Retry count: ${notification.retryCount}`
      );

      res.status(500).json({
        success: false,
        message: "Notification delivery failed",
        data: notification
      });
    }
  } catch (error) {
    await Log(
      "backend",
      "error",
      "controller",
      `Error sending notification: ${error.message}`
    );
    res.status(500).json({
      success: false,
      message: "Error sending notification",
      error: error.message
    });
  }
};

// Retry failed notification
exports.retryNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    if (notification.retryCount >= 3) {
      await Log(
        "backend",
        "error",
        "controller",
        `Max retry attempts reached for notification: ${id}`
      );
      return res.status(400).json({
        success: false,
        message: "Max retry attempts reached",
        data: notification
      });
    }

    notification.status = "retry";
    notification.retryCount += 1;
    await notification.save();

    await Log(
      "backend",
      "info",
      "controller",
      `Retry initiated for notification: ${id}, Attempt: ${notification.retryCount}`
    );

    res.status(200).json({
      success: true,
      message: "Retry initiated",
      data: notification
    });
  } catch (error) {
    await Log(
      "backend",
      "error",
      "controller",
      `Error retrying notification: ${error.message}`
    );
    res.status(500).json({
      success: false,
      message: "Error retrying notification",
      error: error.message
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      await Log(
        "backend",
        "warn",
        "controller",
        `Cannot delete notification - not found: ${id}`
      );
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    await Log(
      "backend",
      "info",
      "controller",
      `Notification deleted: ${id}`
    );

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      data: notification
    });
  } catch (error) {
    await Log(
      "backend",
      "error",
      "controller",
      `Error deleting notification: ${error.message}`
    );
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
      error: error.message
    });
  }
};

// Helper function to simulate sending
function simulateSending(notification) {
  // 80% success rate for demo
  const success = Math.random() < 0.8;
  console.log(
    `[SIMULATION] Sending ${notification.type} to ${notification.recipientEmail}: ${success ? "SUCCESS" : "FAILED"}`
  );
  return success;
}
