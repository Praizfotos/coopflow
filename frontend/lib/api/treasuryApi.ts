import apiClient from "./client";
import type { TreasuryBalance, Transaction, WithdrawalRequest } from "@/lib/types/treasury";

export const treasuryApi = {
  getBalance: async (cooperativeId: string, asset: string) => {
    const response = await apiClient.get<{ success: boolean; data: TreasuryBalance }>("/treasury/balance", {
      params: { cooperativeId, asset },
    });
    return response.data.data;
  },

  getAllBalances: async (cooperativeId: string) => {
    const response = await apiClient.get<{ success: boolean; data: TreasuryBalance[] }>("/treasury/balances", {
      params: { cooperativeId },
    });
    return response.data.data;
  },

  deposit: async (data: { cooperativeId: string; amount: number; asset: string; fromAddress: string; txHash: string }) => {
    const response = await apiClient.post<{ success: boolean; data: Transaction }>("/treasury/deposit", data);
    return response.data.data;
  },

  requestWithdrawal: async (data: {
    cooperativeId: string;
    amount: number;
    asset: string;
    toAddress: string;
    reason?: string;
  }) => {
    const response = await apiClient.post<{ success: boolean; data: WithdrawalRequest }>("/treasury/withdrawal", data);
    return response.data.data;
  },

  approveWithdrawal: async (requestId: string) => {
    const response = await apiClient.post<{ success: boolean; data: WithdrawalRequest }>(`/treasury/withdrawal/${requestId}/approve`);
    return response.data.data;
  },

  rejectWithdrawal: async (requestId: string) => {
    const response = await apiClient.post<{ success: boolean; data: WithdrawalRequest }>(`/treasury/withdrawal/${requestId}/reject`);
    return response.data.data;
  },

  executeWithdrawal: async (requestId: string) => {
    const response = await apiClient.post<{ success: boolean; data: WithdrawalRequest }>(`/treasury/withdrawal/${requestId}/execute`);
    return response.data.data;
  },

  getTransactions: async (cooperativeId: string, start?: number, limit?: number) => {
    const response = await apiClient.get<{ success: boolean; data: Transaction[] }>("/treasury/transactions", {
      params: { cooperativeId, start, limit },
    });
    return response.data.data;
  },

  getDeposits: async (cooperativeId: string, start?: number, limit?: number) => {
    const response = await apiClient.get<{ success: boolean; data: Transaction[] }>("/treasury/deposits", {
      params: { cooperativeId, start, limit },
    });
    return response.data.data;
  },
};