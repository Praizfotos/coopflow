import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { body, validationResult } from "express-validator";
import logger from "../utils/logger";
import * as treasuryService from "../services/treasuryService";

const router = Router();

router.use(authenticate);

router.get("/balance", async (req, res, next) => {
  try {
    const { cooperativeId, asset } = req.query;
    const balance = await treasuryService.getBalance(cooperativeId as string, asset as string);
    res.json({ success: true, data: balance });
  } catch (error) {
    next(error);
  }
});

router.get("/balances", async (req, res, next) => {
  try {
    const { cooperativeId } = req.query;
    const balances = await treasuryService.getAllBalances(cooperativeId as string);
    res.json({ success: true, data: balances });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/deposit",
  [
    body("cooperativeId").isUUID().withMessage("Valid cooperative ID is required"),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
    body("asset").isLength({ min: 1 }).withMessage("Asset is required"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const deposit = await treasuryService.deposit(req.body);
      res.status(201).json({ success: true, data: deposit });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/withdrawal",
  [
    body("cooperativeId").isUUID().withMessage("Valid cooperative ID is required"),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
    body("asset").isLength({ min: 1 }).withMessage("Asset is required"),
    body("reason").optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const request = await treasuryService.requestWithdrawal(req.body);
      res.status(201).json({ success: true, data: request });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/withdrawal/:id/approve", async (req, res, next) => {
  try {
    const request = await treasuryService.approveWithdrawal(req.params.id, (req as any).user.id);
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
});

router.post("/withdrawal/:id/reject", async (req, res, next) => {
  try {
    const request = await treasuryService.rejectWithdrawal(req.params.id, (req as any).user.id);
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
});

router.post("/withdrawal/:id/execute", async (req, res, next) => {
  try {
    const result = await treasuryService.executeWithdrawal(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get("/transactions", async (req, res, next) => {
  try {
    const { cooperativeId, start, limit } = req.query;
    const transactions = await treasuryService.getTransactionHistory(
      cooperativeId as string,
      parseInt(start as string || "0", 10),
      parseInt(limit as string || "50", 10)
    );
    res.json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
});

router.get("/deposits", async (req, res, next) => {
  try {
    const { cooperativeId, start, limit } = req.query;
    const deposits = await treasuryService.getDepositHistory(
      cooperativeId as string,
      parseInt(start as string || "0", 10),
      parseInt(limit as string || "50", 10)
    );
    res.json({ success: true, data: deposits });
  } catch (error) {
    next(error);
  }
});

export default router;