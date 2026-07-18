import postsJson from "./social-posts.json";

export type SocialPostKey = "register" | "pilote" | "pro";

export interface SocialPost {
  key: SocialPostKey;
  message: string;
  link: string;
}

const POSTS = postsJson as Record<SocialPostKey, SocialPost>;

/** Rotation : lun=register, mer=pilote, ven=pro (autres jours → register). */
export function pickPostForDate(date = new Date()): SocialPost {
  const day = date.getUTCDay(); // 0=dim … 6=sam
  if (day === 3) return POSTS.pilote;
  if (day === 5) return POSTS.pro;
  return POSTS.register;
}

export function getSocialPost(key?: string | null): SocialPost {
  if (key && key in POSTS) return POSTS[key as SocialPostKey];
  return pickPostForDate();
}

export function listSocialPosts(): SocialPost[] {
  return Object.values(POSTS);
}
