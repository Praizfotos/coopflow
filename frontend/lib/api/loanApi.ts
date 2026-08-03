import apiClient from "./client";
import type { Loan, LoanRepayment, MemberLoanSummary } from "@/lib/types/loan";

export const loanApi = {
  getAll: async (filters?: { cooperativeId?: string; status?: string; memberId?: string }) => {
    const response = await apiClient.get<{ success: boolean; data: Loan[] }>("/loans", { params: filters });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: Loan }>(`/loans/${id}`);
    return response.data.data;
  },

  requestLoan: async (data: {
    cooperativeId: string;
    borrowerId: string;
    amount: number;
    asset: string;
    interestRate: number;
    termDays: number;
    collateralAmount?: number;
    collateralAsset?: string;
    reason?: string;
  }) => {
    const response = await apiClient.post<{ success: boolean; data: Loan }>("/loans", data);
    return response.data.data;
  },

  approveLoan: async (id: string, approverId: string) => {
    const response = await apiClient.put<{ success: boolean; data: Loan }>(`/loans/${id}/approve`, { approverId });
    return response.data.data;
  },

  rejectLoan: async (id: string, approverId: string) => {
    const response = await apiClient.put<{ success: boolean; data: Loan }>(`/loans/${id}/reject`, { approverId });
    return response.data.data;
  },

  disburseLoan: async (id: string) => {
    const response = await apiClient.post<{ success: boolean; data: Loan }>(`/loans/${id}/disburse`);
    return response.data.data;
  },

  recordRepayment: async (loanId: string, data: { amount: number; asset: string }) => {
    const response = await apiClient.post<{ success: boolean; data: LoanRepayment }>(`/loans/${loanId}/repay`, data);
    return response.data.data;
  },

  getMemberLoans: async (memberId: string) => {
    const response = await apiClient.get<{ success: boolean; data: Loan[] }>(`/loans/member/${memberId}`);
    return response.data.data;
  },

  getMemberSummary: async (memberId: string) => {
    const response = await apiClient.get<{ success: boolean; data: MemberLoanSummary }>(`/loans/member/${memberId}/summary`);
    return response.data.data;
  },

  markDefaulted: async (id: string) => {
    const response = await apiClient.post<{ success: boolean; data: Loan }>(`/loans/${id}/default`);
    return response.data.data;
  },

  getRepaymentSchedule: async (loanId: string) => {
    const response = await apiClient.get<{ success: boolean; data: LoanRepayment[] }>(`/loans/${loanId}/repayments`);
    return response.data.data;
  },
};