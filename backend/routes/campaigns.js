const express = require("express");
const User = require("../models/User");
const { adminAuth } = require("../middleware/auth");
const { sendCampaignEmail } = require("../utils/email");
const router = express.Router();

// How many customers a campaign would currently reach (admin)
router.get("/subscriber-count", adminAuth, async (req, res) => {
  try {
    const count = await User.countDocuments({
      deletedAt: null,
      unsubscribed: false,
      email: { $ne: "" },
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a marketing email (admin). `test: true` sends only to the admin's own
// email so they can preview it before blasting everyone.
router.post("/send", adminAuth, async (req, res) => {
  try {
    const { subject, message, test } = req.body;
    if (!subject?.trim() || !message?.trim()) {
      return res
        .status(400)
        .json({ error: "Subject and message are required" });
    }

    if (test) {
      await sendCampaignEmail(req.user.email, subject.trim(), message.trim());
      return res.json({ sent: 1, test: true });
    }

    const recipients = await User.find({
      deletedAt: null,
      unsubscribed: false,
      email: { $ne: "" },
    }).select("email _id");
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    res.json({ sent: recipients.length, test: false });

    // Sequential with a small delay - Gmail SMTP throttles/blocks bursts, and
    // this can be a long list, so it runs after the response instead of
    // holding the request open.
    for (const recipient of recipients) {
      await sendCampaignEmail(
        recipient.email,
        subject.trim(),
        message.trim(),
        recipient._id,
        baseUrl,
      );
      await new Promise((r) => setTimeout(r, 400));
    }
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

module.exports = router;
