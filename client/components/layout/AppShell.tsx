import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import TopNavigation from "./TopNavigation";

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export default function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className={cn("pt-[60px]", className)}>
        <div className="container mx-auto px-4 py-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
