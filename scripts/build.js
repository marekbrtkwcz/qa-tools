#!/usr/bin/env node
/**
 * qa-tools build: generates native Vibe CLI plugins (Agent Plugins 1.0)
 * from the single source in src/, driven by bundles.yaml.
 *
 * Adapted in concept from awesome-agents-for-quality (MIT):
 * https://github.com/jaktestowac/awesome-agents-for-quality
 *
 * Usage: node scripts/build.js [--bundle <name>] [--out plugins] [--check] [--verify]
 *             [--set-version <x.y.z>]
 *   --check   validate only, no build: membership of skills/agents/knowledge
 *             in bundles.yaml, duplicates, orphans in src/, skill frontmatter
 *             name rules, description limits (errors) and truncation
 *             warnings. Exit code 1 on any error. Used by CI.
 *   --verify  drift gate (CI): rebuild into a temp dir and compare the result
 *             with the committed plugins/ artifact. Exit code 1 on any
 *             difference, including a committed plugin dir that bundles.yaml
 *             no longer declares. Never modifies plugins/. With --bundle,
 *             only that bundle is compared.
 *   --set-version  bump the version: of the selected bundles (all of them
 *             without --bundle) in bundles.yaml. Preserves comments,
 *             indentation and line endings. Does not build - run the build
 *             afterwards so the committed plugins/ mirrors the new versions.
 */
'use strict';

