import { SkillMetadata, SkillIndex, MatchResult } from '../types.js';
import { preFilterSkills, buildCompactSummary, extractKeywords } from './keywords.js';
import { getLearnedScenarios } from '../usage/tracker.js';

/**
 * Build match prompt with 3-tier matching strategy:
 * Layer 1: Keyword pre-filtering (local, no LLM) - reduces 100+ skills to ~20
 * Layer 2: LLM selection from candidates (~1000 tokens) - selects top 5
 * Layer 3: User confirmation + loading
 */
export async function buildMatchPrompt(userQuery: string, index: SkillIndex): Promise<string> {
  // Layer 1: Pre-filter using keywords
  const learnedScenarios = await getLearnedScenarios();
  const candidates = preFilterSkills(userQuery, index.skills, {
    maxResults: 20,
    learnedScenarios
  });

  const keywords = extractKeywords(userQuery);
  const keywordsInfo = keywords.length > 0
    ? `**Extracted Keywords:** ${keywords.join(', ')}\n`
    : '';

  const skillsSummary = candidates
    .map((skill, i) => {
      return `${i + 1}. [${skill.id}] ${skill.name}
   - domain: ${skill.domain} | scenario: ${skill.scenario} | level: ${skill.level}
   - tags: ${skill.tags.join(', ') || 'none'}
   - ${skill.description}`;
    })
    .join('\n\n');

  // Get all skill IDs for reference
  const allSkillIds = candidates.map((s) => s.id);

  return `## Skills Matching Request

**User Query:** "${userQuery}"
${keywordsInfo}
**Pre-filtered Candidates (${candidates.length} from ${index.skills.length} total):**

${skillsSummary}

---

## Your Task

Analyze the user's query and select the most relevant skills from the pre-filtered candidates above.

### Step 1: Analysis
Think about which skills best match the user's needs based on:
- Direct keyword matches in name, description, and tags
- Domain and scenario relevance
- Level appropriateness

### Step 2: Selection
Select up to 5 most relevant skills. For each selected skill, note:
- The skill ID (must be one of: ${allSkillIds.slice(0, 10).join(', ')}${allSkillIds.length > 10 ? ', ...' : ''})
- Relevance score (1-10)
- Brief reason why it's relevant

### Step 3: Present Recommendations
Present your recommendations to the user in this format:

---
**Recommended Skills for "${userQuery}":**

1. **[skill-name]** (\`skill-id\`) - Relevance: X/10
   Reason: [why this skill is relevant]

2. ...
---

### Step 4: Load Skills
After presenting recommendations, ask the user:
"Would you like me to load these skills? (yes/no/select specific numbers)"

### Step 5: Execute Loading
Based on user's response:
- If "yes" or confirmed: Run the Bash command to load ALL recommended skills
- If user selects specific numbers: Run the command with only those skill IDs
- If "no": Acknowledge and end

**Command to load skills:**
\`\`\`bash
node /Users/zayn/ALL_Projects/skills/dist/cli.js inject <skill-id-1> <skill-id-2> ...
\`\`\`

**IMPORTANT:** After loading, the skill content will be displayed. Use this content to help the user with their original task.`;
}

export function parseMatchResponse(response: string, index: SkillIndex): MatchResult[] {
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]) as Array<{
      id: string;
      relevance: number;
      reason: string;
    }>;

    const results: MatchResult[] = [];
    for (const item of parsed) {
      const skill = index.skills.find((s) => s.id === item.id);
      if (skill) {
        results.push({
          skill,
          relevance: item.relevance,
          reason: item.reason,
        });
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance);
  } catch {
    return [];
  }
}

export function formatMatchResults(results: MatchResult[]): string {
  if (results.length === 0) {
    return 'No matching skills found.';
  }

  const lines = results.map((r, i) => {
    return `${i + 1}. **${r.skill.name}** (${r.skill.id})
   - Domain: ${r.skill.domain} | Scenario: ${r.skill.scenario} | Level: ${r.skill.level}
   - ${r.skill.description}
   - Relevance: ${r.relevance}/10 - ${r.reason}`;
  });

  return lines.join('\n\n');
}
