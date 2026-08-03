import { InvestmentPoolList } from "@/components/investment/investment-pool-list";
import { InvestmentPoolForm } from "@/components/investment/investment-pool-form";

export default function InvestmentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Investment Pools</h1>
      <InvestmentPoolForm />
      <InvestmentPoolList />
    </div>
  );
}