import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { UserManagement } from "@/components/admin/user-management";
import { SystemLogs } from "@/components/admin/system-logs";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin</h1>
      <AdminDashboard />
      <UserManagement />
      <SystemLogs />
    </div>
  );
}