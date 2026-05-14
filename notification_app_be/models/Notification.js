const mongoose = require("mongoose");
const Log = require("../../logging_middleware/logger");

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true
    },
    recipientPhone: {
      type: String,
      default: null
    },
    type: {
      type: String,
      enum: ["email", "sms", "both"],
      default: "email"
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "retry"],
      default: "pending"
    },
    retryCount: {
      type: Number,
      default: 0,
      max: 3
    },
    sentAt: {
      type: Date,
      default: null
    },
    failureReason: {
      type: String,
      default: null
    },
    metadata: {
      type: Object,
      default: {}
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Pre-save hook for logging
NotificationSchema.pre("save", async function(next) {
  try {
    if (this.isNew) {
      await Log(
        "backend",
        "info",
        "model",
        `New notification created: ${this.title} for ${this.recipientEmail}`
      );
    } else {
      await Log(
        "backend",
        "info",
        "model",
        `Notification updated: ${this._id} - Status: ${this.status}`
      );
    }
    next();
  } catch (error) {
    await Log(
      "backend",
      "error",
      "model",
      `Error in notification pre-save hook: ${error.message}`
    );
    next();
  }
});

module.exports = mongoose.model("Notification", NotificationSchema);
