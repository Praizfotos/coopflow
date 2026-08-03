import { ReportGenerator } from "@/components/reports/report-generator";
import { FinancialStatements } from "@/components/reports/financial-statements";
import { CashFlowReport } from "@/components/reports/cash-flow-report";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      <ReportGenerator />
      <FinancialStatements />
      <CashFlowReport />
    </div>
  );
}