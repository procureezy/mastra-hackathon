import { Highlight } from '@/types/twitter-list';

interface HighlightsProps {
  highlights: Highlight[];
}

export default function Highlights({ highlights }: HighlightsProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">Highlights</h2>
      <div className="space-y-4">
        {highlights.map((highlight) => (
          <div key={highlight.content} className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm">{highlight.content}</p>
            <p className="mt-2 text-sm text-gray-600">{highlight.significance}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>@{highlight.author}</span>
              {highlight.engagement && (
                <div>
                  <span>❤️ {highlight.engagement.likes}</span>
                  <span className="ml-2">🔄 {highlight.engagement.retweets}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
