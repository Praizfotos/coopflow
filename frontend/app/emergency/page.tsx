import { EmergencyFundOverview } from "@/components/emergency/emergency-fund-overview";
import { EmergencyFundForm } from "@/components/emergency/emergency-fund-form";
import { EmergencyWithdrawalForm } from "@/components/emergency/emergency-withdrawal-form";

export default function EmergencyFundPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Emergency Fund</h1>
      <EmergencyFundOverview />
      <EmergencyFundForm />
      <EmergencyWithdrawalForm />
    </div>
  );
}