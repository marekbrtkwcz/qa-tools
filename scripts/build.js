#!/usr/bin/env node
/**
 * qa-tools build: generates native Vibe CLI plugins (Agent Plugins 1.0)
 * from the single source in src/, driven by bundles.yaml.
 *
 * Adapted in concept from awesome-agents-for-quality (MIT):
 * https://github.com/jaktestowac/awesome-agents-for-quality
 *
 * Usage: node scripts/build.js [--bundle <name>] [--out plugins] [--check]
 *   --check  validate only: bundle membership, required files, name rules.
 *            Exit code 1 on any error. Used by CI.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'plugins');

/* ---------- minimal YAML subset parser (bundles.yaml) ---------- */

function parseBundles(file) {
  const text = fs.readFileSync(file, 'utf8');
  const bundles = {};
  let current = null;
  let currentKey = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/(^|\s)#.*$/, (m, offset) =>
      rawLine.includes('#') && rawLine.trim().startsWith('#') ? '' : rawLine.trim().startsWith('#') ? '' : m
    );
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const indent = line.length - line.trimStart().length;
    const trimmed = line.trim();
    if (indent === 0) {
      current = {};
      currentKey = trimmed.replace(/:$/, '');
      bundles[currentKey] = current;
    } else if (trimmed.startsWith('- ')) {
      if (!current[currentKey]) current[currentKey] = [];
      current[currentKey].push(trimmed.slice(2));
    } else {
      const m = trimmed.match(/^([\w-]+):\s*(.*)$/);
      if (m) {
        currentKey = m[1];
        const value = m[2].replace(/^["']|["']$/g, '');
        if (value === '') current[currentKey] = null;
        else if (value === 'true') current[currentKey] = true;
        else if (value === 'false') current[currentKey] = false;
        else current[currentKey] = value;
      }
    }
  }
  return bundles;
}

/* ---------- helpers ---------- */

