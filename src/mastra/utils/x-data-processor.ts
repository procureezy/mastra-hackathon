import fs from "fs/promises";

// Types for cleaned data
export interface UserProfile {
  screenName: string;
  name: string;
  description: string;
  followersCount: number;
  followingCount: number;
  location: string;
  url?: string;
  isVerified: boolean;
  profileImageUrl: string;
  createdAt: string;
}

export interface CleanedXPost {
  content: string;
  owner: UserProfile;
  publishDate: string;
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
    quotes: number;
    views?: number;
  };
  urls: Array<{
    url: string;
    expandedUrl: string;
    displayUrl: string;
  }>;
  mentionedUsers: string[];
  hashtags: string[];
  isReply: boolean;
  isRetweet: boolean;
  language: string;
}

export interface CleanedData {
  posts: CleanedXPost[];
  totalPosts: number;
  cleanedAt: string;
  analytics: {
    topHashtags: Array<{ tag: string; count: number }>;
    topMentionedUsers: Array<{ user: string; count: number }>;
    engagementRate: number;
    postsByLanguage: Record<string, number>;
  };
}

export interface NewsletterContent {
  summary: string;
  keyTopics: Array<{
    topic: string;
    posts: CleanedXPost[];
    relevance: number;
  }>;
  potentialLeads: Array<{
    user: UserProfile;
    relevanceScore: number;
    recentActivity: CleanedXPost[];
    suggestedApproach: string;
  }>;
  trends: Array<{
    trend: string;
    frequency: number;
    examples: CleanedXPost[];
  }>;
}

function extractUrls(
  entities: any
): Array<{ url: string; expandedUrl: string; displayUrl: string }> {
  return (entities?.urls || []).map((url: any) => ({
    url: url.url,
    expandedUrl: url.expanded_url,
    displayUrl: url.display_url,
  }));
}

function extractUserProfile(user: any): UserProfile {
  const legacy = user?.legacy || {};
  return {
    screenName: legacy.screen_name || "unknown",
    name: legacy.name || "Unknown",
    description: legacy.description || "",
    followersCount: legacy.followers_count || 0,
    followingCount: legacy.friends_count || 0,
    location: legacy.location || "",
    url: legacy.url,
    isVerified: !!user?.is_blue_verified,
    profileImageUrl: legacy.profile_image_url_https || "",
    createdAt: legacy.created_at || new Date().toISOString(),
  };
}

function calculateEngagementScore(post: CleanedXPost): number {
  const { likes, retweets, replies, quotes } = post.metrics;
  const totalEngagements = likes + retweets * 2 + replies * 3 + quotes * 2;
  return totalEngagements;
}

function identifyPotentialLead(
  user: UserProfile,
  posts: CleanedXPost[]
): boolean {
  // Criteria for identifying potential leads
  const hasSubstantialFollowers = user.followersCount > 1000;
  const isVerified = user.isVerified;
  const hasValidDescription = user.description.length > 10;
  const hasWebsite = !!user.url;
  const businessTermMatches = user.description
    .toLowerCase()
    .match(/(ceo|founder|director|vp|head of|manager|lead|business|company)/g);
  const hasBusinessTerms =
    businessTermMatches !== null && businessTermMatches.length > 0;

  return (
    (hasSubstantialFollowers || isVerified) &&
    hasValidDescription &&
    (hasWebsite || hasBusinessTerms)
  );
}

function generateLeadApproachSuggestion(
  user: UserProfile,
  posts: CleanedXPost[]
): string {
  const recentInterests =
    posts
      .map((post) => post.content.toLowerCase())
      .join(" ")
      .match(
        /(ai|machine learning|data|cloud|security|automation|digital transformation|innovation)/g
      ) || [];

  const uniqueInterests = [...new Set(recentInterests)];

  if (uniqueInterests.length === 0)
    return "General technology and innovation approach recommended";

  return `Approach focusing on their interest in ${uniqueInterests.join(", ")}. Consider highlighting our solutions in these areas.`;
}

