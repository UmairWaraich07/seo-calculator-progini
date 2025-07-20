import { Badge } from "@/components/ui/badge";

interface KeywordData {
  keyword: string;
  searchVolume: number;
  clientRank: number | string;
  isLocal?: boolean;
}

interface KeywordTableProps {
  keywordData: KeywordData[];
  analysisScope: string;
}

export const KeywordTable = ({
  keywordData,
  analysisScope,
}: KeywordTableProps) => {
  // Sort keywords by search volume (highest first)
  const sortedKeywords = [...keywordData].sort(
    (a, b) => b.searchVolume - a.searchVolume
  );

  const getRankColor = (rank: number | string) => {
    if (rank === "Not ranked") return "text-slate-400";
    const numRank = typeof rank === "string" ? Number.parseInt(rank) : rank;
    if (numRank <= 3) return "text-green-400 font-semibold";
    if (numRank <= 10) return "text-blue-400 font-semibold";
    if (numRank <= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getRankBadge = (rank: number | string) => {
    if (rank === "Not ranked") return null;
    const numRank = typeof rank === "string" ? Number.parseInt(rank) : rank;
    if (numRank <= 3)
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          Top 3
        </Badge>
      );
    if (numRank <= 10)
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          Top 10
        </Badge>
      );
    if (numRank <= 50)
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          Top 50
        </Badge>
      );
    return (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
        Top 100+
      </Badge>
    );
  };

  const formatSearchVolume = (volume: number) => {
    if (volume >= 1000000) {
      return (volume / 1000000).toFixed(1) + "M";
    }
    if (volume >= 1000) {
      return (volume / 1000).toFixed(1) + "K";
    }
    return volume.toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="text-slate-300 text-sm">
        Showing top {Math.min(sortedKeywords.length, 50)} keywords ranked by
        search volume
        {analysisScope === "local" && " (including local variations)"}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-4 px-4 text-slate-300 font-semibold">
                Keyword
              </th>
              <th className="text-center py-4 px-4 text-slate-300 font-semibold">
                Monthly Searches
              </th>
              <th className="text-center py-4 px-4 text-slate-300 font-semibold">
                Current Rank
              </th>
              <th className="text-center py-4 px-4 text-slate-300 font-semibold">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {sortedKeywords.slice(0, 50).map((keyword, index) => (
              <tr
                key={index}
                className="hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">
                      {keyword.keyword}
                    </span>
                    {keyword.isLocal && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                        Local
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-white font-semibold">
                    {formatSearchVolume(keyword.searchVolume)}
                  </span>
                </td>
                <td
                  className={`py-4 px-4 text-center ${getRankColor(
                    keyword.clientRank
                  )}`}
                >
                  <span className="font-medium">
                    {keyword.clientRank === "Not ranked"
                      ? "Not ranked"
                      : `#${keyword.clientRank}`}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  {getRankBadge(keyword.clientRank) || (
                    <Badge className="bg-slate-600/20 text-slate-400 border-slate-600/30">
                      Unranked
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedKeywords.length > 50 && (
        <div className="text-center py-4">
          <div className="text-slate-400 text-sm">
            Showing top 50 of {sortedKeywords.length} total keywords
          </div>
        </div>
      )}

      <div className="bg-slate-700 rounded-lg p-4 mt-6">
        <h4 className="font-semibold text-white mb-2">
          💡 Ranking Opportunity
        </h4>
        <p className="text-slate-300 text-sm">
          These keywords represent significant traffic opportunities. Focus on
          improving rankings for high-volume keywords where you're currently
          ranking between positions 11-50 for the quickest wins.
        </p>
      </div>
    </div>
  );
};
