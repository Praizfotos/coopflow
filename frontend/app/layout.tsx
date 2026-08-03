import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CoopFlow - Cooperative Finance Platform",
  description: "Programmable Cooperative Finance Platform powered by Stellar and Soroban",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1">
              <Header />
              <div className="p-6">{children}</div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}