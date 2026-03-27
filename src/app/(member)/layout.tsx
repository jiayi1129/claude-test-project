import { ReactNode } from "react";
import { MemberNav } from "@/components/layout/MemberNav";

interface MemberLayoutProps {
  children: ReactNode;
}

export default function MemberLayout({ children }: MemberLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <MemberNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
