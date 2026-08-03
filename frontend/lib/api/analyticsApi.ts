import apiClient from "./client";
import type {
  ContributionTrend,
  LoanRepaymentRate,
  TreasuryHealth,
  MemberParticipation,
  DashboardStats,
} from "@/lib/types/analytics";

export const analyticsApi = {
  getContributionTrends: async (cooperativeId: string, period?: string) => {
    const response = await apiClient.get<{ success: boolean; data: ContributionTrend[] }>("/analytics/contribution-trends", {
      params: { cooperativeId, period },
    });
    return response.data.data;
  },

  getLoanRepaymentRates: async (cooperativeId: string) => {
    const response = await apiClient.get<{ success: boolean; data: LoanRepaymentRate[] }>("/analytics/loan-repayment-rates", {
      params: { cooperativeId },
    });
    return response.data.data;
  },

  getTreasuryHealth: async (cooperativeId: string) => {
    const response = await apiClient.get<{ success: boolean; data: TreasuryHealth[] }>("/analytics/treasury-health", {
      params: { cooperativeId },
    });
    return response.data.data;
  },

  getMemberParticipation: async (cooperativeId: string) => {
    const response = await apiClient.get<{ success: boolean; data: MemberParticipation[] }>("/analytics/member-participation", {
      params: { cooperativeId },
    });
    return response.data.data;
  },

  getDashboardStats: async (cooperativeId: string) => {
    const response = await apiClient.get<{ success: boolean; data: DashboardStats }>("/analytics/dashboard", {
      params: { cooperativeId },
    });
    return response.data.data;
  },

  getCashFlow: async (cooperativeId: string, startDate: string, endDate: string) => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>("/analytics/cash-flow", {
      params: { cooperativeId, startDate, endDate },
    });
    return response.data.data;
  },

  getForecasting: async (cooperativeId: string) => {
    const response = await apiClient.get<{ success: boolean; data: any }>("/analytics/forecasting", {
      params: { cooperativeId },
    });
    return response.data.data;
  },
};