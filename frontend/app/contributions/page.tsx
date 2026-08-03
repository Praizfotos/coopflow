import { ContributionCycleList } from "@/components/contributions/contribution-cycle-list";
import { ContributionForm } from "@/components/contributions/contribution-form";
import { PaymentForm } from "@/components/contributions/payment-form";

export default function ContributionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Contributions</h1>
      <ContributionForm />
      <ContributionCycleList />
      <PaymentForm />
    </div>
  );
}