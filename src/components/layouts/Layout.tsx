import { ReactNode } from "react";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="bg-background min-h-svh">
      <Header />
      <main>{children}</main>
    </div>
  );
}
