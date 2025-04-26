import { MainErrorFallback } from "@/components/errors/main";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Loader } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router";
import Layout from "./components/layouts/Layout";
import { SidebarProvider } from "./components/ui/sidebar";

const queryClient = new QueryClient();

export function Providers() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <Loader />
        </div>
      }
    >
      <ErrorBoundary FallbackComponent={MainErrorFallback}>
        <QueryClientProvider client={queryClient}>
          <SidebarProvider>
            <Layout>
              <Outlet />
            </Layout>
          </SidebarProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ErrorBoundary>
    </Suspense>
  );
}
