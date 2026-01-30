import { readFile } from 'fs/promises';
import { join } from 'path';
import { SkillMetadata } from '../types.js';
import { loadConfig, getRepoPath } from '../repo/sync.js';
import { extractSkillContent } from '../index/parser.js';

export async function loadSkillContent(skill: SkillMetadata): Promise<string> {
  const config = await loadConfig();
  const repoPath = getRepoPath(config);
  const fullPath = join(repoPath, skill.file);

  try {
    const rawContent = await readFile(fullPath, 'utf-8');
    return extractSkillContent(rawContent);
  } catch (error) {
    return `Error loading skill: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function loadMultipleSkills(skills: SkillMetadata[]): Promise<string> {
  const contents: string[] = [];

  for (const skill of skills) {
    const content = await loadSkillContent(skill);
    contents.push(`
---
## Skill: ${skill.name}
**ID:** ${skill.id}
**Domain:** ${skill.domain} | **Scenario:** ${skill.scenario} | **Level:** ${skill.level}
**Tags:** ${skill.tags.join(', ') || 'none'}

${content}
---
`);
  }

  return contents.join('\n');
}

export function formatSkillsForInjection(skills: SkillMetadata[], contents: string[]): string {
  const header = `
# Loaded Skills

The following skills have been loaded based on your request:

`;

  const skillBlocks = skills.map((skill, i) => {
    return `
## ${skill.name}

**ID:** \`${skill.id}\`
**Domain:** ${skill.domain} | **Scenario:** ${skill.scenario} | **Level:** ${skill.level}
**Tags:** ${skill.tags.join(', ') || 'none'}

${contents[i]}
`;
  });

  return header + skillBlocks.join('\n---\n');
}
