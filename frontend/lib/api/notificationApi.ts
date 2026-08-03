import apiClient from "./client";
import type { Notification } from "@/lib/types/notification";

export const notificationApi = {
  getAll: async (params?: { memberId?: string; cooperativeId?: string; read?: boolean }) => {
    const response = await apiClient.get<{ success: boolean; data: Notification[] }>("/notifications", { params });
    return response.data.data;
  },

  markAsRead: async (id: string) => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  sendContributionReminder: async (data: {
    memberId: string;
    cooperativeId: string;
    cycleId: string;
    amount: number;
    asset: string;
  }) => {
    await apiClient.post("/notifications/send/contribution-reminder", data);
  },

  sendVotingReminder: async (data: {
    memberId: string;
    cooperativeId: string;
    proposalId: string;
    title: string;
  }) => {
    await apiClient.post("/notifications/send/voting-reminder", data);
  },

  sendLoanReminder: async (data: {
    memberId: string;
    cooperativeId: string;
    loanId: string;
    amount: number;
    dueDate: string;
  }) => {
    await apiClient.post("/notifications/send/loan-reminder", data);
  },

  sendMeetingReminder: async (data: {
    memberId: string;
    cooperativeId: string;
    meetingTitle: string;
    meetingDate: string;
  }) => {
    await apiClient.post("/notifications/send/meeting-reminder", data);
  },
};