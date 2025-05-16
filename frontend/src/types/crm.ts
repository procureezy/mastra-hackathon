import { Post, TopContributor } from './twitter-list';

export interface UserDetails extends TopContributor {
  interests: string[];
  recentPosts: Post[];
  outreachSuggestion: string;
}
