export interface SkillMetadata {
  id: string;
  name: string;
  description: string;
  tags: string[];
  domain: string;
  scenario: string;
  level: string;
  file: string;
  version?: string;
}

export interface SkillIndex {
  lastSync: string;
  dimensions: {
    domain: string[];
    scenario: string[];
    level: string[];
  };
  skills: SkillMetadata[];
}

export interface MatchResult {
  skill: SkillMetadata;
  relevance: number;
  reason: string;
}

export interface SkillUsage {
  skillId: string;
  query: string;
  timestamp: string;
  wasUseful: boolean | null;  // null = pending (auto-detection not yet determined)
  scenario?: string;          // learned scenario description
}

export interface UsageStore {
  usages: SkillUsage[];
  learnedScenarios: Record<string, string[]>;  // skillId -> array of learned scenarios
  stats: {
    totalLoads: number;
    usefulCount: number;
    notUsefulCount: number;
  };
}