const fs = require('fs');
const os = require('os');
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
    // Full-line comments only. Inline comments are NOT supported: a value
    // like `icon: X # note` would soak the note into the value, so the
    // parser deliberately does not strip them.
    const line = rawLine.trim().startsWith('#') ? '' : rawLine;
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
      // data row: drop the trailing Codex cell `some_name` (underscore-only name),
      // keeping the row's closing pipe so the markdown table stays valid
      out.push(line.replace(/\s*\|\s*`[a-z0-9_]+`\s*\|\s*$/, ' |'));
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
function agentToToml(mdPath, bundleIcon) {
  const text = fs.readFileSync(mdPath, 'utf8');
  const { meta, body } = parseAgentMd(text);
  if (!meta.name) throw new Error(`${mdPath}: missing name`);
  const caps = toolsOf(meta);
  const safety = isMutating(meta) ? 'neutral' : 'safe';
  const lines = [];
  lines.push('# Generated by scripts/build.js from src/agents — do not edit by hand.');
  lines.push('schema_version = 1');
  lines.push('agent_type = "subagent"');
  const displayName = (meta.title || meta.name).slice(0, 100);
  lines.push(`display_name = ${tomlString(bundleIcon ? `${displayName} ${bundleIcon}` : displayName)}`);
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

/**
 * Membership checks across all three source kinds:
 * - every src/skills/<dir> is declared in exactly one bundle
 * - every src/agents/<name>.md is declared in exactly one bundle
 * - every src/knowledge/<name>.md is declared in exactly one bundle
 * and every declared name exists in src/.
 * Runs in every mode (--check, build, --verify): it is read-only and cheap.
 */
/*
 * The playwright MCP server runs the global `playwright-mcp` binary, so the
 * version pin can no longer live in the generated manifest (the mcp.json
 * schema carries only the command). The pinned `npm i -g` install line in
 * README.md is therefore the only thing pinning the version users install.
 * This check keeps that guarantee mechanical: it reads mcp-pins from
 * bundles.yaml and fails the build when the README line does not name the
 * same version - a bump without the README edit is caught here, not on a
 * user's machine. Read-only and cheap; runs in every mode, like
 * checkMembership. A bundle without a pin stays quiet here: buildBundle
 * owns the "no version pin" error.
 */
function checkPlaywrightInstallDoc(bundles, docRoot = ROOT) {
  const errors = [];
  const qa = bundles['qa-mcp'];
  const pin = (qa && (qa['mcp-pins'] || []).find((p) => /^playwright=/.test(String(p)))) || null;
  if (!pin) return errors;
  const version = String(pin).split('=').pop();
  const wanted = `npm i -g @playwright/mcp@${version}`;
  let readme = '';
  try {
    readme = fs.readFileSync(path.join(docRoot, 'README.md'), 'utf8');
  } catch {
    return [
      `Bundle qa-mcp: README.md is missing, so the pinned playwright MCP install command ("${wanted}") cannot be verified`,
    ];
  }
  if (!readme.includes(wanted)) {
    errors.push(
      `Bundle qa-mcp: README.md does not contain the pinned install command "${wanted}" - the plugin runs the global playwright-mcp binary, so the README line is the only thing pinning the version users install; update it with the version from mcp-pins`
    );
  }
  return errors;
}

function checkMembership(bundles, srcRoot = SRC) {
  const errors = [];
  const kinds = [
    {
      key: 'skills',
      entry: (n) => `src/skills/${n} (SKILL.md)`,
      exists: (n) => fs.existsSync(path.join(srcRoot, 'skills', n, 'SKILL.md')),
      list: () =>
        fs
          .readdirSync(path.join(srcRoot, 'skills'), { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => d.name)
          .sort(),
    },
    {
      key: 'agents',
      entry: (n) => `src/agents/${n}.md`,
      exists: (n) => fs.existsSync(path.join(srcRoot, 'agents', `${n}.md`)),
      list: () =>
        fs
          .readdirSync(path.join(srcRoot, 'agents'))
          .filter((f) => f.endsWith('.md'))
          .map((f) => f.replace(/\.md$/, ''))
          .sort(),
    },
    {
      key: 'knowledge',
      entry: (n) => `src/knowledge/${n}.md`,
      exists: (n) => fs.existsSync(path.join(srcRoot, 'knowledge', `${n}.md`)),
      list: () =>
        fs
          .readdirSync(path.join(srcRoot, 'knowledge'))
          .filter((f) => f.endsWith('.md'))
          .map((f) => f.replace(/\.md$/, ''))
          .sort(),
    },
  ];
  for (const kind of kinds) {
    const owner = new Map();
    for (const [bundleName, bundle] of Object.entries(bundles)) {
      for (const item of bundle[kind.key] || []) {
        if (!kind.exists(item)) {
          errors.push(`[${bundleName}] bundles.yaml ${kind.key} "${item}" has no ${kind.entry(item)}`);
          continue;
        }
        if (owner.has(item)) {
          // strip a trailing "s" only: "knowledge" must not lose its "e"
          const kindName = kind.key.replace(/s$/, '');
          errors.push(
            `${kindName} "${item}" declared in both "${owner.get(item)}" and "${bundleName}"`
          );
        } else {
          owner.set(item, bundleName);
        }
      }
    }
    for (const name of kind.list()) {
      if (!owner.has(name)) errors.push(`${kind.entry(name)} not declared in any bundle`);
    }
  }
  return errors;
}

/**
 * Frontmatter validation for sources, running in every mode:
 * - skill frontmatter name must match its directory (the same rule the
 *   full build enforces when it copies)
 * - skill descriptions: present, and within the host hard limit of 1024
 *   (the agent-style 300 limit is deliberately NOT enforced on skills:
 *   routing descriptions in this collection are long on purpose)
 * - agents: name matches the file, description present; a description
 *   longer than 300 only WARNs, because the build truncates it silently —
 *   the warning shows what would be cut
 * - knowledge: the first paragraph (the generated description) over the
 *   build's 297-char slice point warns for the same reason
 * Errors fail the run; warnings never change the exit code.
 */
function validateFrontmatter(bundles, srcRoot = SRC) {
  const errors = [];
  const warnings = [];
  for (const [bundleName, bundle] of Object.entries(bundles)) {
    for (const skill of bundle.skills || []) {
      const skillMd = path.join(srcRoot, 'skills', skill, 'SKILL.md');
      const text = readIfExists(skillMd);
      if (!text) continue; // missing file already reported by checkMembership
      const fmName = text.match(/^---\r?\n[\s\S]*?name:\s*["']?([\w-]+)/);
      if (!fmName || fmName[1] !== skill) {
        errors.push(`[${bundleName}] skill ${skill}: frontmatter name "${fmName ? fmName[1] : '(none)'}" != directory name`);
      }
      const desc = (text.match(/^description:[ \t]*(.+)$/m) || [])[1] || '';
      const descValue = desc.trim().replace(/^["']|["']$/g, '');
      if (!descValue) errors.push(`[${bundleName}] skill ${skill}: missing frontmatter description`);
      else if (descValue.length > 1024)
        errors.push(`[${bundleName}] skill ${skill}: description is ${descValue.length} chars (max 1024)`);
      else if (descValue.length > 700)
        warnings.push(`skill ${skill}: description is ${descValue.length} chars — the hard limit is 1024, but routing signal blurs past ~600`);
    }
    for (const agent of bundle.agents || []) {
      const md = path.join(srcRoot, 'agents', `${agent}.md`);
      const text = readIfExists(md);
      if (!text) continue; // missing file already reported by checkMembership
      let meta;
      try {
        meta = parseAgentMd(text).meta;
      } catch (e) {
        errors.push(`[${bundleName}] agent ${agent}: ${e.message}`);
        continue;
      }
      if (meta.name !== agent) {
        errors.push(`[${bundleName}] agent ${agent}: frontmatter name "${meta.name || '(none)'}" != file name`);
      }
      const desc = meta.description || '';
      if (!desc) errors.push(`[${bundleName}] agent ${agent}: missing frontmatter description`);
      else if (desc.length > 300)
        warnings.push(`agent ${agent}: description is ${desc.length} chars — the build will truncate it at 300`);
    }
    for (const topic of bundle.knowledge || []) {
      const md = path.join(srcRoot, 'knowledge', `${topic}.md`);
      const raw = readIfExists(md);
      if (!raw) continue; // missing file already reported by checkMembership
      const para =
        raw
          .split(/\r?\n/)
          .map((l) => l.trim())
          .find((l) => l && !l.startsWith('#')) || '';
      const clean = para.replace(/^[-*>]+\s*/, '');
      if (clean.length > 297)
        warnings.push(`knowledge ${topic}: first paragraph is ${clean.length} chars — the build will slice it at 297 plus '...'`);
    }
  }
  return { errors, warnings };
}

function buildBundle(name, bundle, outDir, checkOnly) {
  if (checkOnly) return [];
  const errors = [];

  const pluginDir = path.join(outDir, name);
  fs.rmSync(pluginDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(pluginDir, 'ai.mistral.vibe/agents'), { recursive: true });
  fs.mkdirSync(path.join(pluginDir, 'ai.mistral.vibe/knowledge'), { recursive: true });

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
        displayName: `${name}${bundle.icon ? ' ' + bundle.icon : ''} (qa-tools)`,
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
    // skills/<name>/agents/openai.yaml holds Codex/OpenAI-format trigger
    // metadata (display_name, allow_implicit_invocation). Vibe takes all of
    // it from the SKILL.md frontmatter (disable-model-invocation/user-invocable),
    // so the folder is dropped from the native artifact. Verified 42/42: every
    // yaml sets allow_implicit_invocation: false and every SKILL.md already
    // carries disable-model-invocation: true.
    fs.rmSync(path.join(pluginDir, 'skills', skill, 'agents'), {
      recursive: true,
      force: true,
    });
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
      fs.writeFileSync(path.join(pluginDir, 'ai.mistral.vibe/agents', `${agent}.toml`), agentToToml(md, bundle.icon));
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
  // Only in bundles that declare mcp: — no empty mcpServers:{} manifests
  // in the other bundles (the same rule hooks follow below).
  // Server version pins come from bundles.yaml (mcp-pins: name=version):
  // the config file is the single source; a server without a pin is a
  // build error, so nobody can silently ship an unpinned (floating @latest)
  // server. The committed plugins/ artifact must be reproducible.
  if ((bundle.mcp || []).length) {
    const pins = new Map();
    for (const pin of bundle['mcp-pins'] || []) {
      const m = String(pin).match(/^([\w-]+)=\S+$/);
      if (m) pins.set(m[1], String(pin).slice(m[1].length + 1));
    }
    const mcp = { $schema: 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json', mcpServers: {} };
    for (const server of bundle.mcp) {
      if (server === 'playwright') {
        const version = pins.get('playwright');
        if (!version) {
          errors.push('Bundle qa-mcp: playwright MCP has no version pin - add "playwright=<version>" to mcp-pins in bundles.yaml (pinned, never @latest)');
          continue;
        }
        // The server runs the global binary (npm i -g, pinned install line in
        // README.md, enforced by checkPlaywrightInstallDoc). A direct spawn
        // starts in well under Vibe's fixed 10 s plugin-MCP startup budget,
        // where npx (shim + resolver + cache/registry) could exceed it on
        // Windows. The version pin can no longer live in this manifest - the
        // schema carries only the command - so the README install command
        // is the only thing pinning what users run; the build fails when
        // it drifts from mcp-pins.
        mcp.mcpServers[server] = { type: 'stdio', command: 'playwright-mcp' };
      } else {
        mcp.mcpServers[server] = { type: 'stdio', command: server };
      }
    }
    // A build error must never leave a dead mcpServers:{} manifest behind
    // (the 0.2.0 lesson): write only when every declared server resolved.
    if (Object.keys(mcp.mcpServers).length === (bundle.mcp || []).length) {
      fs.writeFileSync(path.join(pluginDir, 'mcp.json'), JSON.stringify(mcp, null, 2) + '\n');
    }
  }

  // 6. hooks: quality gate (blocks .only()/fit() in test files via
  // structured deny on stdout; warns on waits/tautologies). strict = false:
  // a crashing guard fails open (warning only), denial is data-driven,
  // never a non-zero exit code.
  // Only in bundles that declare hooks — no empty hooks.toml or stray guard
  // scripts in bundles without a gate.
  if ((bundle.hooks || []).length) {
    fs.mkdirSync(path.join(pluginDir, 'vibe-hooks'), { recursive: true });
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
          '[[hooks]]',
          `name = ${tomlString(h + '-bash')}`,
          'type = "pre_tool"',
          'match = "file_system.bash"',
          'command = "node vibe-hooks/test-file-guard.js"',
          'strict = false',
          '',
        ].join('\n')
      )
      .join('\n');
    fs.writeFileSync(path.join(pluginDir, 'ai.mistral.vibe/hooks.toml'), hookEntries);
  }

  return errors;
}

/* ---------- --set-version (bundles.yaml release bump) ---------- */

/**
 * Replace the version: value of the selected bundles in bundles.yaml,
 * preserving comments, order, indentation and the file's own line endings.
 * Returns the number of bundles whose version actually changed.
 */
function setBundlesVersions(file, selected, version) {
  const text = fs.readFileSync(file, 'utf8');
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  let current = null;
  let changed = 0;
  const out = text.split(/\r?\n/).map((line) => {
    if (/^\S/.test(line)) {
      current = line.replace(/:\s*$/, '').trim();
      return line;
    }
    const m = line.match(/^(\s+version:\s*)["'][^"']*["']\s*$/);
    if (m && current && selected.includes(current)) {
      changed++;
      return `${m[1]}"${version}"`;
    }
    return line;
  });
  if (!changed) return 0;
  fs.writeFileSync(file, out.join(eol));
  return changed;
}

/* ---------- drift gate (--verify) ---------- */

/** List all files under dir as slash-normalized relative paths, sorted. */
function listFiles(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(p, base));
    else out.push(path.relative(base, p).split(path.sep).join('/'));
  }
  return out.sort();
}

/**
 * Compare a fresh build (builtDir/<name>) with the committed artifact
 * (expectedDir/<name>) for each selected bundle. Returns error strings:
 * files missing from the artifact, stale files only in the artifact,
 * and files whose content differs.
 *
 * Content is compared after normalizing CRLF to LF: with core.autocrlf=true
 * (default on Windows) git rewrites text files in the working tree with CRLF
 * on any checkout/restore, so byte-identity would produce false drift on
 * Windows. Line endings are the only difference this gate tolerates.
 */
function diffTrees(builtDir, expectedDir, selected) {
  const errors = [];
  const norm = (buf) => buf.toString('utf8').replace(/\r\n/g, '\n');
  for (const name of selected) {
    const builtPath = path.join(builtDir, name);
    const committedPath = path.join(expectedDir, name);
    const built = fs.existsSync(builtPath) ? listFiles(builtPath) : [];
    const committed = fs.existsSync(committedPath) ? listFiles(committedPath) : [];
    const builtSet = new Set(built);
    const committedSet = new Set(committed);
    for (const f of built) {
      if (!committedSet.has(f)) {
        errors.push(`[${name}] ${f}: missing from committed plugins/ — rebuild and commit`);
        continue;
      }
      const a = fs.readFileSync(path.join(builtPath, f));
      const b = fs.readFileSync(path.join(committedPath, f));
      if (norm(a) !== norm(b)) errors.push(`[${name}] ${f}: differs from committed plugins/ — rebuild and commit`);
    }
    for (const f of committed) {
      if (!builtSet.has(f)) errors.push(`[${name}] ${f}: stale in committed plugins/ (not produced by build)`);
    }
  }
  return errors;
}

/**
 * Whole-bundle blind spot of the drift gate: a plugin directory committed
 * under plugins/ but no longer declared in bundles.yaml never shows up in
 * the per-file comparison (that iterates bundle keys only), so it would
 * stay green forever. Returns one error per stale directory.
 */
function orphanPluginDirs(expectedDir, known) {
  if (!fs.existsSync(expectedDir)) return [];
  const knownSet = new Set(known);
  return fs
    .readdirSync(expectedDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !knownSet.has(d.name))
    .map((d) => `plugins/${d.name}: committed but not declared in bundles.yaml — remove it or re-add the bundle`);
}

/* ---------- main ---------- */

/**
 * Swap freshly staged bundle dirs into the output tree, transactionally:
 * the current dir is parked (not deleted) until the staged one has been
 * renamed into place, so a failed rename can never leave a hole. On
 * Windows, renames of freshly written dirs occasionally fail with a
 * transient EPERM/EBUSY (antivirus indexing); those get a short retry.
 */
function renameSyncWithRetry(from, to, attempts = 3, waitMs = 100) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return fs.renameSync(from, to);
    } catch (e) {
      lastErr = e;
      if (!['EPERM', 'EBUSY', 'EACCES'].includes(e.code) || i === attempts - 1) break;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, waitMs); // sync sleep
    }
  }
  throw lastErr;
}