// Function to clean raw X data
export async function cleanXData(rawData: any): Promise<CleanedData> {
  try {
    const entries =
      rawData.data?.list?.tweets_timeline?.timeline?.instructions?.[0]
        ?.entries || [];
    const hashtagCounts: Record<string, number> = {};
    const mentionedUserCounts: Record<string, number> = {};
    const languageCounts: Record<string, number> = {};

    const cleanedPosts = entries
      .filter((entry: any) => {
        const tweet = entry?.content?.itemContent?.tweet_results?.result;
        return tweet && entry.content.entryType !== "TimelineTimelineModule";
      })
      .map((entry: any) => {
        const tweet = entry.content.itemContent.tweet_results.result;
        const legacy = tweet?.legacy;
        const user = tweet?.core?.user_results?.result;
        const entities = legacy?.entities;

        // Count hashtags
        (entities?.hashtags || []).forEach((tag: any) => {
          hashtagCounts[tag.text] = (hashtagCounts[tag.text] || 0) + 1;
        });

        // Count mentioned users
        (entities?.user_mentions || []).forEach((mention: any) => {
          mentionedUserCounts[mention.screen_name] =
            (mentionedUserCounts[mention.screen_name] || 0) + 1;
        });

        // Count languages
        const lang = legacy?.lang || "unknown";
        languageCounts[lang] = (languageCounts[lang] || 0) + 1;

        const cleanedPost: CleanedXPost = {
          content: legacy?.full_text || "",
          owner: extractUserProfile(user),
          publishDate: legacy?.created_at || new Date().toISOString(),
          metrics: {
            likes: legacy?.favorite_count || 0,
            retweets: legacy?.retweet_count || 0,
            replies: legacy?.reply_count || 0,
            quotes: legacy?.quote_count || 0,
            views: tweet?.views?.count,
          },
          urls: extractUrls(entities),
          mentionedUsers: (entities?.user_mentions || []).map(
            (u: any) => u.screen_name
          ),
          hashtags: (entities?.hashtags || []).map((h: any) => h.text),
          isReply: !!legacy?.in_reply_to_status_id_str,
          isRetweet: !!legacy?.retweeted_status_result,
          language: lang,
        };

        return cleanedPost;
      })
      .filter((post: CleanedXPost) => post.content.length > 0);

    // Calculate total engagement
    const totalEngagement = cleanedPosts.reduce(
      (sum: number, post: CleanedXPost) => sum + calculateEngagementScore(post),
      0
    );
    const avgEngagement = totalEngagement / cleanedPosts.length;

    return {
      posts: cleanedPosts,
      totalPosts: cleanedPosts.length,
      cleanedAt: new Date().toISOString(),
      analytics: {
        topHashtags: Object.entries(hashtagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        topMentionedUsers: Object.entries(mentionedUserCounts)
          .map(([user, count]) => ({ user, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        engagementRate: avgEngagement,
        postsByLanguage: languageCounts,
      },
    };
  } catch (error) {
    console.error("[X-Data-Processor] Error cleaning data:", error);
    throw error;
  }
}

export async function generateNewsletter(
  data: CleanedData
): Promise<NewsletterContent> {
  const potentialLeads = data.posts
    .map((post) => post.owner)
    .filter(
      (user, index, self) =>
        index === self.findIndex((u) => u.screenName === user.screenName) && // Deduplicate
        identifyPotentialLead(
          user,
          data.posts.filter((p) => p.owner.screenName === user.screenName)
        )
    )
    .map((user) => {
      const userPosts = data.posts.filter(
        (p) => p.owner.screenName === user.screenName
      );
      return {
        user,
        relevanceScore: userPosts.reduce(
          (score, post) => score + calculateEngagementScore(post),
          0
        ),
        recentActivity: userPosts.slice(0, 3),
        suggestedApproach: generateLeadApproachSuggestion(user, userPosts),
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);

  // Extract key topics using hashtags and content analysis
  const keyTopics = data.analytics.topHashtags
    .map(({ tag, count }) => ({
      topic: tag,
      posts: data.posts
        .filter((post) => post.hashtags.includes(tag))
        .slice(0, 3),
      relevance: count,
    }))
    .slice(0, 5);

  return {
    summary: `Analysis of ${data.totalPosts} posts from the monitored list`,
    keyTopics,
    potentialLeads,
    trends: data.analytics.topHashtags.map(({ tag, count }) => ({
      trend: tag,
      frequency: count,
      examples: data.posts
        .filter((post) => post.hashtags.includes(tag))
        .slice(0, 2),
    })),
  };
}

// Function to save cleaned data
export async function saveCleanedData(
  data: CleanedData,
  outputPath: string
): Promise<void> {
  try {
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`[X-Data-Processor] Cleaned data saved to ${outputPath}`);
  } catch (error) {
    console.error("[X-Data-Processor] Error saving cleaned data:", error);
    throw error;
  }
}

// Function to read cleaned data
export async function readCleanedData(filePath: string): Promise<CleanedData> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as CleanedData;
  } catch (error) {
    console.error("[X-Data-Processor] Error reading cleaned data:", error);
    throw error;
  }
}
