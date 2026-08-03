import apiClient from "./client";
import type { Proposal, Vote, GovernanceStats } from "@/lib/types/governance";

export const governanceApi = {
  getAll: async (cooperativeId: string) => {
    const response = await apiClient.get<{ success: boolean; data: Proposal[] }>("/governance/proposals", {
      params: { cooperativeId },
    });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: Proposal }>(`/governance/proposals/${id}`);
    return response.data.data;
  },

  create: async (data: {
    cooperativeId: string;
    title: string;
    description: string;
    type: string;
    requiredApprovalPercent: number;
    metadata?: Record<string, unknown>;
  }) => {
    const response = await apiClient.post<{ success: boolean; data: Proposal }>("/governance/proposals", data);
    return response.data.data;
  },

  vote: async (proposalId: string, vote: boolean, votingPower: number) => {
    const response = await apiClient.post<{ success: boolean; data: Vote }>(`/governance/proposals/${proposalId}/vote`, {
      vote,
      votingPower,
    });
    return response.data.data;
  },

  execute: async (proposalId: string) => {
    const response = await apiClient.post<{ success: boolean; data: Proposal }>(`/governance/proposals/${proposalId}/execute`);
    return response.data.data;
  },

  getVotes: async (proposalId: string) => {
    const response = await apiClient.get<{ success: boolean; data: Vote[] }>(`/governance/proposals/${proposalId}/votes`);
    return response.data.data;
  },

  getStats: async (cooperativeId: string) => {
    const response = await apiClient.get<{ success: boolean; data: GovernanceStats }>("/governance/stats", {
      params: { cooperativeId },
    });
    return response.data.data;
  },
};