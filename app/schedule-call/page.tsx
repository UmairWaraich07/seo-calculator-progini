import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Phone } from "lucide-react";

export default function ScheduleCallPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <main className="py-12">
        <div className="container px-4 mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
              Schedule a Free SEO Consultation
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-4">
              Let's discuss your SEO report and how Progini AI can help you
              achieve your business goals.
            </p>
            <p className="text-sm text-blue-400">
              Powered by Progini AI's expert team
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 bg-[#111111] border-gray-800">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Calendar className="h-6 w-6 text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-medium text-lg text-white">
                      Choose a Date & Time
                    </h3>
                    <p className="text-gray-400">
                      Select a convenient time for your 30-minute consultation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-medium text-lg text-white">
                      Expert Consultation
                    </h3>
                    <p className="text-gray-400">
                      Speak with a Progini AI SEO specialist who will analyze
                      your report and provide actionable insights.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-medium text-lg text-white">
                      Quick Response
                    </h3>
                    <p className="text-gray-400">
                      We'll confirm your appointment within 24 hours.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-[#111111] border-gray-800">
              <h2 className="text-2xl font-bold mb-6 text-white">
                Available Time Slots
              </h2>

              <div className="space-y-4">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
                  (day) => (
                    <div key={day} className="border-b pb-4 border-gray-800">
                      <h3 className="font-medium mb-2 text-white">{day}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"].map(
                          (time) => (
                            <Button
                              key={time}
                              variant="outline"
                              className="justify-start text-gray-300 hover:bg-gray-700 hover:text-white bg-transparent border-gray-700"
                            >
                              {time}
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="mt-6">
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                >
                  <Link href="/contact">Contact Us Directly</Link>
                </Button>
              </div>
            </Card>
          </div>

          {/* Progini AI Branding */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-gray-800 rounded-xl p-6">
              <p className="text-gray-300 mb-4">
                This consultation is part of Progini AI's comprehensive business
                growth services.
              </p>
              <Link
                href="https://progini.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Learn more about Progini AI's 25+ business tools →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
