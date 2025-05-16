import { TwitterListAnalysis } from '@/types/twitter-list';
import KeyThemes from './KeyThemes';
import TrendingTopics from './TrendingTopics';
import Highlights from './Highlights';
import EngagementAnalysis from './EngagementAnalysis';

interface DashboardLayoutProps {
  data: TwitterListAnalysis;
}

export default function DashboardLayout({ data }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Twitter List Analysis</h1>
          <div className="mt-2 text-sm text-gray-600">
            <p>List: {data.metadata.listUrl}</p>
            <p>Total Posts: {data.metadata.totalPosts}</p>
            <p>Contributors: {data.metadata.uniqueContributors}</p>
          </div>
        </header>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <KeyThemes themes={data.keyThemes} />
          <TrendingTopics topics={data.trendingTopics} />
          <Highlights highlights={data.highlights} />
          <EngagementAnalysis analysis={data.engagementAnalysis} />
        </div>
      </div>
    </div>
  );
}
