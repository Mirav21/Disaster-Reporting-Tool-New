"use client";

import { ReportTracker } from "@/components/submit-report/ReportTracker";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TrackReportPage() {
  const router = useRouter();

  useEffect(() => {
    const accessToken =
      typeof window !== "undefined" ? localStorage?.getItem("token") : null;

    if (!accessToken) {
      router.push("/auth/signin");
    }
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
        <div className="w-full max-w-5xl">
          <ReportTracker />
        </div>
      </div>
    </div>
  );
}
