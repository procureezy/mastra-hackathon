import { TrendingTopic } from '@/types/twitter-list';

interface TrendingTopicsProps {
  topics: TrendingTopic[];
}

export default function TrendingTopics({ topics }: TrendingTopicsProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">Trending Topics</h2>
      <div className="space-y-6">
        {topics.map((topic) => (
          <div key={topic.topic} className="border-b pb-4 last:border-b-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{topic.topic}</h3>
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                {topic.frequency} mentions
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600">{topic.context}</p>
            <div className="mt-3 space-y-2">
              {topic.relatedPosts.map((post) => (
                <div key={post.content} className="rounded-md bg-gray-50 p-3">
                  <p className="text-sm">{post.content}</p>
                  <div className="mt-1 text-xs text-gray-500">@{post.author}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
