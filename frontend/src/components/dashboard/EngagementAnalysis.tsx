import { EngagementAnalysis as EngagementAnalysisType } from '@/types/twitter-list';

interface EngagementAnalysisProps {
  analysis: EngagementAnalysisType;
}

export default function EngagementAnalysis({ analysis }: EngagementAnalysisProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">Engagement Analysis</h2>
      
      <div className="mb-6">
        <h3 className="mb-2 font-medium">Top Contributors</h3>
        <div className="space-y-2">
          {analysis.topContributors.map((contributor) => (
            <div key={contributor.username} className="flex items-center justify-between rounded-md bg-gray-50 p-3">
              <span className="font-medium">@{contributor.username}</span>
              <div className="text-sm text-gray-600">
                <span>{contributor.postCount} posts</span>
                <span className="ml-2">{contributor.totalEngagement} engagements</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-2 font-medium">Peak Activity</h3>
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-sm">
            {analysis.peakActivity.postCount} posts during {analysis.peakActivity.timeframe}
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-medium">Overall Engagement</h3>
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-sm">
            Average engagement rate: {analysis.overallEngagementRate.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}
