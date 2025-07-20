import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "./loading-spinner";
import { MapPin, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProcessingScreenProps {
  progress: number;
  analysisScope: "local" | "national";
}

export const ProcessingScreen = ({
  progress,
  analysisScope,
}: ProcessingScreenProps) => {
  const getStatusMessage = () => {
    if (progress < 5) {
      return "Analyzing your website...";
    } else if (progress < 10) {
      return "Collecting relevant keywords...";
    } else if (progress < 20) {
      return analysisScope === "local"
        ? "Gathering local competitor data..."
        : "Gathering national competitor data...";
    } else if (progress < 30) {
      return "Collecting keyword rankings...";
    } else if (progress < 40) {
      return "Collecting search volume for keywords...";
    } else if (progress < 50) {
      return "Gathering ranking of each keyword for your website...";
    } else if (progress < 70) {
      return "Gathering ranking of each keyword for competitors websites...";
    } else if (progress < 80) {
      return "Analyzing search volume data...";
    } else if (progress < 85) {
      return "Calculating revenue opportunities...";
    } else if (progress < 95) {
      return "Finalizing your SEO report...";
    } else {
      return "Processing your data...";
    }
  };

  return (
    <div className="py-8 flex flex-col items-center justify-center">
      <div className="mb-4">
        <Badge variant="outline" className="flex items-center gap-1">
          {analysisScope === "local" ? (
            <>
              <MapPin className="h-3 w-3" />
              Local Analysis
            </>
          ) : (
            <>
              <Globe className="h-3 w-3" />
              National Analysis
            </>
          )}
        </Badge>
      </div>

      <LoadingSpinner />
      <div className="mt-8 w-full max-w-md">
        <Progress value={progress} className="h-2" />
        <p className="mt-4 text-center text-slate-600">{getStatusMessage()}</p>
        <p className="mt-2 text-center text-sm text-slate-500">
          {analysisScope === "local"
            ? "This may take a few minutes. We're analyzing your website and local competitors to identify SEO opportunities in your area."
            : "This may take a few minutes. We're analyzing your website and national competitors to identify SEO opportunities across the country."}
        </p>
      </div>
    </div>
  );
};
