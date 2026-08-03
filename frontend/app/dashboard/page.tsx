import { DashboardStats } from "@/components/dashboard/stats";
import { ContributionChart } from "@/components/dashboard/contribution-chart";
import { TreasuryOverview } from "@/components/dashboard/treasury-overview";
import { UpcomingPayouts } from "@/components/dashboard/upcoming-payouts";
import { ActiveLoans } from "@/components/dashboard/active-loans";
import { ActiveProposals } from "@/components/dashboard/active-proposals";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContributionChart />
        <TreasuryOverview />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingPayouts />
        <ActiveLoans />
      </div>
      <ActiveProposals />
    </div>
  );
}