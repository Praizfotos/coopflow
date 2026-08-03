import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HandCoins, RotateCcw, Shield, FileText, Bell, BarChart3, Users, Wallet } from "lucide-react";

const features = [
  { icon: HandCoins, title: "Contribution Engine", description: "Support for weekly, biweekly, monthly, quarterly, yearly, and custom contribution cycles with penalty calculations and receipts." },
  { icon: RotateCcw, title: "Rotating Payout", description: "Classic rotating savings with lottery, manual order, priority, random draw, and voting-based payout orders." },
  { icon: Shield, title: "Treasury Management", description: "Built on Soroban smart contracts for secure custody of XLM, classic Stellar assets, and future Soroban tokens." },
  { icon: Shield, title: "Governance", description: "On-chain proposals, voting, spending approval, member management, and cooperative rule modification." },
  { icon: FileText, title: "Loan Module", description: "Member loan requests, committee approval, interest calculation, repayment schedules, and collateral management." },
  { icon: Bell, title: "Multi-Channel Notifications", description: "Email, SMS, Discord, Slack, Telegram, and push notifications for reminders and alerts." },
  { icon: BarChart3, title: "Analytics & Reports", description: "Contribution trends, loan repayment rates, treasury health, financial forecasting, and exportable reports." },
  { icon: Users, title: "Member Management", description: "Role-based access control, identity verification, member analytics, and attendance tracking." },
];

export function Features() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center">Core Features</h2>
        <p className="mt-4 text-center text-muted-foreground max-w-2xl mx-auto">
          Everything you need to run a cooperative finance organization on the Stellar blockchain.
        </p>
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="h-8 w-8 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}