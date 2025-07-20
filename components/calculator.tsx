"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { BasicInfoForm } from "@/components/basic-info-form";
import { CompetitorForm } from "@/components/competitor-form";
import { EmailForm } from "@/components/email-form";
import { ProcessingScreen } from "@/components/processing-screen";
import { Progress } from "@/components/ui/progress";
import { toast } from "./ui/toast";

type CalculatorStep = "basic-info" | "competitors" | "processing" | "email";

export type BasicInfo = {
  businessUrl: string;
  businessType: string;
  location: string;
  customerValue: number;
  competitorType: "manual" | "auto";
  analysisScope: "local" | "national";
  locationCode?: number;
};

export type CompetitorInfo = {
  competitors: string[];
};

export const Calculator = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CalculatorStep>("basic-info");
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    businessUrl: "",
    businessType: "",
    location: "",
    customerValue: 0,
    competitorType: "auto",
    analysisScope: "local",
    locationCode: 2840, // Default to US
  });
  console.log("Basic Info:", basicInfo);
  const [competitorInfo, setCompetitorInfo] = useState<CompetitorInfo>({
    competitors: ["", "", ""],
  });
  const [reportId, setReportId] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] =
    useState<string>("initializing");

  const handleBasicInfoSubmit = async (data: BasicInfo) => {
    setBasicInfo(data);
    setCurrentStep("competitors");
  };

  const handleCompetitorSubmit = async (data: CompetitorInfo) => {
    setCompetitorInfo(data);
    setCurrentStep("processing");
    setProgress(0);
    setProcessingStage("initializing");

    // Start the progress simulation immediately
    let isApiCompleted = false;
    let progressInterval: NodeJS.Timeout | null = null;

    const startProgressSimulation = () => {
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          // If API is done, go to 100%
          if (isApiCompleted) {
            if (progressInterval) clearInterval(progressInterval);
            return 100;
          }
          // Otherwise progress up to 95%
          if (prev >= 95) {
            return 95; // Hold at 95% until API completes
          }
          return prev + 5;
        });
      }, 3000); // runs every 3 seconds
    };

    // Start the simulation immediately
    startProgressSimulation();

    // Process the API request concurrently
    try {
      const response = await fetch("/api/process-seo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          basicInfo,
          competitorInfo: data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to process SEO data");
      }

      const result = await response.json();
      setReportId(result.reportId);

      // API request completed successfully
      isApiCompleted = true;

      // If progress simulation is still running at 95%, move to 100%
      setProgress(100);
      if (progressInterval) clearInterval(progressInterval);
      setCurrentStep("email");
    } catch (error) {
      console.error("Error processing SEO data:", error);
      if (progressInterval) clearInterval(progressInterval); // Stop progress simulation

      toast({
        title: "Error",
        description:
          (error as Error).message ||
          "An error occurred while processing your data. Please try again.",
        variant: "destructive",
      });

      // Reset to competitor step
      setCurrentStep("competitors");
    }
  };

  // When progress reaches 100%, move to the email step
  useEffect(() => {
    if (progress === 100 && currentStep === "processing") {
      setCurrentStep("email");
    }
  }, [progress, currentStep]);

  const handleEmailSubmit = async (email: string) => {
    try {
      const response = await fetch("/api/send-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          reportId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || "Failed to send report");
      }

      // Redirect to thank you page
      router.push(`/thank-you?reportId=${reportId}`);
    } catch (error) {
      console.error("Error sending report:", error);
      toast({
        title: "Error",
        description:
          (error as Error).message ||
          "An error occurred while sending your report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">
            Step{" "}
            {currentStep === "basic-info"
              ? "1"
              : currentStep === "competitors"
              ? "2"
              : currentStep === "processing"
              ? "3"
              : "4"}{" "}
            of 4
          </span>
          <span className="text-sm font-medium">
            {currentStep === "basic-info"
              ? "Business Information"
              : currentStep === "competitors"
              ? "Competitors"
              : currentStep === "processing"
              ? "Processing"
              : "Get Your Report"}
          </span>
        </div>
        <Progress
          value={
            currentStep === "basic-info"
              ? 25
              : currentStep === "competitors"
              ? 50
              : currentStep === "processing"
              ? 50 + progress / 2
              : 100
          }
          className="h-2"
        />
      </div>

      {currentStep === "basic-info" && (
        <BasicInfoForm onSubmit={handleBasicInfoSubmit} />
      )}

      {currentStep === "competitors" && (
        <CompetitorForm
          onSubmit={handleCompetitorSubmit}
          competitorType={basicInfo.competitorType}
          analysisScope={basicInfo.analysisScope}
          businessType={basicInfo.businessType}
          location={basicInfo.location}
          businessUrl={basicInfo.businessUrl}
          initialValues={competitorInfo}
          locationCode={basicInfo.locationCode}
        />
      )}

      {currentStep === "processing" && (
        <ProcessingScreen
          progress={progress}
          analysisScope={basicInfo.analysisScope}
        />
      )}

      {currentStep === "email" && <EmailForm onSubmit={handleEmailSubmit} />}
    </Card>
  );
};
