import { syncRepository, loadConfig, saveConfig } from './repo/sync.js';
import { buildIndex, loadIndex, getSkillById } from './index/store.js';
import { buildMatchPrompt, formatMatchResults } from './matcher/llm.js';
import { loadSkillContent, loadMultipleSkills } from './loader/inject.js';
import { recordPendingUsage, markUsage, getUsageStats } from './usage/tracker.js';
import { SkillIndex } from './types.js';

export async function handleSync(): Promise<string> {
  const result = await syncRepository();
  if (result.success) {
    const index = await buildIndex();
    return `${result.message}\nIndexed ${index.skills.length} skills.`;
  }
  return result.message;
}

export async function handleList(): Promise<string> {
  const index = await loadIndex();
  if (!index || index.skills.length === 0) {
    return 'No skills indexed. Run `/skills sync` first.';
  }

  const grouped: Record<string, typeof index.skills> = {};
  for (const skill of index.skills) {
    const domain = skill.domain || 'general';
    if (!grouped[domain]) grouped[domain] = [];
    grouped[domain].push(skill);
  }

  let output = `# Available Skills (${index.skills.length} total)\n\n`;
  output += `Last synced: ${index.lastSync}\n\n`;

  for (const [domain, skills] of Object.entries(grouped)) {
    output += `## ${domain.charAt(0).toUpperCase() + domain.slice(1)}\n\n`;
    for (const skill of skills) {
      output += `- **${skill.name}** (\`${skill.id}\`)\n`;
      output += `  ${skill.description}\n`;
      output += `  Tags: ${skill.tags.join(', ') || 'none'}\n\n`;
    }
  }

  return output;
}

export async function handleLoad(query: string): Promise<string> {
  const index = await loadIndex();
  if (!index || index.skills.length === 0) {
    return '尚未索引任何 skills。请先运行 `/skills sync`。';
  }

  const prompt = await buildMatchPrompt(query, index);

  return `# Skills 加载请求

${prompt}`;
}

export async function handleShow(skillId: string): Promise<string> {
  const skill = await getSkillById(skillId);
  if (!skill) {
    return `Skill "${skillId}" not found. Run \`/skills list\` to see available skills.`;
  }

  const content = await loadSkillContent(skill);

  return `# ${skill.name}

**ID:** \`${skill.id}\`
**Domain:** ${skill.domain} | **Scenario:** ${skill.scenario} | **Level:** ${skill.level}
**Tags:** ${skill.tags.join(', ') || 'none'}
**Version:** ${skill.version || 'N/A'}

---

${content}`;
}

export async function handleConfig(repoUrl?: string): Promise<string> {
  if (repoUrl) {
    await saveConfig({ repoUrl });
    return `Repository URL updated to: ${repoUrl}`;
  }

  const config = await loadConfig();
  return `# Current Configuration

- **Repository URL:** ${config.repoUrl}
- **Cache Directory:** ${config.cacheDir}
- **Auto Sync:** ${config.autoSync}

To update, use: \`/skills config <repo-url>\``;
}

export async function handleInject(skillIds: string[], query?: string): Promise<string> {
  const index = await loadIndex();
  if (!index) {
    return '尚未索引任何 skills。请先运行 `/skills sync`。';
  }

  const skills = skillIds
    .map((id) => index.skills.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  if (skills.length === 0) {
    return '未提供有效的 skill ID。';
  }

  // Record pending usage for tracking
  for (const skill of skills) {
    await recordPendingUsage(skill.id, query || '');
  }

  const content = await loadMultipleSkills(skills);
  return content;
}

export async function handleFeedback(
  skillId: string,
  feedback: 'useful' | 'notuseful',
  scenario?: string
): Promise<string> {
  const wasUseful = feedback === 'useful';
  const result = await markUsage(skillId, wasUseful, scenario);
  return result.message;
}

export async function handleStats(): Promise<string> {
  return getUsageStats();
}

// Main command dispatcher
export async function handleCommand(args: string[]): Promise<string> {
  const subcommand = args[0]?.toLowerCase() || 'help';
  const rest = args.slice(1);

  switch (subcommand) {
    case 'sync':
      return handleSync();

    case 'list':
      return handleList();

    case 'load':
      if (rest.length === 0) {
        return '用法: `/skills load <query>` - 描述你需要什么';
      }
      return handleLoad(rest.join(' '));

    case 'show':
      if (rest.length === 0) {
        return '用法: `/skills show <skill-id>` - 查看指定 skill';
      }
      return handleShow(rest[0]);

    case 'config':
      return handleConfig(rest[0]);

    case 'inject':
      if (rest.length === 0) {
        return '用法: `/skills inject <skill-id> [skill-id...]` - 按 ID 加载 skills';
      }
      return handleInject(rest);

    case 'feedback':
      if (rest.length < 2) {
        return '用法: `/skills feedback <skill-id> useful|notuseful [场景描述]`';
      }
      const feedbackType = rest[1].toLowerCase();
      if (feedbackType !== 'useful' && feedbackType !== 'notuseful') {
        return '反馈类型必须是 `useful` 或 `notuseful`';
      }
      return handleFeedback(rest[0], feedbackType, rest.slice(2).join(' ') || undefined);

    case 'stats':
      return handleStats();

    case 'help':
    default:
      return `# Claude Skills 管理器

## 命令

- \`/skills sync\` - 从远程仓库同步 skills
- \`/skills list\` - 列出所有可用 skills
- \`/skills load <query>\` - 查找并加载匹配的 skills
- \`/skills show <skill-id>\` - 查看指定 skill
- \`/skills inject <id> [id...]\` - 按 ID 加载 skills
- \`/skills config [repo-url]\` - 查看或更新配置
- \`/skills feedback <id> useful|notuseful [场景]\` - 标记 skill 是否有用
- \`/skills stats\` - 查看使用统计

## 快速开始

1. 配置 skills 仓库:
   \`/skills config https://github.com/your/skills-repo\`

2. 同步仓库:
   \`/skills sync\`

3. 查找相关 skills:
   \`/skills load "React hooks 开发"\`

4. 使用后反馈:
   \`/skills feedback react-best-practices useful "React 组件开发"\``;
  }
}
