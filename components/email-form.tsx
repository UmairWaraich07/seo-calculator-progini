"use client";

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
import { useState } from "react";
import { LoadingSpinner } from "./loading-spinner";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

interface EmailFormProps {
  onSubmit: (email: string) => void;
}

export const EmailForm = ({ onSubmit }: EmailFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data.email);
    } catch (error) {
      // Error is handled in the parent component
      console.error("Error in email submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Your SEO Report is Ready!</h3>
        <p className="text-slate-600">
          Enter your email below to receive your detailed SEO opportunity
          report.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="your@email.com"
                    {...field}
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Sending...
              </>
            ) : (
              "Get My SEO Report"
            )}
          </Button>

          <p className="text-xs text-center text-slate-500 mt-4">
            By submitting this form, you agree to receive your SEO report and
            occasional marketing emails. You can unsubscribe at any time.
          </p>
        </form>
      </Form>
    </div>
  );
};
