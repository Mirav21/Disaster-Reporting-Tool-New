"use-client";

import { useState } from "react";

interface ReportData {
  reportId: string;
}

interface ReportSubmittedProps {
  data: ReportData | null;
  onComplete: (data: ReportData) => void;
}

export function ReportSubmitted({ data, onComplete }: ReportSubmittedProps) {
  const reportId = data?.reportId || "N/A";

  const [copyButtonText, setCopyButtonText] = useState("Copy");

  const copyToClipboard = () => {
    if (reportId !== "N/A") {
      navigator.clipboard.writeText(reportId).then(() => {
        setCopyButtonText("Copied");
        setTimeout(() => {
          setCopyButtonText("Copy");
        }, 2000);
      });
    }
  };

  return (
    <div className="text-center space-y-6">
      <div className="flex flex-col items-center">
        <div className="bg-green-500/10 dark:bg-green-600/10 rounded-full p-3">
          <svg
            className="w-16 h-16 text-green-500 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-xl font-medium text-zinc-900 dark:text-white">
          Report Successfully Submitted
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Your report has been securely transmitted to law enforcement.
        </p>
      </div>
      <div className="bg-zinc-200 dark:bg-zinc-800/50 rounded-lg p-6 max-w-md mx-auto shadow-lg">
        <h4 className="text-zinc-900 dark:text-white font-medium mb-2">
          Your Report ID
        </h4>
        <div className="bg-zinc-300 dark:bg-zinc-900 rounded p-3 flex justify-center items-center">
          <code className="text-sky-500 dark:text-sky-400">{reportId}</code>
          <button
            onClick={copyToClipboard}
            className="ml-4 p-2 bg-sky-500 dark:bg-sky-600 text-white rounded hover:bg-sky-400 dark:hover:bg-sky-500"
            aria-label="Copy Report ID"
          >
            {copyButtonText}
          </button>
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Save this ID to check your report status or communicate securely with
          law enforcement.
        </p>
      </div>

      <div className="pt-4">
        <button
          onClick={() => {
            onComplete(data || { reportId: "unknown" });
            window.location.href = "/";
          }}
          className="inline-flex items-center justify-center rounded-lg bg-sky-500 dark:bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400 dark:hover:bg-sky-500 transition-all"
          aria-label="Return to Home"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
