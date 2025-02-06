"use client";

import { ReportLayout } from "@/components/submit-report/report";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SubmitReport() {
  const [session, setSession] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const accessToken =
      typeof window !== "undefined" ? localStorage?.getItem("token") : null;
    setSession(accessToken);

    if (!accessToken) {
      router.push("/auth/signin");
    }
  }, [router]);

  if (session === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-pulse text-green-600 dark:text-green-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white dark:bg-black/90 selection:bg-green-500/20 selection:dark:bg-green-500/30 overflow-hidden">
      <div className="fixed inset-0 -z-10 min-h-screen">
        <div className="absolute inset-0 h-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.05),transparent_50%)]" />
        <div className="absolute inset-0 h-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.04),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.06),transparent_70%)]" />
      </div>

      <main className="relative px-0 md:px-6 lg:px-6 pt-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 dark:border-green-400/30 dark:bg-green-400/10 px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Secure Disaster Reporting
            </div>

            <h1 className="mt-4 bg-gradient-to-b from-gray-900 to-gray-900/80 dark:from-white dark:to-white/80 bg-clip-text text-4xl md:text-5xl lg:text-5xl  font-bold tracking-tight text-transparent">
              Submit Report
            </h1>
          </div>

          <div className="dark:bg-black/90 rounded-3xl md:p-6 lg:p-6 mb-10">
            <ReportLayout />
          </div>
        </div>
      </main>
    </div>
  );
}
