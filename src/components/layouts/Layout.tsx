import { ReactNode } from "react";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="relative flex min-h-[calc(100svh-60px)] w-full flex-col bg-(--background)">
      <Header />
      <main className="h-full">{children}</main>
    </div>
  );
}
