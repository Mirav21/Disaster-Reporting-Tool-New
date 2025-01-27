"use client";

import { useState } from "react";
import { ReportForm } from "./reportForm";
import { ReportSubmitted } from "./ReportFormCompleted";

interface ReportData {
  reportId: string;
}

export function ReportLayout() {
  const [currentStep, setCurrentStep] = useState(1);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const handleStepComplete = async (data: ReportData) => {
    setReportData((prevData) => ({ ...prevData, ...data }));

    if (currentStep === 4) {
      return;
    }

    setCurrentStep((prev) => prev + 1);
  };

  return (
    <div className="rounded-2xl bg-gray-100 dark:bg-zinc-800 border border-gray-200/50 dark:border-white/5 p-6 md:p-8 lg:p-8 shadow-lg transition-all duration-300">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        {currentStep === 1 ? "Submit Your Report" : "Report Submitted"}
      </h2>

      {currentStep === 1 && <ReportForm onComplete={handleStepComplete} />}
      {currentStep === 2 && (
        <ReportSubmitted data={reportData} onComplete={handleStepComplete} />
      )}
    </div>
  );
}
