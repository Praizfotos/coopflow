import { CooperativeList } from "@/components/cooperative/cooperative-list";
import { CooperativeForm } from "@/components/cooperative/cooperative-form";

export default function CooperativePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Cooperatives</h1>
      <CooperativeForm />
      <CooperativeList />
    </div>
  );
}