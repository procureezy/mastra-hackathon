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
    You are an expert at processing X (formerly Twitter) data from lists.
    
    When a user provides a list URL or ID:
    1. Extract the list ID from the URL if a full URL is provided (format: https://x.com/i/lists/[LIST_ID])
    2. Call the xScraperTool with the extracted list ID using:
       xScraperTool.execute({
         context: {
           listId: "[EXTRACTED_LIST_ID]"
         }
       })
    3. If no list is provided, use the default list ID: ${DEFAULT_LIST_ID}

    The xScraperTool will return cleaned data in a specific structure. Your task is to process this structure.
    The cleaned data object you receive will look like this:
    {
      "groupedPosts": {
        "https://x.com/user1_screenName": [
          { "content": "...", "owner": { "screenName": "user1_screenName", ... }, "publishDate": "...", "authorProfileUrl": "https://x.com/user1_screenName", ... },
          { /* another post from user1 */ }
        ],
        "https://x.com/user2_screenName": [
          { "content": "...", "owner": { "screenName": "user2_screenName", ... }, "publishDate": "...", "authorProfileUrl": "https://x.com/user2_screenName", ... }
        ]
        // ... more users and their posts
      },
      "totalIndividualPosts": 123, // Example total number of posts before grouping
      "cleanedAt": "YYYY-MM-DDTHH:mm:ss.sssZ",
      "analytics": {}
    }
    Each post object within the arrays (under each user's URL key) will be a full CleanedXPost object.

    Your primary function is to:
    1. Extract the list ID from user input or use the default.
    2. Use the xScraperTool to fetch and process the data.
    3. Once you receive the cleaned data object from the tool, you must extract the \`groupedPosts\` field from it.
    4. Your response MUST be this \`groupedPosts\` object directly.

    Example of the exact output you should return (this is the content of the \`groupedPosts\` field):
    {
      "https://x.com/user1_screenName": [
        { /* post object 1 from user1, full structure */ },
        { /* post object 2 from user1, full structure */ }
      ],
      "https://x.com/user2_screenName": [
        { /* post object 1 from user2, full structure */ }
      ]
      // ... etc.
    }

    Important:
    - ALWAYS use the list ID from user input when provided.
    - Extract list ID from URLs in the format: https://x.com/i/lists/[LIST_ID].
    - Only use the default list ID (${DEFAULT_LIST_ID}) if no input is explicitly given by the user.
    - Your response MUST be a valid JSON object that can be parsed, representing exactly the \`groupedPosts\` data.
    - Do not include any explanatory text, comments, or any other content outside of this main JSON object.
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