function swapStagedBundles(staging, outDir, names) {
  for (const name of names) {
    const src = path.join(staging, name);
    const dst = path.join(outDir, name);
    const parked = path.join(staging, `.parked-${name}`);
    if (fs.existsSync(dst)) renameSyncWithRetry(dst, parked);
    try {
      renameSyncWithRetry(src, dst);
    } catch (e) {
      if (fs.existsSync(parked) && !fs.existsSync(dst)) renameSyncWithRetry(parked, dst);
      throw e;
    }
    fs.rmSync(parked, { recursive: true, force: true });
  }
}

function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check');
  const verifyOnly = !checkOnly && args.includes('--verify');
  const bundleFlag = args.indexOf('--bundle');
  const outFlag = args.indexOf('--out');
  const outDir = outFlag >= 0 ? path.resolve(args[outFlag + 1]) : OUT;
  const bundles = parseBundles(path.join(ROOT, 'bundles.yaml'));
  const selected = bundleFlag >= 0 ? [args[bundleFlag + 1]] : Object.keys(bundles);

  const unknown = selected.filter((s) => !bundles[s]);
  if (unknown.length) {
    console.error(`Unknown bundle(s): ${unknown.join(', ')}. Known: ${Object.keys(bundles).join(', ')}`);
    process.exit(2);
  }

  const setVersionFlag = args.indexOf('--set-version');
  if (setVersionFlag >= 0) {
    const version = args[setVersionFlag + 1];
    if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
      console.error('--set-version expects an x.y.z version, e.g. --set-version 0.2.0');
      process.exit(2);
    }
    const changed = setBundlesVersions(path.join(ROOT, 'bundles.yaml'), selected, version);
    console.log(
      `Set version ${version} on ${changed} bundle(s) in bundles.yaml.` +
        (changed ? ' Now rebuild so plugins/ mirrors it: node scripts/build.js' : ' (nothing to change)')
    );
    process.exit(changed ? 0 : 1);
  }

  let allErrors = checkMembership(bundles);
  allErrors = allErrors.concat(checkPlaywrightInstallDoc(bundles));
  const fm = validateFrontmatter(bundles);
  allErrors = allErrors.concat(fm.errors);
  if (fm.warnings.length) {
    // Full list in --check (the actionable place); one summary line in the
    // other modes so build/verify logs stay readable.
    if (checkOnly) for (const w of fm.warnings) console.error('WARN ' + w);
    else console.error(`WARN ${fm.warnings.length} source warning(s) — run npm run check to list them`);
  }

  if (verifyOnly) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-tools-verify-'));
    try {
      for (const name of selected) {
        const errors = buildBundle(name, bundles[name], tmp);
        allErrors = allErrors.concat(errors.map((e) => `[${name}] ${e}`));
      }
      allErrors = allErrors.concat(diffTrees(tmp, outDir, selected));
      // Only a full run can judge the whole plugins/ tree: with --bundle,
      // unrelated directories are expected to be there.
      if (bundleFlag < 0) allErrors = allErrors.concat(orphanPluginDirs(outDir, Object.keys(bundles)));
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  } else if (checkOnly) {
    // --check validates sources without writing any artifact.
    for (const name of selected) buildBundle(name, bundles[name], outDir, true);
  } else {
    // Atomic build: everything is staged in a sibling temp dir and swapped
    // into place only when the whole run succeeded, so a failure mid-build
    // can never leave plugins/ half-rebuilt (the drift gate would then
    // compare a mix of old and new artifacts).
    const staging = path.join(outDir, '.tmp-build');
    fs.rmSync(staging, { recursive: true, force: true });
    let built = [];
    try {
      fs.mkdirSync(staging, { recursive: true });
      for (const name of selected) {
        const errors = buildBundle(name, bundles[name], staging);
        if (errors.length) allErrors = allErrors.concat(errors.map((e) => `[${name}] ${e}`));
        else built.push(name);
      }
      if (!allErrors.length) {
        swapStagedBundles(staging, outDir, built);
        for (const name of built) console.log(`built: ${name}`);
      }
    } finally {
      fs.rmSync(staging, { recursive: true, force: true });
    }
  }

  if (allErrors.length) {
    console.error('\nERRORS:');
    for (const e of allErrors) console.error('  - ' + e);
    process.exit(1);
  }
  console.log(
    verifyOnly
      ? 'Committed plugins/ matches a fresh build.'
      : checkOnly
        ? 'All bundles valid.'
        : 'Done.'
  );
}

if (require.main === module) {
  main();
}

/* Exposed for scripts/build.test.js (node:test). No dependencies. */
module.exports = {
  buildBundle,
  setBundlesVersions,
  parseBundles,
  parseAgentMd,
  toolsOf,
  isMutating,
  truncateDescription,
  rewritePackSkill,
  appendEmojiStyle,
  listFiles,
  diffTrees,
  checkMembership,
  checkPlaywrightInstallDoc,
  validateFrontmatter,
  orphanPluginDirs,
  swapStagedBundles,
};
