import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { SkillIndex, SkillMetadata } from '../types.js';
import { parseSkillFile } from './parser.js';
import { loadConfig } from '../repo/sync.js';
import { getRepoPath } from '../repo/sync.js';

const DEFAULT_DIMENSIONS = {
  domain: ['frontend', 'backend', 'devops', 'data', 'mobile', 'ai', 'general'],
  scenario: ['development', 'debugging', 'deployment', 'testing', 'review'],
  level: ['beginner', 'intermediate', 'advanced'],
};

export async function getIndexPath(): Promise<string> {
  const config = await loadConfig();
  return join(config.cacheDir, 'index.json');
}

export async function loadIndex(): Promise<SkillIndex | null> {
  const indexPath = await getIndexPath();
  try {
    if (existsSync(indexPath)) {
      const content = await readFile(indexPath, 'utf-8');
      return JSON.parse(content);
    }
  } catch {
    // Index doesn't exist or is invalid
  }
  return null;
}

export async function saveIndex(index: SkillIndex): Promise<void> {
  const indexPath = await getIndexPath();
  await writeFile(indexPath, JSON.stringify(index, null, 2));
}

async function findSkillFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentDir: string, depth: number = 0) {
    const entries = await readdir(currentDir);
    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stats = await stat(fullPath);
      if (stats.isDirectory() && !entry.startsWith('.')) {
        // Check for SKILL.md in this directory (Composio format)
        const skillMdPath = join(fullPath, 'SKILL.md');
        if (existsSync(skillMdPath)) {
          files.push(skillMdPath);
        } else {
          // Continue walking subdirectories
          await walk(fullPath, depth + 1);
        }
      } else if (entry.endsWith('.md') && entry !== 'README.md' && entry !== 'CONTRIBUTING.md') {
        // Standard format: skill files directly in skills/ directory
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

export async function buildIndex(): Promise<SkillIndex> {
  const config = await loadConfig();
  const repoPath = getRepoPath(config);

  const skills: SkillMetadata[] = [];

  // Try skills/ subdirectory first (our format)
  const skillsDir = join(repoPath, 'skills');
  // Also try repo root (Composio format - each skill is a directory)
  const searchDirs = existsSync(skillsDir) ? [skillsDir] : [repoPath];

  for (const dir of searchDirs) {
    const files = await findSkillFiles(dir);
    for (const file of files) {
      const metadata = await parseSkillFile(file);
      if (metadata) {
        // Store relative path
        metadata.file = file.replace(repoPath + '/', '');
        skills.push(metadata);
      }
    }
  }

  const index: SkillIndex = {
    lastSync: new Date().toISOString(),
    dimensions: DEFAULT_DIMENSIONS,
    skills,
  };

  await saveIndex(index);
  return index;
}

export async function getSkillById(id: string): Promise<SkillMetadata | null> {
  const index = await loadIndex();
  if (!index) return null;
  return index.skills.find((s) => s.id === id) || null;
}

export async function filterSkillsByDimension(
  dimension: 'domain' | 'scenario' | 'level',
  value: string
): Promise<SkillMetadata[]> {
  const index = await loadIndex();
  if (!index) return [];
  return index.skills.filter((s) => s[dimension] === value);
}
