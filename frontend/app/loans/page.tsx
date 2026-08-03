import { LoanList } from "@/components/loans/loan-list";
import { LoanForm } from "@/components/loans/loan-form";
import { LoanRepaymentForm } from "@/components/loans/loan-repayment-form";

export default function LoansPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Loans</h1>
      <LoanForm />
      <LoanList />
      <LoanRepaymentForm />
    </div>
  );
}