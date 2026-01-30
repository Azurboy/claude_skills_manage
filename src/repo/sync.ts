import simpleGit, { SimpleGit } from 'simple-git';
import { existsSync, mkdirSync, cpSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { Config, DEFAULT_CONFIG, CONFIG_PATH } from '../config.js';

export async function loadConfig(): Promise<Config> {
  try {
    if (existsSync(CONFIG_PATH)) {
      const content = await readFile(CONFIG_PATH, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(content) };
    }
  } catch {
    // Use default config
  }
  return DEFAULT_CONFIG;
}

export async function saveConfig(config: Partial<Config>): Promise<void> {
  const current = await loadConfig();
  const merged = { ...current, ...config };
  await writeFile(CONFIG_PATH, JSON.stringify(merged, null, 2));
}

export async function syncRepository(): Promise<{ success: boolean; message: string }> {
  const config = await loadConfig();
  const { repoUrl, cacheDir } = config;

  if (!repoUrl || repoUrl === DEFAULT_CONFIG.repoUrl) {
    return {
      success: false,
      message: `Repository URL not configured. Please set it in ${CONFIG_PATH}`,
    };
  }

  // Ensure cache directory exists
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }

  const repoPath = join(cacheDir, 'repo');

  // Support local directory paths (for testing)
  if (repoUrl.startsWith('/') || repoUrl.startsWith('./') || repoUrl.startsWith('file://')) {
    const localPath = repoUrl.replace('file://', '');
    try {
      if (existsSync(repoPath)) {
        // Remove existing and copy fresh
        const { rm } = await import('fs/promises');
        await rm(repoPath, { recursive: true, force: true });
      }
      cpSync(localPath, repoPath, { recursive: true });
      return { success: true, message: 'Local directory synced successfully' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, message: `Local sync failed: ${errorMessage}` };
    }
  }

  const git: SimpleGit = simpleGit();

  try {
    if (existsSync(join(repoPath, '.git'))) {
      // Repository exists, pull updates
      const repoGit = simpleGit(repoPath);
      await repoGit.pull();
      return { success: true, message: 'Repository updated successfully' };
    } else {
      // Clone repository
      await git.clone(repoUrl, repoPath);
      return { success: true, message: 'Repository cloned successfully' };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Sync failed: ${errorMessage}` };
  }
}

export function getRepoPath(config: Config): string {
  return join(config.cacheDir, 'repo');
}
