import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as eventIndexerService from "../services/eventIndexerService";

const router = Router();

router.use(authenticate);

router.post("/sync", async (req, res, next) => {
  try {
    const { cooperativeId, accountId } = req.body;
    const result = await eventIndexerService.syncFromHorizon(cooperativeId, accountId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get("/transactions", async (req, res, next) => {
  try {
    const { cooperativeId, start, limit } = req.query;
    const transactions = await eventIndexerService.getIndexedTransactions(
      cooperativeId as string,
      parseInt(start as string || "0", 10),
      parseInt(limit as string || "50", 10)
    );
    res.json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
});

export default router;