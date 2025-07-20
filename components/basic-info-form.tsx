"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LocationSelector } from "./location-selector";
import type { BasicInfo } from "./calculator";
import { useState, useEffect } from "react";

// Update the form schema to properly validate location based on analysis scope
const formSchema = z
  .object({
    businessUrl: z.string().url("Please enter a valid URL"),
    businessType: z.string().min(2, "Please enter your business type"),
    location: z.string(),
    customerValue: z.coerce.number().positive("Please enter a positive value"),
    competitorType: z.enum(["manual", "auto"]),
    analysisScope: z.enum(["local", "national"]),
  })
  .refine(
    (data) => {
      // If analysis scope is local, location must be provided
      if (data.analysisScope === "local") {
        return data.location.length >= 2;
      }
      return true;
    },
    {
      message: "Location is required for local analysis",
      path: ["location"],
    }
  );

interface BasicInfoFormProps {
  onSubmit: (data: BasicInfo & { locationCode?: number }) => void;
}

export const BasicInfoForm = ({ onSubmit }: BasicInfoFormProps) => {
  const [locationCode, setLocationCode] = useState<number | undefined>(
    undefined
  );
  const [isNationalScope, setIsNationalScope] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessUrl: "",
      businessType: "",
      location: "",
      customerValue: 0,
      competitorType: "auto",
      analysisScope: "local",
    },
  });

  // Watch for changes to analysisScope
  const analysisScope = form.watch("analysisScope");

  // Update isNationalScope when analysisScope changes
  useEffect(() => {
    setIsNationalScope(analysisScope === "national");

    // If switching to national, set location code to US (2840)
    if (analysisScope === "national") {
      setLocationCode(2840);
      // If there's a location value, keep it, otherwise set to "United States"
      const currentLocation = form.getValues("location");
      if (!currentLocation) {
        form.setValue("location", "United States");
      }
    }
  }, [analysisScope, form]);

  // In the handleSubmit function, ensure location is always provided
  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    // Additional validation for local analysis
    if (
      data.analysisScope === "local" &&
      (!data.location || data.location.length < 2)
    ) {
      form.setError("location", {
        type: "manual",
        message: "Location is required for local analysis",
      });
      return;
    }

    // For national analysis, ensure location is set to at least "United States"
    const finalData = {
      ...data,
      // Ensure location is always a string (never undefined)
      location:
        data.location ||
        (data.analysisScope === "national" ? "United States" : ""),
      locationCode,
    };

    onSubmit(finalData);
  };

  // Update the handleLocationChange function to store the location value directly
  const handleLocationChange = (value: string, code?: number) => {
    console.log(
      `Location changed to: ${value}${code ? ` (code: ${code})` : ""}`
    );
    // Store just the city or state name in the form value
    form.setValue("location", value);
    if (code) {
      setLocationCode(code);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="businessUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Website URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://yourwebsite.com"
                    {...field}
                    onChange={(e) => {
                      let value = e.target.value;

                      // Only add https:// if:
                      // 1. The value is not empty
                      // 2. The value doesn't already contain "://" (either http:// or https://)
                      // 3. The user isn't in the process of deleting (value length is increasing)
                      if (
                        value &&
                        !value.includes("://") &&
                        value.length > (field.value?.length || 0)
                      ) {
                        value = `https://${value}`;
                      }

                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Type</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Roofing, Home Improvement, Plumbing"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="analysisScope"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Analysis Scope</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Choose between local or national competitor analysis
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm ${
                        field.value === "local"
                          ? "font-medium text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      Local
                    </span>
                    <FormControl>
                      <Switch
                        checked={field.value === "national"}
                        onCheckedChange={(checked) => {
                          field.onChange(checked ? "national" : "local");
                        }}
                      />
                    </FormControl>
                    <span
                      className={`text-sm ${
                        field.value === "national"
                          ? "font-medium text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      National
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                          >
                            <HelpCircle className="h-4 w-4" />
                            <span className="sr-only">Analysis scope info</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>
                            <strong>Local:</strong> Analyzes competitors in your
                            specific location using Google Maps data.
                          </p>
                          <p className="mt-1">
                            <strong>National:</strong> Analyzes top organic
                            competitors nationwide using DataForSEO data.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Primary Location
                  {!isNationalScope && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </FormLabel>
                <FormControl>
                  <LocationSelector
                    value={field.value}
                    onChange={handleLocationChange}
                    isNationalScope={isNationalScope}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Average Customer Value ($)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 5000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="competitorType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Competitor Selection</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="auto" id="auto" />
                      <Label htmlFor="auto">
                        Auto-detect competitors
                        {form.watch("analysisScope") === "local"
                          ? " from Google Maps"
                          : " from DataForSEO"}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="manual" />
                      <Label htmlFor="manual">Manually enter competitors</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </Form>
  );
};
