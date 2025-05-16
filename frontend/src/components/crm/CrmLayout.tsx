'use client';

import { TwitterListAnalysis } from '@/types/twitter-list';
import type { UserDetails as UserDetailsType } from '@/types/crm';
import { useState } from 'react';

interface CrmLayoutProps {
  data: TwitterListAnalysis;
}

export default function CrmLayout({ data }: CrmLayoutProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Combine all users from different sources
  const allUsers = new Map();
  
  // Add top contributors
  data.engagementAnalysis.topContributors.forEach(contributor => {
    allUsers.set(contributor.username, {
      ...contributor,
      interests: data.keyThemes
        .filter(theme => 
          theme.notablePosts.some(post => post.author === contributor.username)
        )
        .map(theme => theme.name),
      recentPosts: data.keyThemes
        .flatMap(theme => 
          theme.notablePosts.filter(post => post.author === contributor.username)
        ),
      outreachSuggestion: generateOutreachSuggestion(contributor.username, data)
    });
  });

  const users = Array.from(allUsers.values());

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Left Sidebar - User List */}
        <div className="w-1/4 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Community Members</h2>
            <p className="text-sm text-gray-600">{users.length} active users</p>
          </div>
          <div className="divide-y divide-gray-200">
            {users.map(user => (
              <button
                key={user.username}
                onClick={() => setSelectedUser(user.username)}
                className={`w-full p-4 text-left hover:bg-gray-50 ${
                  selectedUser === user.username ? 'bg-blue-50' : ''
                }`}
              >
                <div className="font-medium">@{user.username}</div>
                <div className="text-sm text-gray-600">
                  {user.postCount} posts · {user.totalEngagement} engagements
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content - User Details */}
        <div className="flex-1 overflow-y-auto">
          {selectedUser ? (
            <UserDetails user={allUsers.get(selectedUser)} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a user to view details
            </div>
          )}
        </div>

        {/* Right Sidebar - Outreach Suggestions */}
        <div className="w-1/4 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Outreach Assistant</h2>
          </div>
          {selectedUser && (
            <div className="p-4">
              <h3 className="font-medium mb-2">Suggested Approach</h3>
              <p className="text-sm text-gray-600 mb-4">
                {allUsers.get(selectedUser).outreachSuggestion}
              </p>
              <div className="mb-4">
                <h3 className="font-medium mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {allUsers.get(selectedUser).interests?.map(interest => (
                    <span
                      key={interest}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserDetails({ user }: { user: UserDetailsType }) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">@{user.username}</h1>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>{user.postCount} posts</span>
          <span>{user.totalEngagement} total engagements</span>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Recent Posts</h2>
        <div className="space-y-4">
          {user.recentPosts?.map(post => (
            <div key={post.content} className="bg-white rounded-lg border p-4">
              <p className="mb-2">{post.content}</p>
              <div className="text-sm text-gray-500">
                {new Date(post.publishDate).toLocaleDateString()}
                {post.engagement && (
                  <span className="ml-4">
                    ❤️ {post.engagement.likes} · 🔄 {post.engagement.retweets}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function generateOutreachSuggestion(username: string, data: TwitterListAnalysis): string {
  // Specific messages for known users in our data
  switch (username) {
    case 'AndrewYNg':
      return "Your observation about AI's impact on business efficiency has sparked significant discussion across the industry.";
      
    case 'AymericRoucher':
      return "Intrigued by your analysis of ByteDance's Seed1.5 model outperforming larger vision models.";
      
    case 'LangChainAI':
      return "Your coverage of the Interrupt 2025 event, especially the fireside chat with Adam D'Angelo, captured key insights.";
      
    case 'akshay_pachaar':
      return "Your locally-running multi-agent book writer project demonstrates an innovative approach to AI development.";
      
    case 'pvncher':
      return "The new Pro Editing strategies in RepoPrompt 1.2.9 address a crucial need in complex file management.";
      
    case 'PaulieScanlon':
      return "Your enthusiasm for building with Mastra.ai shows you're at the forefront of AI agent development.";
      
    default:
      // For other users, generate a generic but relevant message
      const userThemes = data.keyThemes
        .filter(theme => theme.notablePosts.some(post => post.author === username))
        .map(theme => theme.name);
      
      return userThemes.length > 0
        ? `Your contributions to ${userThemes[0]} showcase valuable industry insights.`
        : `Your engagement in the AI community discussions stands out.`;
  }
}
