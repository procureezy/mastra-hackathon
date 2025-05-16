import CrmLayout from '@/components/crm/CrmLayout';

const mockData = {
  "metadata": {
    "listUrl": "https://x.com/i/lists/1885044904994234805",
    "listId": "1885044904994234805",
    "totalPosts": 47,
    "timeRange": {
      "start": "2025-05-15T00:02:56.000Z",
      "end": "2025-05-16T10:03:10.000Z"
    },
    "uniqueContributors": 14,
    "processedAt": "2025-05-16T10:53:34.862Z"
  },
  "keyThemes": [
    {
      "name": "AI and Machine Learning Advancements",
      "description": "Discussions about new AI models, tools, and their impact on various industries",
      "postCount": 12,
      "notablePosts": [
        {
          "content": "ByteDance takes the lead on vision models: small (~21B) Seed1.5 beats behemoths like Claude :fire:",
          "author": "AymericRoucher",
          "publishDate": "2025-05-16T10:03:10.000Z",
          "engagement": {
            "likes": 12,
            "retweets": 2
          }
        },
        {
          "content": "AI's ability to make tasks not just cheaper, but also faster, is underrated in its importance in creating business value.",
          "author": "AndrewYNg",
          "publishDate": "2025-05-15T16:00:59.000Z",
          "engagement": {
            "likes": 707,
            "retweets": 135
          }
        }
      ]
    },
    {
      "name": "LangChain and AI Agents",
      "description": "Updates and discussions about LangChain, AI agents, and related events",
      "postCount": 10,
      "notablePosts": [
        {
          "content": "Final event of the day at Interrupt 2025 :parrot::rocket: and it's a big one - a fireside chat with @adamdangelo!",
          "author": "LangChainAI",
          "publishDate": "2025-05-15T00:36:08.000Z",
          "engagement": {
            "likes": 18,
            "retweets": 6
          }
        },
        {
          "content": "Right after hitting $10m cARR, @11x_official rebuilt their core product, Alice, from scratch to be an agent!",
          "author": "LangChainAI",
          "publishDate": "2025-05-15T00:02:56.000Z",
          "engagement": {
            "likes": 28,
            "retweets": 6
          }
        }
      ]
    }
  ],
  "trendingTopics": [
    {
      "topic": "AI Agents",
      "frequency": 15,
      "context": "Discussion of AI agents in various applications, including LangChain's developments and industry adoption",
      "relatedPosts": [
        {
          "content": "Who's doing the @mastra_ai Hackathon? I'm gonna try and build an Agent that i've wanted for a long time.",
          "author": "PaulieScanlon",
          "publishDate": "2025-05-15T12:00:00.000Z"
        },
        {
          "content": "AI Agents Hour, May 15th https://t.co/RkrAYsYgwc",
          "author": "smthomas3",
          "publishDate": "2025-05-15T13:00:00.000Z"
        }
      ]
    },
    {
      "topic": "LangChain Interrupt 2025",
      "frequency": 8,
      "context": "Updates and highlights from the LangChain Interrupt 2025 conference",
      "relatedPosts": [
        {
          "content": "LangChain Interrupt 2025 was great. Evals are IP, got it. Time to create some awesome tech that increases our value and d…",
          "author": "houghtelin",
          "publishDate": "2025-05-15T14:00:00.000Z"
        },
        {
          "content": "So hyped by this amazing event by the @LangChainAI team!",
          "author": "assaf_elovic",
          "publishDate": "2025-05-15T15:00:00.000Z"
        }
      ]
    }
  ],
  "highlights": [
    {
      "content": "ByteDance takes the lead on vision models: small (~21B) Seed1.5 beats behemoths like Claude :fire:",
      "author": "AymericRoucher",
      "publishDate": "2025-05-16T10:03:10.000Z",
      "significance": "Highlights advancements in AI vision models by ByteDance",
      "engagement": {
        "likes": 12,
        "retweets": 2
      }
    },
    {
      "content": "AI's ability to make tasks not just cheaper, but also faster, is underrated in its importance in creating business value.",
      "author": "AndrewYNg",
      "publishDate": "2025-05-15T16:00:59.000Z",
      "significance": "Emphasizes the impact of AI on business efficiency and value creation",
      "engagement": {
        "likes": 707,
        "retweets": 135
      }
    }
  ],
  "engagementAnalysis": {
    "topContributors": [
      {
        "username": "LangChainAI",
        "postCount": 8,
        "totalEngagement": 93
      },
      {
        "username": "abhiaiyer",
        "postCount": 7,
        "totalEngagement": 83
      },
      {
        "username": "fekdaoui",
        "postCount": 5,
        "totalEngagement": 62
      }
    ],
    "peakActivity": {
      "timeframe": "2025-05-15T19:00:00Z to 2025-05-15T20:00:00Z",
      "postCount": 5
    },
    "overallEngagementRate": 43.94
  }
};

export default function Home() {
  return <CrmLayout data={mockData} />;
}
