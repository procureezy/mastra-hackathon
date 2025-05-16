import fs from "fs/promises";

// Types for cleaned data
export interface UserProfile {
  screenName: string;
  name: string;
  description: string;
  location: string;
  url?: string;
}

export interface CleanedXPost {
  content: string;
  owner: UserProfile;
  publishDate: string;
  authorProfileUrl: string;
}

export interface CleanedData {
  groupedPosts: Record<string, CleanedXPost[]>;
  totalIndividualPosts: number;
  cleanedAt: string;
  analytics: {};
}

export interface NewsletterContent {
  summary: string;
  // keyTopics, potentialLeads, and trends are removed as their data sources are gone
  // If specific newsletter functionalities are still needed, they will need to be redefined
  // based on the available data in CleanedXPost and UserProfile.
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
    location: legacy.location || "",
    url: legacy.url,
  };
}

function identifyPotentialLead(
  user: UserProfile,
  posts: CleanedXPost[]
): boolean {
  // Criteria for identifying potential leads - simplified due to removed fields
  const hasValidDescription = user.description.length > 10;
  const hasWebsite = !!user.url;
  const businessTermMatches = user.description
    .toLowerCase()
    .match(/(ceo|founder|director|vp|head of|manager|lead|business|company)/g);
  const hasBusinessTerms =
    businessTermMatches !== null && businessTermMatches.length > 0;

  return (
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

    const individualPosts: CleanedXPost[] = entries
      .filter((entry: any) => {
        const tweet = entry?.content?.itemContent?.tweet_results?.result;
        return tweet && entry.content.entryType !== "TimelineTimelineModule";
      })
      .map((entry: any) => {
        const tweet = entry.content.itemContent.tweet_results.result;
        const legacy = tweet?.legacy;
        const user = tweet?.core?.user_results?.result;
        const ownerProfile = extractUserProfile(user);

        const cleanedPost: CleanedXPost = {
          content: legacy?.full_text || "",
          owner: ownerProfile,
          publishDate: legacy?.created_at || new Date().toISOString(),
          authorProfileUrl: `https://x.com/${ownerProfile.screenName}`,
        };
        return cleanedPost;
      })
      .filter((post: CleanedXPost) => post.content.length > 0);

    const groupedPosts: Record<string, CleanedXPost[]> = {};
    for (const post of individualPosts) {
      if (!groupedPosts[post.authorProfileUrl]) {
        groupedPosts[post.authorProfileUrl] = [];
      }
      groupedPosts[post.authorProfileUrl].push(post);
    }

    return {
      groupedPosts: groupedPosts,
      totalIndividualPosts: individualPosts.length,
      cleanedAt: new Date().toISOString(),
      analytics: {},
    };
  } catch (error) {
    console.error("[X-Data-Processor] Error cleaning data:", error);
    throw error;
  }
}

export async function generateNewsletter(
  data: CleanedData
): Promise<NewsletterContent> {
  // The original potentialLeads, keyTopics, and trends logic is removed
  // as it heavily depended on fields that no longer exist (metrics, hashtags, etc.)
  // This function and the NewsletterContent interface would need to be redesigned
  // based on the currently available data if newsletter generation is still required.

  // Note: Accessing posts for summary now needs to consider the grouped structure.
  // For example, to get a flat list of all posts:
  // const allPosts = Object.values(data.groupedPosts).flat();
  // const totalPostsForSummary = allPosts.length;

  return {
    summary: `Analysis of ${data.totalIndividualPosts} posts from the monitored list. Data is grouped by author. Further details require feature redesign due to data structure changes.`,
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
