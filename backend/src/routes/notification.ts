import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { body, validationResult } from "express-validator";
import * as notificationService from "../services/notificationService";

const router = Router();

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const { memberId, cooperativeId, read } = req.query;
    let query = "SELECT * FROM notifications WHERE 1=1";
    const values: unknown[] = [];
    let index = 1;

    if (memberId) {
      query += ` AND member_id = $${index++}`;
      values.push(memberId);
    }

    if (cooperativeId) {
      query += ` AND cooperative_id = $${index++}`;
      values.push(cooperativeId);
    }

    if (read !== undefined) {
      query += ` AND read = $${index++}`;
      values.push(read === "true");
    }

    query += " ORDER BY created_at DESC";

    const result = await require("../database/connection").pool.query(query, values);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
});

router.put("/:id/read", async (req, res, next) => {
  try {
    await require("../database/connection").pool.query(
      "UPDATE notifications SET read = true WHERE id = $1",
      [req.params.id]
    );
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
});

router.post("/send/contribution-reminder", async (req, res, next) => {
  try {
    const { memberId, cooperativeId, cycleId, amount, asset } = req.body;
    await notificationService.sendContributionReminder(memberId, cooperativeId, cycleId, amount, asset);
    res.json({ success: true, message: "Contribution reminder sent" });
  } catch (error) {
    next(error);
  }
});

router.post("/send/voting-reminder", async (req, res, next) => {
  try {
    const { memberId, cooperativeId, proposalId, title } = req.body;
    await notificationService.sendVotingReminder(memberId, cooperativeId, proposalId, title);
    res.json({ success: true, message: "Voting reminder sent" });
  } catch (error) {
    next(error);
  }
});

router.post("/send/loan-reminder", async (req, res, next) => {
  try {
    const { memberId, cooperativeId, loanId, amount, dueDate } = req.body;
    await notificationService.sendLoanReminder(memberId, cooperativeId, loanId, amount, dueDate);
    res.json({ success: true, message: "Loan reminder sent" });
  } catch (error) {
    next(error);
  }
});

router.post("/send/meeting-reminder", async (req, res, next) => {
  try {
    const { memberId, cooperativeId, meetingTitle, meetingDate } = req.body;
    await notificationService.sendMeetingReminder(memberId, cooperativeId, meetingTitle, meetingDate);
    res.json({ success: true, message: "Meeting reminder sent" });
  } catch (error) {
    next(error);
  }
});

export default router;