import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { body, validationResult } from "express-validator";
import logger from "../utils/logger";
import * as loanService from "../services/loanService";

const router = Router();

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const { cooperativeId, status, memberId } = req.query;
    const loans = await loanService.getLoans({
      cooperativeId: cooperativeId as string,
      status: status as string,
      memberId: memberId as string,
    });
    res.json({ success: true, data: loans });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const loan = await loanService.getLoan(req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, error: { message: "Loan not found", statusCode: 404 } });
    }
    res.json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  [
    body("cooperativeId").isUUID().withMessage("Valid cooperative ID is required"),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
    body("asset").isLength({ min: 1 }).withMessage("Asset is required"),
    body("interestRate").isFloat({ min: 0, max: 100 }).withMessage("Interest rate must be between 0 and 100"),
    body("termDays").isInt({ min: 1 }).withMessage("Term days must be a positive integer"),
    body("collateralAmount").optional().isFloat({ min: 0 }),
    body("collateralAsset").optional().isLength({ min: 1 }),
    body("reason").optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const loan = await loanService.requestLoan(req.body);
      res.status(201).json({ success: true, data: loan });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:id/approve",
  [
    body("approverId").isUUID().withMessage("Valid approver ID is required"),
  ],
  async (req, res, next) => {
    try {
      const loan = await loanService.approveLoan(req.params.id, req.body.approverId);
      res.json({ success: true, data: loan });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:id/reject",
  [
    body("approverId").isUUID().withMessage("Valid approver ID is required"),
  ],
  async (req, res, next) => {
    try {
      const loan = await loanService.rejectLoan(req.params.id, req.body.approverId);
      res.json({ success: true, data: loan });
    } catch (error) {
      next(error);
    }
  }
);

router.post("/:id/disburse", async (req, res, next) => {
  try {
    const loan = await loanService.disburseLoan(req.params.id);
    res.json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/:id/repay",
  [
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
    body("asset").isLength({ min: 1 }).withMessage("Asset is required"),
  ],
  async (req, res, next) => {
    try {
      const repayment = await loanService.recordRepayment(req.params.id, req.body);
      res.status(201).json({ success: true, data: repayment });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/member/:memberId", async (req, res, next) => {
  try {
    const loans = await loanService.getMemberLoans(req.params.memberId);
    res.json({ success: true, data: loans });
  } catch (error) {
    next(error);
  }
});

router.get("/member/:memberId/summary", async (req, res, next) => {
  try {
    const summary = await loanService.getMemberLoanSummary(req.params.memberId);
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/default", async (req, res, next) => {
  try {
    const loan = await loanService.markDefaulted(req.params.id);
    res.json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/repayments", async (req, res, next) => {
  try {
    const repayments = await loanService.getRepaymentSchedule(req.params.id);
    res.json({ success: true, data: repayments });
  } catch (error) {
    next(error);
  }
});

export const loan = router;