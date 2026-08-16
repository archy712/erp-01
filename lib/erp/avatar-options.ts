/**
 * profiles.avatar_key 체크 제약(profiles_avatar_key_check)과 정확히 동일한 24종
 * 이모지 프리셋. 실제 아바타 이미지 에셋이 없어 이모지로 대체한다.
 * `components/profile-form.tsx`의 아바타 선택 다이얼로그가 이 목록을 쓴다.
 */
export const AVATAR_OPTIONS = [
  { key: "fox", emoji: "🦊" },
  { key: "bear", emoji: "🐻" },
  { key: "cat", emoji: "🐱" },
  { key: "panda", emoji: "🐼" },
  { key: "rabbit", emoji: "🐰" },
  { key: "owl", emoji: "🦉" },
  { key: "penguin", emoji: "🐧" },
  { key: "tiger", emoji: "🐯" },
  { key: "dog", emoji: "🐶" },
  { key: "lion", emoji: "🦁" },
  { key: "koala", emoji: "🐨" },
  { key: "cow", emoji: "🐮" },
  { key: "pig", emoji: "🐷" },
  { key: "frog", emoji: "🐸" },
  { key: "monkey", emoji: "🐵" },
  { key: "unicorn", emoji: "🦄" },
  { key: "wolf", emoji: "🐺" },
  { key: "raccoon", emoji: "🦝" },
  { key: "hamster", emoji: "🐹" },
  { key: "hedgehog", emoji: "🦔" },
  { key: "chicken", emoji: "🐔" },
  { key: "duck", emoji: "🦆" },
  { key: "butterfly", emoji: "🦋" },
  { key: "turtle", emoji: "🐢" },
] as const;

export type AvatarKey = (typeof AVATAR_OPTIONS)[number]["key"];

export const DEFAULT_AVATAR_KEY: AvatarKey = "fox";

export function getAvatarEmoji(key: string): string {
  return (
    AVATAR_OPTIONS.find((option) => option.key === key)?.emoji ??
    AVATAR_OPTIONS[0].emoji
  );
}
