"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { CompetitorInfo } from "./calculator";
import { LoadingSpinner } from "./loading-spinner";
import { toast } from "./ui/toast";

const formSchema = z.object({
  competitors: z
    .array(z.string().url("Please enter a valid URL").or(z.string().length(0)))
    .min(1),
});

interface CompetitorFormProps {
  onSubmit: (data: CompetitorInfo) => void;
  competitorType: "manual" | "auto";
  analysisScope: "local" | "national";
  businessType: string;
  location: string;
  businessUrl: string;
  initialValues: CompetitorInfo;
  locationCode?: number;
}

export const CompetitorForm = ({
  onSubmit,
  competitorType,
  analysisScope,
  businessType,
  location,
  businessUrl,
  initialValues,
  locationCode,
}: CompetitorFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [autoCompetitors, setAutoCompetitors] = useState<
    Array<{ url: string; name: string; source: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      competitors: initialValues.competitors,
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    // Filter out empty competitor URLs
    const filteredCompetitors = data.competitors.filter(
      (url) => url.trim() !== ""
    );
    onSubmit({ competitors: filteredCompetitors });
  };

  const detectCompetitors = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the appropriate API endpoint based on analysis scope
      const endpoint =
        analysisScope === "local"
          ? "/api/detect-local-competitors"
          : "/api/detect-national-competitors";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessType,
          location,
          businessUrl,
          locationCode,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.error ||
            `Failed to detect competitors: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.competitors && data.competitors.length > 0) {
        setAutoCompetitors(data.competitors);

        // Update form with competitor URLs
        const competitorUrls = data.competitors.map((comp: any) => comp.url);
        form.setValue("competitors", competitorUrls);
      } else {
        setError("No competitors found. Please try entering them manually.");
      }
    } catch (error) {
      console.error("Error detecting competitors:", error);
      setError(
        (error as Error).message ||
          "Failed to detect competitors. Please try entering them manually."
      );
      toast({
        title: "Error",
        description:
          (error as Error).message ||
          "Failed to detect competitors. Please try entering them manually.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-detect competitors if that option was selected
  useEffect(() => {
    if (competitorType === "auto") {
      detectCompetitors();
    }
  }, [competitorType, analysisScope]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">
                {competitorType === "auto"
                  ? "Detected Competitors"
                  : "Enter Your Competitors"}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {analysisScope === "local"
                  ? "Based on your local market in " + location
                  : "Based on national organic search rankings"}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Badge
                variant={analysisScope === "local" ? "default" : "outline"}
                className="flex items-center gap-1"
              >
                <MapPin className="h-3 w-3" />
                Local
              </Badge>
              <Badge
                variant={analysisScope === "national" ? "default" : "outline"}
                className="flex items-center gap-1"
              >
                <Globe className="h-3 w-3" />
                National
              </Badge>
              {competitorType === "auto" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={detectCompetitors}
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : "Re-detect"}
                </Button>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && competitorType === "auto" ? (
            <div className="py-8 flex flex-col items-center justify-center">
              <LoadingSpinner />
              <p className="mt-4 text-sm text-slate-500">
                {analysisScope === "local"
                  ? `Detecting local competitors in ${location}...`
                  : "Detecting national competitors in your industry..."}
              </p>
            </div>
          ) : (
            <>
              {competitorType === "auto" && autoCompetitors.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-lg mb-4">
                  <h4 className="text-sm font-medium mb-2">
                    Detected Competitors
                  </h4>
                  <ul className="space-y-2">
                    {autoCompetitors.map((competitor, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-1">
                          <p className="font-medium">{competitor.name}</p>
                          <p className="text-sm text-slate-500">
                            {competitor.url}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {competitor.source}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {[0, 1, 2].map((index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`competitors.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Competitor {index + 1} URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://competitor.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          Continue
        </Button>
      </form>
    </Form>
  );
};
