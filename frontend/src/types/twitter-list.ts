export interface TwitterListAnalysis {
  metadata: ListMetadata;
  keyThemes: KeyTheme[];
  trendingTopics: TrendingTopic[];
  highlights: Highlight[];
  engagementAnalysis: EngagementAnalysis;
}

export interface ListMetadata {
  listUrl: string;
  listId: string;
  totalPosts: number;
  timeRange: {
    start: string;
    end: string;
  };
  uniqueContributors: number;
  processedAt: string;
}

export interface Post {
  content: string;
  author: string;
  publishDate: string;
  engagement?: {
    likes: number;
    retweets: number;
  };
}

export interface KeyTheme {
  name: string;
  description: string;
  postCount: number;
  notablePosts: Post[];
}

export interface TrendingTopic {
  topic: string;
  frequency: number;
  context: string;
  relatedPosts: Post[];
}

export interface Highlight extends Post {
  significance: string;
}

export interface TopContributor {
  username: string;
  postCount: number;
  totalEngagement: number;
  outreachSuggestion?: string;
  interests?: string[];
  recentPosts?: Post[];
}

export interface EngagementAnalysis {
  topContributors: TopContributor[];
  peakActivity: {
    timeframe: string;
    postCount: number;
  };
  overallEngagementRate: number;
}
