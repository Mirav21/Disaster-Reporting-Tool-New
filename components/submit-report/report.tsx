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
    <div className="rounded-2xl bg-zinc-900 p-8">
      {currentStep === 1 && <ReportForm onComplete={handleStepComplete} />}
      {currentStep === 2 && (
        <ReportSubmitted data={reportData} onComplete={handleStepComplete} />
      )}
    </div>
  );
}
