import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

interface StudioLayoutProps {
  children: ReactNode;
}

export default function StudioLayout({ children }: StudioLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/10">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
