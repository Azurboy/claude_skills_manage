import { readFile, writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { SkillUsage, UsageStore } from '../types.js';
import { extractKeywords } from '../matcher/keywords.js';

const USAGE_FILE = join(homedir(), '.claude-skills-cache', 'usage.json');

/**
 * Load usage store from disk
 */
export async function loadUsageStore(): Promise<UsageStore> {
  try {
    if (existsSync(USAGE_FILE)) {
      const content = await readFile(USAGE_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch {
    // Return default store
  }
  return {
    usages: [],
    learnedScenarios: {},
    stats: {
      totalLoads: 0,
      usefulCount: 0,
      notUsefulCount: 0,
    },
  };
}

/**
 * Save usage store to disk
 */
async function saveUsageStore(store: UsageStore): Promise<void> {
  const dir = join(homedir(), '.claude-skills-cache');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  await writeFile(USAGE_FILE, JSON.stringify(store, null, 2));
}

/**
 * Record a pending usage when a skill is loaded
 */
export async function recordPendingUsage(skillId: string, query: string): Promise<void> {
  const store = await loadUsageStore();

  const usage: SkillUsage = {
    skillId,
    query,
    timestamp: new Date().toISOString(),
    wasUseful: null,  // Pending - will be determined later
  };

  store.usages.push(usage);
  store.stats.totalLoads++;

  await saveUsageStore(store);
}

/**
 * Mark a skill usage as useful or not useful
 */
export async function markUsage(
  skillId: string,
  wasUseful: boolean,
  scenario?: string
): Promise<{ success: boolean; message: string }> {
  const store = await loadUsageStore();

  // Find the most recent pending usage for this skill
  let pendingIndex = -1;
  for (let i = store.usages.length - 1; i >= 0; i--) {
    if (store.usages[i].skillId === skillId && store.usages[i].wasUseful === null) {
      pendingIndex = i;
      break;
    }
  }

  if (pendingIndex === -1) {
    // No pending usage, create a new record
    store.usages.push({
      skillId,
      query: '',
      timestamp: new Date().toISOString(),
      wasUseful,
      scenario,
    });
  } else {
    store.usages[pendingIndex].wasUseful = wasUseful;
    if (scenario) {
      store.usages[pendingIndex].scenario = scenario;
    }
  }

  // Update stats
  if (wasUseful) {
    store.stats.usefulCount++;

    // Learn scenario from the query if marked useful
    const usage = store.usages[pendingIndex !== -1 ? pendingIndex : store.usages.length - 1];
    if (usage.query) {
      const learnedScenario = scenario || generateScenarioFromQuery(usage.query);
      if (!store.learnedScenarios[skillId]) {
        store.learnedScenarios[skillId] = [];
      }
      if (!store.learnedScenarios[skillId].includes(learnedScenario)) {
        store.learnedScenarios[skillId].push(learnedScenario);
        // Keep only last 5 scenarios per skill
        if (store.learnedScenarios[skillId].length > 5) {
          store.learnedScenarios[skillId].shift();
        }
      }
    }
  } else {
    store.stats.notUsefulCount++;
  }

  await saveUsageStore(store);

  return {
    success: true,
    message: wasUseful
      ? `Marked "${skillId}" as useful. ${scenario ? `Learned scenario: "${scenario}"` : ''}`
      : `Marked "${skillId}" as not useful.`,
  };
}

/**
 * Generate a scenario description from a query
 */
function generateScenarioFromQuery(query: string): string {
  const keywords = extractKeywords(query);
  return keywords.slice(0, 5).join(' ');
}

/**
 * Get learned scenarios for all skills (used in pre-filtering)
 */
export async function getLearnedScenarios(): Promise<Map<string, string[]>> {
  const store = await loadUsageStore();
  return new Map(Object.entries(store.learnedScenarios));
}

/**
 * Get usage statistics
 */
export async function getUsageStats(): Promise<string> {
  const store = await loadUsageStore();

  const { totalLoads, usefulCount, notUsefulCount } = store.stats;
  const pendingCount = store.usages.filter(u => u.wasUseful === null).length;
  const usefulRate = totalLoads > 0 ? ((usefulCount / totalLoads) * 100).toFixed(1) : '0';

  let output = `# Skills Usage Statistics

## Overview
- **Total Loads:** ${totalLoads}
- **Useful:** ${usefulCount} (${usefulRate}%)
- **Not Useful:** ${notUsefulCount}
- **Pending Feedback:** ${pendingCount}

## Learned Scenarios
`;

  const scenarios = Object.entries(store.learnedScenarios);
  if (scenarios.length === 0) {
    output += '\nNo learned scenarios yet. Use `/skills feedback <id> useful` to teach the system.\n';
  } else {
    for (const [skillId, skillScenarios] of scenarios) {
      output += `\n### ${skillId}\n`;
      for (const scenario of skillScenarios) {
        output += `- ${scenario}\n`;
      }
    }
  }

  // Recent usages
  output += '\n## Recent Activity\n';
  const recent = store.usages.slice(-10).reverse();
  if (recent.length === 0) {
    output += '\nNo recent activity.\n';
  } else {
    for (const usage of recent) {
      const status = usage.wasUseful === null ? '⏳ pending' : usage.wasUseful ? '✅ useful' : '❌ not useful';
      const date = new Date(usage.timestamp).toLocaleDateString();
      output += `- ${date}: **${usage.skillId}** - ${status}\n`;
    }
  }

  return output;
}

/**
 * Get pending usages (for auto-detection)
 */
export async function getPendingUsages(): Promise<SkillUsage[]> {
  const store = await loadUsageStore();
  return store.usages.filter(u => u.wasUseful === null);
}
