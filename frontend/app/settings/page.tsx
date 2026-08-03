import { SettingsForm } from "@/components/settings/settings-form";
import { ApiKeyManager } from "@/components/settings/api-key-manager";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <SettingsForm />
      <ApiKeyManager />
    </div>
  );
}