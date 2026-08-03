import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { body, validationResult } from "express-validator";
import logger from "../utils/logger";
import * as contributionService from "../services/contributionService";

const router = Router();

router.use(authenticate);

router.get("/cycles", async (req, res, next) => {
  try {
    const { cooperativeId } = req.query;
    const cycles = await contributionService.getActiveCycles(cooperativeId as string);
    res.json({ success: true, data: cycles });
  } catch (error) {
    next(error);
  }
});

router.get("/cycles/:id", async (req, res, next) => {
  try {
    const cycle = await contributionService.getCycle(req.params.id);
    if (!cycle) {
      return res.status(404).json({ success: false, error: { message: "Cycle not found", statusCode: 404 } });
    }
    res.json({ success: true, data: cycle });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/cycles",
  [
    body("cooperativeId").isUUID().withMessage("Valid cooperative ID is required"),
    body("cycleType").isIn(["Weekly", "Biweekly", "Monthly", "Quarterly", "Yearly", "Custom"]).withMessage("Invalid cycle type"),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
    body("asset").isLength({ min: 1 }).withMessage("Asset is required"),
    body("startDate").isISO8601().withMessage("Valid start date is required"),
    body("endDate").isISO8601().withMessage("Valid end date is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const cycle = await contributionService.createCycle(req.body);
      res.status(201).json({ success: true, data: cycle });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/cycles/:id/pay",
  [
    body("memberId").isUUID().withMessage("Valid member ID is required"),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
    body("asset").isLength({ min: 1 }).withMessage("Asset is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const payment = await contributionService.recordPayment(req.params.id, req.body);
      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/cycles/:id/payments", async (req, res, next) => {
  try {
    const payments = await contributionService.getCyclePayments(req.params.id);
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
});

router.get("/member/:memberId/summary", async (req, res, next) => {
  try {
    const summary = await contributionService.getMemberSummary(req.params.memberId);
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
});

router.get("/cycles/:id/penalty", async (req, res, next) => {
  try {
    const { memberId } = req.query;
    const penalty = await contributionService.calculatePenalty(req.params.id, memberId as string);
    res.json({ success: true, data: { penalty } });
  } catch (error) {
    next(error);
  }
});

router.post("/cycles/:id/complete", async (req, res, next) => {
  try {
    const cycle = await contributionService.completeCycle(req.params.id);
    res.json({ success: true, data: cycle });
  } catch (error) {
    next(error);
  }
});

router.post("/cycles/:id/reminder", async (req, res, next) => {
  try {
    const { memberId } = req.body;
    await contributionService.sendReminder(req.params.id, memberId);
    res.json({ success: true, message: "Reminder sent" });
  } catch (error) {
    next(error);
  }
});

export default router;