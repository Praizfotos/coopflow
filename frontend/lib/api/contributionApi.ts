import apiClient from "./client";
import type { ContributionCycle, ContributionRecord, MemberContributionSummary } from "@/lib/types/contribution";

export const contributionApi = {
  getActiveCycles: async (cooperativeId: string) => {
    const response = await apiClient.get<{ success: boolean; data: ContributionCycle[] }>("/contributions/cycles", {
      params: { cooperativeId },
    });
    return response.data.data;
  },

  getCycle: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: ContributionCycle }>(`/contributions/cycles/${id}`);
    return response.data.data;
  },

  createCycle: async (data: {
    cooperativeId: string;
    cycleType: string;
    amount: number;
    asset: string;
    startDate: string;
    endDate: string;
  }) => {
    const response = await apiClient.post<{ success: boolean; data: ContributionCycle }>("/contributions/cycles", data);
    return response.data.data;
  },

  recordPayment: async (cycleId: string, data: {
    memberId: string;
    amount: number;
    asset: string;
    txHash: string;
  }) => {
    const response = await apiClient.post<{ success: boolean; data: ContributionRecord }>(`/contributions/cycles/${cycleId}/pay`, data);
    return response.data.data;
  },

  getCyclePayments: async (cycleId: string) => {
    const response = await apiClient.get<{ success: boolean; data: ContributionRecord[] }>(`/contributions/cycles/${cycleId}/payments`);
    return response.data.data;
  },

  getMemberSummary: async (memberId: string) => {
    const response = await apiClient.get<{ success: boolean; data: MemberContributionSummary }>(`/contributions/member/${memberId}/summary`);
    return response.data.data;
  },

  calculatePenalty: async (cycleId: string, memberId: string) => {
    const response = await apiClient.get<{ success: boolean; data: { penalty: number } }>(`/contributions/cycles/${cycleId}/penalty`, {
      params: { memberId },
    });
    return response.data.data;
  },

  completeCycle: async (cycleId: string) => {
    const response = await apiClient.post<{ success: boolean; data: ContributionCycle }>(`/contributions/cycles/${cycleId}/complete`);
    return response.data.data;
  },

  sendReminder: async (cycleId: string, memberId: string) => {
    await apiClient.post(`/contributions/cycles/${cycleId}/reminder`, { memberId });
  },
};