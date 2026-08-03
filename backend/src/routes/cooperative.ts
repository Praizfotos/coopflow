import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { body, validationResult } from "express-validator";
import logger from "../utils/logger";
import * as cooperativeService from "../services/cooperativeService";

const router = Router();

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const cooperatives = await cooperativeService.getCooperativesForUser(userId);
    res.json({ success: true, data: cooperatives });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const cooperative = await cooperativeService.getCooperative(req.params.id);
    if (!cooperative) {
      return res.status(404).json({ success: false, error: { message: "Cooperative not found", statusCode: 404 } });
    }
    res.json({ success: true, data: cooperative });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  [
    body("name").trim().isLength({ min: 1 }).withMessage("Name is required"),
    body("organizationId").isUUID().withMessage("Valid organization ID is required"),
    body("description").optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const userId = (req as any).user.id;
      const cooperative = await cooperativeService.createCooperative(userId, req.body);
      res.status(201).json({ success: true, data: cooperative });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:id",
  [
    body("name").optional().trim().isLength({ min: 1 }),
    body("description").optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const cooperative = await cooperativeService.updateCooperative(req.params.id, req.body);
      res.json({ success: true, data: cooperative });
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    await cooperativeService.deleteCooperative(req.params.id);
    res.json({ success: true, message: "Cooperative deleted" });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/members", async (req, res, next) => {
  try {
    const members = await cooperativeService.getMembers(req.params.id);
    res.json({ success: true, data: members });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/:id/members",
  [
    body("name").trim().isLength({ min: 1 }).withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("walletAddress").isLength({ min: 56, max: 56 }).withMessage("Valid wallet address is required"),
    body("role").optional().isIn(["Founder", "Administrator", "Treasurer", "Secretary", "Auditor", "Member"]),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const member = await cooperativeService.addMember(req.params.id, req.body);
      res.status(201).json({ success: true, data: member });
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id/members/:memberId", async (req, res, next) => {
  try {
    await cooperativeService.removeMember(req.params.id, req.params.memberId);
    res.json({ success: true, message: "Member removed" });
  } catch (error) {
    next(error);
  }
});

export const cooperative = router;