function readIfExists(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

function tomlString(value) {
  return JSON.stringify(String(value)); // JSON escaping is valid TOML basic-string escaping
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  fs.cpSync(from, to, { recursive: true });
}

/* ---------- shared emoji style injection ---------- */

/**
 * Single source for the collection's emoji conventions: src/shared/emoji-style.md.
 * Appended to every generated SKILL.md and every generated agent TOML
 * (agent chat behaviour + generated reports read the same vocabulary).
 * Edit that file — not this script — to change the conventions.
 */
const EMOJI_STYLE = (() => {
  const p = path.join(SRC, 'shared', 'emoji-style.md');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8').replace(/\s+$/, '') : '';
})();

/** Append the shared emoji conventions to a skill or agent body */
function appendEmojiStyle(text) {
  if (!EMOJI_STYLE) return text;
  return text.replace(/\s+$/, '') + '\n' + EMOJI_STYLE;
}

/* ---------- frontmatter parser for src/agents/*.md ---------- */

function parseAgentMd(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error('No frontmatter found');
  const meta = {};
  let lastKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv) {
      lastKey = kv[1];
      let v = kv[2].trim();
      if (v.startsWith('[') && v.endsWith(']')) {
        meta[kv[1]] = v
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        v = v.replace(/^["']|["']$/g, '');
        meta[kv[1]] = v;
      }
    } else {
      // continuation of a long quoted description
      if (lastKey && typeof meta[lastKey] === 'string' && !line.trim().startsWith('-')) {
        const cont = line.trim().replace(/"$/, '');
        meta[lastKey] = (meta[lastKey] + ' ' + cont).trim();
      }
    }
  }
  return { meta, body: m[2].trim() };
}

/* Claude capability names / pack tool names -> Vibe tool names (approximate mapping) */
const CAPABILITY_TOOLS = {
  read: ['read_file'],
  search: ['web_search'],
  edit: ['edit'],
  write: ['write_file'],
  execute: ['bash'],
  web: ['web_search'],
  todo: ['todo'],
  // pack-style tool names (Read, Grep, Glob, ...)
  readfile: ['read_file'],
  grep: ['bash'],
  glob: ['bash'],
  webfetch: ['web_search'],
  websearch: ['web_search'],
  skill: ['skill'],
  bash: ['bash'],
  task: ['todo'],
};

/** Normalized tool names from capabilities and/or pack-style `tools:` frontmatter */
function toolsOf(meta) {
  const caps = [...(meta.capabilities || [])];
  if (typeof meta.tools === 'string' && meta.tools) {
    caps.push(...meta.tools.split(',').map((t) => t.trim()));
  } else if (Array.isArray(meta.tools)) {
    caps.push(...meta.tools);
  }
  return [...new Set(caps.flatMap((c) => CAPABILITY_TOOLS[String(c).toLowerCase()] || []))];
}

function isMutating(meta) {
  const parts = [...(meta.capabilities || [])];
  if (typeof meta.tools === 'string' && meta.tools) {
    parts.push(...meta.tools.split(',').map((t) => t.trim()));
  } else if (Array.isArray(meta.tools)) {
    parts.push(...meta.tools);
  }
  const MUTATORS = ['edit', 'write', 'execute', 'bash'];
  return parts.some((c) => MUTATORS.includes(String(c).toLowerCase()));
}

/**
 * Rewrite a pack's SKILL.md host instructions (Claude Code / Codex) into Vibe terms:
 * - bullets about starting agents are replaced with tools.agents + config_name guidance
 * - the "Name used below | Claude Code | Codex" table drops its Codex column
 */
function rewritePackSkill(text) {
  const lines = text.split(/\r?\n/);
  const out = [];
  let inAgentTable = false;
  for (const line of lines) {
    if (/^-\s*In Claude Code, start the agent/.test(line)) {
      out.push('- In Vibe, spawn the agent with `tools.agents` using `config_name` from the Vibe column.');
      continue;
    }
    if (/^-\s*In Codex, spawn the agent/.test(line)) continue;
    if (/\|\s*Name used below\s*\|/.test(line)) {
      inAgentTable = true;
      out.push(line.replace('| Claude Code | Codex |', '| Vibe |'));
      continue;
    }
    if (inAgentTable) {
      if (!line.trim()) {
        inAgentTable = false;
        out.push(line);
        continue;
      }
      if (/^\|[\s|-]+$/.test(line)) {
        // separator row: drop one cell (3 -> 2 columns)
        out.push(line.replace(/\s*-+\s*\|\s*$/, ''));
        continue;
      }
      // data row: drop the trailing Codex cell `some_name` (underscore-only name)
      out.push(line.replace(/\s*\|\s*`[a-z0-9_]+`\s*\|\s*$/, ''));
      continue;
    }
    out.push(line);
  }
  return out.join('\n');
}

/** Truncate a description to Vibe's 300-char limit, cutting on a word boundary */
function truncateDescription(text, max = 300) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 100 ? cut.slice(0, lastSpace) : cut).replace(/[,;.\s]+$/, '') + '…';
}

/** Convert a src/agents/<name>.md into a Vibe ai.mistral.vibe/agents/<name>.toml */
function agentToToml(mdPath) {
  const text = fs.readFileSync(mdPath, 'utf8');
  const { meta, body } = parseAgentMd(text);
  if (!meta.name) throw new Error(`${mdPath}: missing name`);
  const caps = toolsOf(meta);
  const safety = isMutating(meta) ? 'neutral' : 'safe';
  const lines = [];
  lines.push('# Generated by scripts/build.js from src/agents — do not edit by hand.');
  lines.push('schema_version = 1');
  lines.push('agent_type = "subagent"');
  lines.push(`display_name = ${tomlString((meta.title || meta.name).slice(0, 100))}`);
  lines.push(`description = ${tomlString(truncateDescription(meta.description || meta.name))}`);
  lines.push(`safety = ${tomlString(safety)}`);
  lines.push(`instructions = ${tomlString(appendEmojiStyle(body))}`);
  if (caps.length) {
    lines.push(`enabled_tools = [${caps.map((t) => tomlString(t)).join(', ')}]`);
  }
  return lines.join('\n') + '\n';
}

/* ---------- knowledge conversion ---------- */

