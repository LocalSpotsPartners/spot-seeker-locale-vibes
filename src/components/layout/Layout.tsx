
import { ReactNode } from "react";
import { Navbar } from "./Navbar";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
