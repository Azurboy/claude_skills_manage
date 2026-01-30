import { SkillMetadata } from '../types.js';

// Common stop words for Chinese and English
const STOP_WORDS = new Set([
  // English
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'between',
  'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither',
  'not', 'only', 'own', 'same', 'than', 'too', 'very', 'just',
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
  'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
  'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
  'am', 'if', 'then', 'else', 'when', 'where', 'why', 'how', 'all', 'each',
  'every', 'any', 'some', 'no', 'more', 'most', 'other', 'such',
  // Chinese common words
  '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
  '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
  '自己', '这', '那', '什么', '怎么', '如何', '可以', '能', '想', '请', '帮',
]);

/**
 * Extract keywords from text (supports Chinese and English)
 * Uses simple tokenization: split by whitespace and punctuation
 */
export function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, ' ')  // Keep alphanumeric, Chinese chars, spaces, hyphens
    .split(/\s+/)
    .map(word => word.trim())
    .filter(word => word.length > 1)
    .filter(word => !STOP_WORDS.has(word))
    .filter((word, index, self) => self.indexOf(word) === index);  // Deduplicate
}

/**
 * Calculate match score between keywords and a skill
 */
function calculateScore(keywords: string[], skill: SkillMetadata, learnedScenarios?: string[]): number {
  let score = 0;
  const searchText = [
    skill.id,
    skill.name,
    skill.description,
    ...skill.tags,
    skill.domain,
    skill.scenario,
    ...(learnedScenarios || []),
  ].join(' ').toLowerCase();

  for (const keyword of keywords) {
    // Exact match in ID or name (highest weight)
    if (skill.id.toLowerCase().includes(keyword) || skill.name.toLowerCase().includes(keyword)) {
      score += 10;
    }
    // Match in tags (high weight)
    else if (skill.tags.some(tag => tag.toLowerCase().includes(keyword))) {
      score += 8;
    }
    // Match in description (medium weight)
    else if (skill.description.toLowerCase().includes(keyword)) {
      score += 5;
    }
    // Match in domain/scenario (medium weight)
    else if (skill.domain.toLowerCase().includes(keyword) || skill.scenario.toLowerCase().includes(keyword)) {
      score += 4;
    }
    // Match in learned scenarios (bonus)
    else if (learnedScenarios?.some(s => s.toLowerCase().includes(keyword))) {
      score += 6;
    }
    // Partial match anywhere
    else if (searchText.includes(keyword)) {
      score += 2;
    }
  }

  return score;
}

export interface PreFilterOptions {
  maxResults?: number;
  learnedScenarios?: Map<string, string[]>;  // skillId -> learned scenarios
}

/**
 * Pre-filter skills using keyword matching (Layer 1 of 3-tier matching)
 * This reduces the number of skills sent to LLM from 100+ to ~20
 */
export function preFilterSkills(
  query: string,
  skills: SkillMetadata[],
  options: PreFilterOptions = {}
): SkillMetadata[] {
  const { maxResults = 20, learnedScenarios } = options;
  const keywords = extractKeywords(query);

  if (keywords.length === 0) {
    // No meaningful keywords, return top skills by recency or just first N
    return skills.slice(0, maxResults);
  }

  const scored = skills
    .map(skill => ({
      skill,
      score: calculateScore(keywords, skill, learnedScenarios?.get(skill.id))
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  // If we have very few matches, include some zero-score skills as fallback
  if (scored.length < 5) {
    const scoredIds = new Set(scored.map(s => s.skill.id));
    const fallbacks = skills
      .filter(s => !scoredIds.has(s.id))
      .slice(0, maxResults - scored.length);
    return [...scored.map(s => s.skill), ...fallbacks];
  }

  return scored.slice(0, maxResults).map(item => item.skill);
}

/**
 * Build a compact summary of skills for LLM (Layer 2 input)
 */
export function buildCompactSummary(skills: SkillMetadata[]): string {
  return skills
    .map((skill, i) => {
      const tags = skill.tags.length > 0 ? ` [${skill.tags.slice(0, 3).join(', ')}]` : '';
      return `${i + 1}. ${skill.id}: ${skill.name}${tags} - ${skill.description.slice(0, 100)}`;
    })
    .join('\n');
}
