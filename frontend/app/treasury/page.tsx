import { TreasuryBalance } from "@/components/treasury/treasury-balance";
import { DepositForm } from "@/components/treasury/deposit-form";
import { WithdrawalForm } from "@/components/treasury/withdrawal-form";
import { TransactionHistory } from "@/components/treasury/transaction-history";

export default function TreasuryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Treasury</h1>
      <TreasuryBalance />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DepositForm />
        <WithdrawalForm />
      </div>
      <TransactionHistory />
    </div>
  );
}