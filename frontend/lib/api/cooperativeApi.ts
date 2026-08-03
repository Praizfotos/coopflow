import apiClient from "./client";
import type { Cooperative, Member, Wallet } from "@/lib/types/cooperative";

export const cooperativeApi = {
  getAll: async () => {
    const response = await apiClient.get<{ success: boolean; data: Cooperative[] }>("/cooperatives");
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<{ success: boolean; data: Cooperative }>(`/cooperatives/${id}`);
    return response.data.data;
  },

  create: async (data: { name: string; organizationId: string; description?: string }) => {
    const response = await apiClient.post<{ success: boolean; data: Cooperative }>("/cooperatives", data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Cooperative>) => {
    const response = await apiClient.put<{ success: boolean; data: Cooperative }>(`/cooperatives/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/cooperatives/${id}`);
  },

  getMembers: async (cooperativeId: string) => {
    const response = await apiClient.get<{ success: boolean; data: Member[] }>(`/cooperatives/${cooperativeId}/members`);
    return response.data.data;
  },

  addMember: async (cooperativeId: string, data: {
    name: string;
    email: string;
    walletAddress: string;
    role?: string;
  }) => {
    const response = await apiClient.post<{ success: boolean; data: Member }>(`/cooperatives/${cooperativeId}/members`, data);
    return response.data.data;
  },

  removeMember: async (cooperativeId: string, memberId: string) => {
    await apiClient.delete(`/cooperatives/${cooperativeId}/members/${memberId}`);
  },
};