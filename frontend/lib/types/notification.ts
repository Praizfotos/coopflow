export interface Notification {
  id: string;
  memberId: string;
  cooperativeId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}