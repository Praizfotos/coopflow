import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as analyticsService from "../services/analyticsService";

const router = Router();

router.use(authenticate);

router.get("/contribution-trends", async (req, res, next) => {
  try {
    const { cooperativeId, period } = req.query;
    const trends = await analyticsService.getContributionTrends(cooperativeId as string, period as string);
    res.json({ success: true, data: trends });
  } catch (error) {
    next(error);
  }
});

router.get("/loan-repayment-rates", async (req, res, next) => {
  try {
    const { cooperativeId } = req.query;
    const rates = await analyticsService.getLoanRepaymentRates(cooperativeId as string);
    res.json({ success: true, data: rates });
  } catch (error) {
    next(error);
  }
});

router.get("/treasury-health", async (req, res, next) => {
  try {
    const { cooperativeId } = req.query;
    const health = await analyticsService.getTreasuryHealth(cooperativeId as string);
    res.json({ success: true, data: health });
  } catch (error) {
    next(error);
  }
});

router.get("/member-participation", async (req, res, next) => {
  try {
    const { cooperativeId } = req.query;
    const participation = await analyticsService.getMemberParticipation(cooperativeId as string);
    res.json({ success: true, data: participation });
  } catch (error) {
    next(error);
  }
});

router.get("/proposal-participation", async (req, res, next) => {
  try {
    const { cooperativeId } = req.query;
    const participation = await analyticsService.getProposalParticipation(cooperativeId as string);
    res.json({ success: true, data: participation });
  } catch (error) {
    next(error);
  }
});

router.get("/cash-flow", async (req, res, next) => {
  try {
    const { cooperativeId, startDate, endDate } = req.query;
    const cashFlow = await analyticsService.getCashFlow(cooperativeId as string, startDate as string, endDate as string);
    res.json({ success: true, data: cashFlow });
  } catch (error) {
    next(error);
  }
});

router.get("/forecasting", async (req, res, next) => {
  try {
    const { cooperativeId } = req.query;
    const forecasting = await analyticsService.getFinancialForecasting(cooperativeId as string);
    res.json({ success: true, data: forecasting });
  } catch (error) {
    next(error);
  }
});

router.get("/dashboard", async (req, res, next) => {
  try {
    const { cooperativeId } = req.query;
    const stats = await analyticsService.getDashboardStats(cooperativeId as string);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

export const analytics = router;