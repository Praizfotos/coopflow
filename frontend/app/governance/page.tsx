import { ProposalList } from "@/components/governance/proposal-list";
import { ProposalForm } from "@/components/governance/proposal-form";
import { VoteForm } from "@/components/governance/vote-form";

export default function GovernancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Governance</h1>
      <ProposalForm />
      <ProposalList />
      <VoteForm />
    </div>
  );
}