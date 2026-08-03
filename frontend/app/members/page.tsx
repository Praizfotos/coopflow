import { MemberList } from "@/components/members/member-list";
import { MemberForm } from "@/components/members/member-form";

export default function MembersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Members</h1>
      <MemberForm />
      <MemberList />
    </div>
  );
}