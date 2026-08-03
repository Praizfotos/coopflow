"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  Wallet,
  HandCoins,
  FileText,
  Shield,
  AlertTriangle,
  PiggyBank,
  TrendingUp,
  Bell,
  Settings,
  User,
  Menu,
  X,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Cooperative", href: "/cooperative", icon: Building2 },
  { name: "Members", href: "/members", icon: Users },
  { name: "Treasury", href: "/treasury", icon: Wallet },
  { name: "Contributions", href: "/contributions", icon: HandCoins },
  { name: "Loans", href: "/loans", icon: FileText },
  { name: "Investment Pools", href: "/investment", icon: TrendingUp },
  { name: "Emergency Fund", href: "/emergency", icon: AlertTriangle },
  { name: "Governance", href: "/governance", icon: Shield },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Admin", href: "/admin", icon: Shield },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background border" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X /> : <Menu />}
      </button>

      <aside className={cn("hidden lg:flex w-64 flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed inset-y-0 left-0 z-40", mobileOpen ? "flex" : "hidden")}>
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="font-bold text-xl">
            CoopFlow
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}