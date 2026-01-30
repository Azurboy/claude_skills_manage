import matter from 'gray-matter';
import { readFile } from 'fs/promises';
import { basename, dirname } from 'path';
import { SkillMetadata } from '../types.js';

export async function parseSkillFile(filePath: string): Promise<SkillMetadata | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const { data, content: body } = matter(content);

    const fileName = basename(filePath, '.md');
    // For SKILL.md files, use parent directory name as ID
    // For other .md files, use the filename
    const dirName = basename(dirname(filePath));
    const id = data.id || (fileName === 'SKILL' ? dirName : fileName);

    // Extract description from frontmatter or first paragraph
    let description = data.description || '';
    if (!description && body) {
      const firstParagraph = body.split('\n\n').find((p) => p.trim() && !p.startsWith('#'));
      if (firstParagraph) {
        description = firstParagraph.trim().slice(0, 200);
      }
    }

    // Use frontmatter name, or derive from id
    const name = data.name || id.replace(/-/g, ' ');

    return {
      id,
      name,
      description,
      tags: Array.isArray(data.tags) ? data.tags : [],
      domain: data.domain || 'general',
      scenario: data.scenario || 'development',
      level: data.level || 'intermediate',
      file: filePath,
      version: data.version,
    };
  } catch (error) {
    console.error(`Failed to parse ${filePath}:`, error);
    return null;
  }
}

export function extractSkillContent(rawContent: string): string {
  const { content } = matter(rawContent);
  return content;
}
