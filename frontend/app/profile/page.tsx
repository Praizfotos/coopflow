import { ProfileForm } from "@/components/profile/profile-form";
import { WalletConnect } from "@/components/profile/wallet-connect";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <WalletConnect />
      <ProfileForm />
    </div>
  );
}