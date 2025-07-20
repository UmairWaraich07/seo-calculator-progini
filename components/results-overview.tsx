import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Globe,
  TrendingUp,
  Users,
  DollarSign,
  Search,
  Target,
} from "lucide-react";

interface ResultsOverviewProps {
  reportData: any;
  basicInfo: any;
}

export const ResultsOverview = ({
  reportData,
  basicInfo,
}: ResultsOverviewProps) => {
  const {
    totalSearchVolume,
    potentialTraffic,
    conversionRate,
    potentialCustomers,
    potentialRevenue,
    currentRankings,
    competitorRankings,
    analysisScope,
  } = reportData;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format large numbers
  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + "K";
    }
    return value.toLocaleString();
  };

  // Prepare data for the rankings chart
  const rankingsData = [
    {
      name: "Your Website",
      top3: currentRankings.top3,
      top10: currentRankings.top10 - currentRankings.top3,
      top50: currentRankings.top50 - currentRankings.top10,
      top100: currentRankings.top100 - currentRankings.top50,
    },
    ...(competitorRankings || []).slice(0, 4).map((competitor: any) => ({
      name:
        competitor.name.length > 15
          ? competitor.name.substring(0, 15) + "..."
          : competitor.name,
      top3: competitor.top3,
      top10: competitor.top10 - competitor.top3,
      top50: competitor.top50 - competitor.top10,
      top100: competitor.top100 - competitor.top50,
      source: competitor.source,
    })),
  ];

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            SEO Opportunity Report
          </h1>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-slate-400">Site:</span>
          <span className="font-medium text-white">
            {basicInfo.businessUrl}
          </span>
          <Badge
            variant={analysisScope === "local" ? "default" : "secondary"}
            className="ml-2"
          >
            {analysisScope === "local" ? (
              <>
                <MapPin className="h-3 w-3 mr-1" />
                Local Analysis
              </>
            ) : (
              <>
                <Globe className="h-3 w-3 mr-1" />
                National Analysis
              </>
            )}
          </Badge>
        </div>
        <p className="text-slate-300 max-w-2xl mx-auto">
          📊 Here's your comprehensive SEO opportunity analysis including search
          volume, ranking potential, and revenue projections.
        </p>
      </div>

      {/* Key Metrics Overview */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" />
          Performance Metrics
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-medium">
                  Metric
                </th>
                <th className="text-right py-3 px-4 text-slate-300 font-medium">
                  Current
                </th>
                <th className="text-right py-3 px-4 text-slate-300 font-medium">
                  Potential
                </th>
                <th className="text-right py-3 px-4 text-slate-300 font-medium">
                  Opportunity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              <tr>
                <td className="py-4 px-4 font-medium text-white">
                  Search Volume
                </td>
                <td className="py-4 px-4 text-right text-slate-300">-</td>
                <td className="py-4 px-4 text-right font-semibold text-white">
                  {formatNumber(totalSearchVolume)}
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                    <TrendingUp className="w-4 h-4" />
                    {formatNumber(totalSearchVolume)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-medium text-white">
                  Monthly Traffic
                </td>
                <td className="py-4 px-4 text-right text-slate-300">-</td>
                <td className="py-4 px-4 text-right font-semibold text-white">
                  {formatNumber(potentialTraffic)}
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                    <TrendingUp className="w-4 h-4" />
                    {formatNumber(potentialTraffic)}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-medium text-white">
                  Conversion Rate
                </td>
                <td className="py-4 px-4 text-right text-slate-300">-</td>
                <td className="py-4 px-4 text-right font-semibold text-white">
                  {conversionRate}%
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-blue-400 font-medium">
                    <Target className="w-4 h-4" />
                    {conversionRate}%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-4 px-4 font-medium text-white">
                  Monthly Customers
                </td>
                <td className="py-4 px-4 text-right text-slate-300">-</td>
                <td className="py-4 px-4 text-right font-semibold text-white">
                  {potentialCustomers}
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-green-400 font-medium">
                    <Users className="w-4 h-4" />+{potentialCustomers}
                  </span>
                </td>
              </tr>
              <tr className="border-t-2 border-blue-500">
                <td className="py-4 px-4 font-bold text-white">
                  Monthly Revenue
                </td>
                <td className="py-4 px-4 text-right text-slate-300">-</td>
                <td className="py-4 px-4 text-right font-bold text-white text-lg">
                  {formatCurrency(potentialRevenue)}
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="inline-flex items-center gap-1 text-green-400 font-bold text-lg">
                    <DollarSign className="w-5 h-5" />
                    {formatCurrency(potentialRevenue)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Current Rankings */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
          📈 Current Ranking Performance
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {currentRankings.top3}
            </div>
            <div className="text-sm text-slate-300">Top 3 Rankings</div>
            <div className="text-xs text-slate-400 mt-1">Page 1 positions</div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {currentRankings.top10}
            </div>
            <div className="text-sm text-slate-300">Top 10 Rankings</div>
            <div className="text-xs text-slate-400 mt-1">
              First page results
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {currentRankings.top50}
            </div>
            <div className="text-sm text-slate-300">Top 50 Rankings</div>
            <div className="text-xs text-slate-400 mt-1">Pages 1-5</div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {currentRankings.top100}
            </div>
            <div className="text-sm text-slate-300">Top 100 Rankings</div>
            <div className="text-xs text-slate-400 mt-1">Pages 1-10</div>
          </div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4">
          <p className="text-slate-300 text-center">
            Out of{" "}
            <span className="font-semibold text-white">
              {currentRankings.total}
            </span>{" "}
            relevant keywords, your website currently ranks in the top 100 for{" "}
            <span className="font-semibold text-blue-400">
              {currentRankings.top100}
            </span>{" "}
            keywords.
          </p>
        </div>
      </Card>

      {/* Competitor Comparison */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
          🏆 Competitor Ranking Comparison
        </h2>
        <div className="h-80 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rankingsData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis
                dataKey="name"
                type="category"
                width={70}
                stroke="#94a3b8"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
              />
              <Bar dataKey="top3" stackId="a" fill="#22c55e" name="Top 3" />
              <Bar dataKey="top10" stackId="a" fill="#3b82f6" name="Top 4-10" />
              <Bar
                dataKey="top50"
                stackId="a"
                fill="#f59e0b"
                name="Top 11-50"
              />
              <Bar
                dataKey="top100"
                stackId="a"
                fill="#ef4444"
                name="Top 51-100"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-slate-300">Top 3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-slate-300">Top 4-10</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-sm text-slate-300">Top 11-50</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm text-slate-300">Top 51-100</span>
          </div>
        </div>
      </Card>

      {/* Executive Summary */}
      <Card className="bg-gradient-to-r from-blue-900 to-purple-900 border-blue-700 p-8">
        <h2 className="text-2xl font-bold mb-4 text-white">
          💡 Executive Summary
        </h2>
        <div className="space-y-4 text-lg">
          <p className="text-blue-100">
            There are currently{" "}
            <span className="font-bold text-white">
              {totalSearchVolume.toLocaleString()}
            </span>{" "}
            searches per month
            {analysisScope === "local"
              ? ` in ${basicInfo.location}`
              : " nationwide"}{" "}
            for keywords that could drive your business. If you captured that
            traffic and converted even{" "}
            <span className="font-bold text-white">{conversionRate}%</span>,
            that would be{" "}
            <span className="font-bold text-white">{potentialCustomers}</span>{" "}
            new customers every month.
          </p>
          <p className="text-blue-100">
            Based on your average customer value of{" "}
            <span className="font-bold text-white">
              {formatCurrency(basicInfo.customerValue)}
            </span>
            , that means SEO could drive you{" "}
            <span className="font-bold text-yellow-300 text-xl">
              {formatCurrency(potentialRevenue)}
            </span>{" "}
            additional revenue per month if you were ranked #1 for all keyword
            terms.
          </p>
        </div>
      </Card>

      {/* Call to Action */}
      <div className="text-center space-y-4">
        <p className="text-slate-300">
          This just scratches the surface, view your complete SEO opportunity
          analysis inside.
        </p>
        <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105">
          Get Full SEO Strategy →
        </button>
      </div>
    </div>
  );
};
