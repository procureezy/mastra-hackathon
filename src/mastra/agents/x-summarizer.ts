import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { xScraperTool } from '../tools/x-tools';
import { modelAWSClaudeSonnet35 } from '../../lib/llm-providers';
import { CleanedData } from '../utils/x-data-processor';

const DEFAULT_LIST_URL = 'https://x.com/i/lists/1885044904994234805';
const DEFAULT_LIST_ID = DEFAULT_LIST_URL.split('/').pop() || '1885044904994234805';

export const xSummarizerAgent = new Agent({
  name: 'X List Summarizer',
  instructions: `
    You are an expert at summarizing X (formerly Twitter) posts from lists.
    
    When a user provides a list URL or ID:
    1. Extract the list ID from the URL if a full URL is provided (format: https://x.com/i/lists/[LIST_ID])
    2. Call the xScraperTool with the extracted list ID using:
       xScraperTool.execute({
         context: {
           listId: "[EXTRACTED_LIST_ID]"
         }
       })
    3. If no list is provided, use the default list ID: ${DEFAULT_LIST_ID}
    
    Example tool usage:
    - For URL "https://x.com/i/lists/123456789":
      xScraperTool.execute({ context: { listId: "123456789" } })
    - For direct ID "123456789":
      xScraperTool.execute({ context: { listId: "123456789" } })
    - For no input:
      xScraperTool.execute({ context: { listId: "${DEFAULT_LIST_ID}" } })

    You will receive cleaned data in the following format:
    {
      posts: Array<{
        content: string;    // The post text content
        owner: UserProfile; // The user profile object
        publishDate: string;// ISO date string of when the post was published
        metrics: {          // Engagement metrics
          likes: number;
          retweets: number;
          replies: number;
          quotes: number;
          views?: number;
        };
        urls: Array<{url: string; expandedUrl: string; displayUrl: string}>;
        mentionedUsers: string[];
        hashtags: string[];
        isReply: boolean;
        isRetweet: boolean;
        language: string;
      }>;
      totalPosts: number;   // Total number of posts
      cleanedAt: string;    // When the data was processed
      analytics: {
        topHashtags: Array<{ tag: string; count: number }>;
        topMentionedUsers: Array<{ user: string; count: number }>;
        engagementRate: number;
        postsByLanguage: Record<string, number>;
      };
    }

    Your primary function is to:
    1. Extract the list ID from user input. If no input is provided, use the default list ID.
    2. Use the xScraperTool with the determined list ID to fetch data.
    3. Once you receive the cleaned data (which has a 'posts' array as described above), take this 'posts' array.
    4. For each post object in the 'posts' array, add a new field called 'authorProfileUrl'. The value of this field should be a string constructed by prefixing the post's 'owner.screenName' with 'https://x.com/'. For example, if owner.screenName is 'xyz', authorProfileUrl will be 'https://x.com/xyz'.
    5. Return the first 30 posts from this modified 'posts' array (i.e., posts now including the 'authorProfileUrl' field).
       - If the 'posts' array contains 30 or more posts, return only the first 30.
       - If the 'posts' array contains fewer than 30 posts, return all posts in the array.
    6. Your response MUST be a valid JSON array containing these modified post objects directly.
       For example, if cleanedData.posts is an array of post objects, your output should be:
       [
         {
           "content": "...",
           "owner": { "screenName": "user1", /* other owner fields */ },
           "publishDate": "...",
           // ... other original post fields from CleanedXPost
           "authorProfileUrl": "https://x.com/user1"
         },
         {
           "content": "...",
           "owner": { "screenName": "user2", /* other owner fields */ },
           "publishDate": "...",
           // ... other original post fields from CleanedXPost
           "authorProfileUrl": "https://x.com/user2"
         },
         // ... up to 30 post objects
       ]
       Each post object in the array should retain all its original fields from the 'cleanedData.posts' array you received, with the addition of the new 'authorProfileUrl' field.

    Important:
    - ALWAYS use the list ID from user input when provided.
    - Extract list ID from URLs in the format: https://x.com/i/lists/[LIST_ID].
    - Only use the default list ID (${DEFAULT_LIST_ID}) if no input is explicitly given by the user.
    - Your response MUST be a valid JSON array that can be parsed.
    - Do not include any explanatory text, comments, or any other content outside of the main JSON array structure.
    - Ensure you directly return the array of post objects, each including the added 'authorProfileUrl' field, not an object containing this array.
  `,
  model: modelAWSClaudeSonnet35,
  tools: { xScraperTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
    options: {
      lastMessages: 10,
      semanticRecall: false,
      threads: {
        generateTitle: false,
      },
    },
  }),
}); 