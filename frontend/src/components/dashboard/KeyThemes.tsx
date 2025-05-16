import { KeyTheme } from '@/types/twitter-list';

interface KeyThemesProps {
  themes: KeyTheme[];
}

export default function KeyThemes({ themes }: KeyThemesProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">Key Themes</h2>
      <div className="space-y-6">
        {themes.map((theme) => (
          <div key={theme.name} className="border-b pb-4 last:border-b-0">
            <h3 className="mb-2 font-medium">{theme.name}</h3>
            <p className="mb-2 text-sm text-gray-600">{theme.description}</p>
            <div className="text-sm text-gray-500">Posts: {theme.postCount}</div>
            <div className="mt-3 space-y-2">
              {theme.notablePosts.map((post) => (
                <div key={post.content} className="rounded-md bg-gray-50 p-3">
                  <p className="text-sm">{post.content}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    <span>@{post.author}</span>
                    {post.engagement && (
                      <span className="ml-2">
                        ❤️ {post.engagement.likes} 🔄 {post.engagement.retweets}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