/** Convert src/knowledge/<name>.md into ai.mistral.vibe/knowledge/<name>/KNOWLEDGE.md */
function knowledgeToFolder(mdPath, description) {
  const text = fs.readFileSync(mdPath, 'utf8');
  const frontmatter = [
    '---',
    `name: ${path.basename(mdPath, '.md')}`,
    `description: ${JSON.stringify(description)}`,
    `display_name: ${JSON.stringify(titleFromDescription(text))}`,
    'icon: book',
    '---',
    '',
  ].join('\n');
  return frontmatter + text;
}

function titleFromDescription(text) {
  const h1 = text.match(/^#\s+(.+)$/m);
  return h1 ? h1[1].trim() : 'Guide';
}

/* ---------- per-bundle build ---------- */

/** Global membership check: every src/skills folder belongs to exactly one bundle. */
function checkMembership(bundles) {
  const errors = [];
  const owner = new Map();
  for (const [name, bundle] of Object.entries(bundles)) {
    for (const skill of bundle.skills || []) {
      const from = path.join(SRC, 'skills', skill);
      if (!fs.existsSync(path.join(from, 'SKILL.md'))) {
        errors.push(`[${name}] bundles.yaml skill "${skill}" has no src/skills folder`);
        continue;
      }
      if (owner.has(skill)) {
        errors.push(`Skill "${skill}" declared in both "${owner.get(skill)}" and "${name}"`);
      } else {
        owner.set(skill, name);
      }
    }
  }
  const dirs = fs
    .readdirSync(path.join(SRC, 'skills'), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  for (const dir of dirs) {
    if (!owner.has(dir)) errors.push(`src/skills/${dir} not declared in any bundle`);
  }
  return errors;
}

function buildBundle(name, bundle, outDir, checkOnly) {
  if (checkOnly) return [];
  const errors = [];

  const pluginDir = path.join(outDir, name);
  fs.rmSync(pluginDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(pluginDir, 'ai.mistral.vibe/agents'), { recursive: true });
  fs.mkdirSync(path.join(pluginDir, 'ai.mistral.vibe/knowledge'), { recursive: true });
  fs.mkdirSync(path.join(pluginDir, 'vibe-hooks'), { recursive: true });

  // 1. plugin.json (Agent Plugins 1.0 + ai.mistral.vibe extension)
  const manifest = {
    $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
    name,
    version: bundle.version || '0.1.0',
    description: bundle.description,
    author: {
      name: 'qa-tools contributors',
      url: 'https://github.com/marekbrtkwcz/qa-tools',
    },
    homepage: 'https://github.com/marekbrtkwcz/qa-tools',
    repository: 'https://github.com/marekbrtkwcz/qa-tools',
    license: 'MIT',
    keywords: ['testing', 'quality-engineering', 'vibe-cli', name],
    extensions: {
      'ai.mistral.vibe': {
        schemaVersion: 1,
        displayName: `${name} (qa-tools)`,
      },
    },
  };
  fs.writeFileSync(path.join(pluginDir, 'plugin.json'), JSON.stringify(manifest, null, 2) + '\n');

  // 2. skills
  for (const skill of bundle.skills || []) {
    const from = path.join(SRC, 'skills', skill);
    const skillMd = path.join(from, 'SKILL.md');
    if (!fs.existsSync(skillMd)) {
      errors.push(`Skill ${skill}: missing SKILL.md`);
      continue;
    }
    const skillText = fs.readFileSync(skillMd, 'utf8');
    const fmName = skillText.match(/^---\r?\n[\s\S]*?name:\s*["']?([\w-]+)/);
    if (fmName && fmName[1] !== skill) {
      errors.push(`Skill ${skill}: frontmatter name "${fmName[1]}" != directory name`);
      continue;
    }
    copyDir(from, path.join(pluginDir, 'skills', skill));
    const skillBody = bundle.pack ? rewritePackSkill(skillText) : skillText;
    fs.writeFileSync(path.join(pluginDir, 'skills', skill, 'SKILL.md'), appendEmojiStyle(skillBody) + '\n');
  }

  // 3. agents -> TOML
  for (const agent of bundle.agents || []) {
    const md = path.join(SRC, 'agents', `${agent}.md`);
    if (!fs.existsSync(md)) {
      errors.push(`Agent ${agent}: no src/agents/${agent}.md`);
      continue;
    }
    try {
      fs.writeFileSync(path.join(pluginDir, 'ai.mistral.vibe/agents', `${agent}.toml`), agentToToml(md));
    } catch (e) {
      errors.push(`Agent ${agent}: conversion failed — ${e.message}`);
    }
  }

  // 4. knowledge
  for (const topic of bundle.knowledge || []) {
    const md = path.join(SRC, 'knowledge', `${topic}.md`);
    if (!fs.existsSync(md)) {
      errors.push(`Knowledge ${topic}: no src/knowledge/${topic}.md`);
      continue;
    }
    const dir = path.join(pluginDir, 'ai.mistral.vibe/knowledge', topic);
    fs.mkdirSync(dir, { recursive: true });
    const raw = fs.readFileSync(md, 'utf8');
    // first non-heading, non-empty paragraph becomes the description
    const para =
      raw
        .split(/\r?\n/)
        .map((l) => l.trim())
        .find((l) => l && !l.startsWith('#')) || `Guide: ${topic}`;
    const desc = para.replace(/^[-*>]+\s*/, '').slice(0, 297) + (para.length > 297 ? '...' : '');
    fs.writeFileSync(path.join(dir, 'KNOWLEDGE.md'), knowledgeToFolder(md, desc));
  }

  // 5. mcp.json (Vibe requires $schema and type fields)
  const mcp = { $schema: 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json', mcpServers: {} };
  for (const server of bundle.mcp || []) {
    mcp.mcpServers[server] =
      server === 'playwright'
        ? { type: 'stdio', command: 'npx', args: ['@playwright/mcp@latest'] }
        : { type: 'stdio', command: server };
  }
  fs.writeFileSync(path.join(pluginDir, 'mcp.json'), JSON.stringify(mcp, null, 2) + '\n');

  // 6. hooks: demo quality gate (log-only, non-strict)
  fs.writeFileSync(
    path.join(pluginDir, 'vibe-hooks/test-file-guard.js'),
    fs.readFileSync(path.join(ROOT, 'scripts/assets/test-file-guard.js'), 'utf8')
  );
  const hookEntries = (bundle.hooks || [])
    .map((h) =>
      [
        '[[hooks]]',
        `name = ${tomlString(h)}`,
        'type = "pre_tool"',
        'match = "file_system.write_file"',
        'command = "node vibe-hooks/test-file-guard.js"',
        'strict = false',
        '',
        '[[hooks]]',
        `name = ${tomlString(h + '-edit')}`,
        'type = "pre_tool"',
        'match = "file_system.edit"',
        'command = "node vibe-hooks/test-file-guard.js"',
        'strict = false',
        '',
      ].join('\n')
    )
    .join('\n');
  fs.writeFileSync(path.join(pluginDir, 'ai.mistral.vibe/hooks.toml'), hookEntries);

  return errors;
}

/* ---------- main ---------- */

function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');
  const bundleFlag = args.indexOf('--bundle');
  const outFlag = args.indexOf('--out');
  const outDir = outFlag >= 0 ? path.resolve(args[outFlag + 1]) : OUT;
  const bundles = parseBundles(path.join(ROOT, 'bundles.yaml'));
  const selected = bundleFlag >= 0 ? [args[bundleFlag + 1]] : Object.keys(bundles);

  let allErrors = checkMembership(bundles);
  for (const name of selected) {
    const bundle = bundles[name];
    if (!bundle) {
      console.error(`Unknown bundle: ${name}. Known: ${Object.keys(bundles).join(', ')}`);
      process.exit(2);
    }
    const errors = buildBundle(name, bundle, outDir, checkOnly);
    if (errors.length) {
      allErrors = allErrors.concat(errors.map((e) => `[${name}] ${e}`));
    } else if (!checkOnly) {
      console.log(`built: ${name}`);
    }
  }
  if (allErrors.length) {
    console.error('\nERRORS:');
    for (const e of allErrors) console.error('  - ' + e);
    process.exit(1);
  }
  console.log(checkOnly ? 'All bundles valid.' : 'Done.');
}

main();
