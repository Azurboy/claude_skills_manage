import { homedir } from 'os';
import { join } from 'path';

export interface Config {
  repoUrl: string;
  cacheDir: string;
  autoSync: boolean;
}

export const DEFAULT_CONFIG: Config = {
  repoUrl: 'https://github.com/user/claude-skills-collection',
  cacheDir: join(homedir(), '.claude-skills-cache'),
  autoSync: true,
};

export const CONFIG_PATH = join(homedir(), '.claude-skills-config.json');
