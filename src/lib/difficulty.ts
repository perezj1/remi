export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export function difficultyFromUserLevel(level: number): Difficulty {
  if (level >= 1 && level <= 3) return 'EASY';
  if (level >= 4 && level <= 6) return 'MEDIUM';
  return 'HARD'; // niveles 7–10+
}

export function parseDifficultyFromText(text: string): Difficulty | null {
  if (!text) return null;
  if (/^EASY_/i.test(text)) return 'EASY';
  if (/^MEDIUM_/i.test(text)) return 'MEDIUM';
  if (/^HARD_/i.test(text)) return 'HARD';
  return null;
}

export function stripDifficultyPrefix(title: string): string {
  return title?.replace(/^(EASY_|MEDIUM_|HARD_)/i, '') ?? title;
}
