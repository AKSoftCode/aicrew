'use strict';

// installer.js — global `aicrew install [platform]`
//
// Supported platforms:
//   aicrew install          → all platforms (default)
//   aicrew install all      → same as default
//   aicrew install claude   → ~/Agents/ + ~/.claude/ commands, skills, hooks, MCP
//   aicrew install cursor   → ~/Agents/ + ~/.cursor/mcp.json wired
//   aicrew install codex    → ~/Agents/ + ~/.codex/skills/ + config.toml MCP
//   aicrew install gemini   → ~/Agents/ populated + Gemini config instructions
//
// ~/Agents/ is always populated first — it is the shared source of truth that
// every platform-specific step references.

const fs   = require('fs');
const path = require('path');
const { expandHome, mkdirp, symlink, copyDir } = require('./utils');
const { registerStopHook, registerPreToolUseHook, registerCodexMcpServers }  = require('./settings');

const SKILLS_PACKAGE_DIR       = path.join(__dirname, '..', 'skills');
const SKILLS_TARGET_DIR        = expandHome('~/.claude/skills');
const COMMANDS_DIR             = expandHome('~/.claude/commands');
const SETTINGS_FILE            = expandHome('~/.claude/settings.json');
const AGENTS_DIR               = expandHome('~/Agents');
const CODEX_SKILLS_PACKAGE_DIR = path.join(__dirname, '..', 'codex-skills');
const CODEX_SKILLS_TARGET_DIR  = expandHome('~/.codex/skills');
const MCP_CONFIG_DIR           = path.join(__dirname, '..', 'config', 'mcp');
const CLAUDE_MCP_LINK          = expandHome('~/.claude/.mcp.json');
const CURSOR_MCP_LINK          = expandHome('~/.cursor/mcp.json');
const CODEX_CONFIG_FILE        = expandHome('~/.codex/config.toml');

// ─── Shared: ~/Agents/ ───────────────────────────────────────────────────────

function ensureAgents() {
  console.log('Shared assets (~/Agents/):');
  if (!fs.existsSync(AGENTS_DIR)) {
    copyDir(SKILLS_PACKAGE_DIR, AGENTS_DIR);
    console.log(`  ✓  Copied skills to   ${AGENTS_DIR}`);
  } else {
    mergeSkills(SKILLS_PACKAGE_DIR, AGENTS_DIR, AGENTS_DIR);
  }
}

// ─── Platform: Claude Code ───────────────────────────────────────────────────

function installClaude() {
  console.log('\n=== aicrew — Install: Claude Code ===\n');

  ensureAgents();

  // Skills copy to ~/.claude/skills/
  console.log('\nClaude skills (~/.claude/skills/):');
  if (!fs.existsSync(SKILLS_TARGET_DIR)) {
    copyDir(SKILLS_PACKAGE_DIR, SKILLS_TARGET_DIR);
    console.log(`  ✓  Copied skills to   ${SKILLS_TARGET_DIR}`);
  } else {
    mergeSkills(SKILLS_PACKAGE_DIR, SKILLS_TARGET_DIR, SKILLS_TARGET_DIR);
  }

  // Command symlinks: ~/.claude/commands/*.md → ~/Agents/commands/*.md
  console.log('\nCommands (~/.claude/commands/):');
  mkdirp(COMMANDS_DIR);
  const cmdsDir = path.join(AGENTS_DIR, 'commands');
  if (fs.existsSync(cmdsDir)) {
    for (const f of fs.readdirSync(cmdsDir)) {
      if (!f.endsWith('.md')) continue;
      symlink(path.join(cmdsDir, f), path.join(COMMANDS_DIR, f));
    }
  }

  // Hooks
  console.log('\nHooks (~/.claude/settings.json):');
  const memScript = path.join(AGENTS_DIR, 'hooks', 'session-memory.py');
  const secScript = path.join(AGENTS_DIR, 'hooks', 'security-guard.py');
  registerStopHook(SETTINGS_FILE, memScript, 'session-memory.py');
  registerPreToolUseHook(SETTINGS_FILE, secScript, 'security-guard.py');

  // MCP
  console.log('\nMCP servers:');
  symlinkMcp(path.join(MCP_CONFIG_DIR, 'claude.json'), CLAUDE_MCP_LINK, 'Claude Code');

  const cmdCount = fs.existsSync(COMMANDS_DIR)
    ? fs.readdirSync(COMMANDS_DIR).filter(f => f.endsWith('.md')).length
    : 0;

  console.log('\n=== Claude Code install complete ===');
  console.log(`Slash commands available (${cmdCount}): /dev /fix /quick /conclude`);
  console.log('  /brainstorm /session /handoff /lean   (/normal = /lean off)');
  console.log('  Maintenance (rare): /update-skills /harness-audit /benchmark');
  console.log('\nMCP config wired — install server binaries if not already done:');
  console.log('  npm install -g codebase-memory-mcp   # required for graph queries');
  console.log('  npm install -g token-optimizer-mcp   # optional');
  console.log('  # context-mode: no install needed (auto via npx)');
  console.log('  Run `aicrew install mcp` for the full checklist.');
  console.log('\nOpen Claude Code in any project and type /dev to start.');
}

// ─── Platform: Cursor ────────────────────────────────────────────────────────

function installCursor() {
  console.log('\n=== aicrew — Install: Cursor ===\n');

  ensureAgents();

  // Cursor MCP config
  console.log('\nMCP servers (~/.cursor/mcp.json):');
  const cursorLocalSrc    = path.join(MCP_CONFIG_DIR, 'cursor.local.json');
  const cursorTemplateSrc = path.join(MCP_CONFIG_DIR, 'cursor.json');
  if (!fs.existsSync(cursorLocalSrc) && fs.existsSync(cursorTemplateSrc)) {
    fs.copyFileSync(cursorTemplateSrc, cursorLocalSrc);
    console.log(`  ✓  Created local:     config/mcp/cursor.local.json (fill in real API keys)`);
  }
  symlinkMcp(cursorLocalSrc, CURSOR_MCP_LINK, 'Cursor');

  console.log('\n=== Cursor install complete ===');
  console.log('MCP config wired via ~/.cursor/mcp.json');
  console.log('\nNext steps:');
  console.log('  1. Install MCP server binaries (one-time per machine):');
  console.log('       npm install -g codebase-memory-mcp   # required for graph queries');
  console.log('       npm install -g token-optimizer-mcp   # optional token budgeting');
  console.log('       # context-mode: no install needed (auto via npx)');
  console.log('       Run `aicrew install mcp` for the full checklist.');
  console.log('  2. Fill in real API keys in: config/mcp/cursor.local.json');
  console.log('  3. Run `aicrew agent-kit init ./agent-kit` to set up shared Cursor rules');
  console.log('  4. Run `aicrew cursor-plugin init` to scaffold multi-tool terminal panel');
  console.log('\nSlash commands (/dev, /fix, /quick, etc.) available via Cursor\'s Claude integration.');
  console.log('Agents reference ~/Agents/ rules automatically.');
}

// ─── Platform: Codex ─────────────────────────────────────────────────────────

function installCodex() {
  console.log('\n=== aicrew — Install: Codex ===\n');

  ensureAgents();

  // Codex skills
  console.log('\nCodex skills (~/.codex/skills/):');
  if (fs.existsSync(CODEX_SKILLS_PACKAGE_DIR)) {
    if (!fs.existsSync(CODEX_SKILLS_TARGET_DIR)) {
      copyDir(CODEX_SKILLS_PACKAGE_DIR, CODEX_SKILLS_TARGET_DIR);
      console.log(`  ✓  Copied skills to   ${CODEX_SKILLS_TARGET_DIR}`);
    } else {
      mergeSkills(CODEX_SKILLS_PACKAGE_DIR, CODEX_SKILLS_TARGET_DIR, CODEX_SKILLS_TARGET_DIR);
    }
  } else {
    console.log(`  ⚠  Missing source:    ${CODEX_SKILLS_PACKAGE_DIR}`);
  }

  // Codex MCP via config.toml
  console.log('\nMCP servers (~/.codex/config.toml):');
  registerCodexMcpServers(CODEX_CONFIG_FILE, path.join(MCP_CONFIG_DIR, 'codex.toml'));

  const skillCount = fs.existsSync(CODEX_SKILLS_TARGET_DIR)
    ? fs.readdirSync(CODEX_SKILLS_TARGET_DIR).filter(d => d.startsWith('aicrew-') || d === 'brainstorm' || d === 'lean').length
    : 0;

  console.log('\n=== Codex install complete ===');
  console.log(`Skills available (${skillCount}): aicrew-dev, aicrew-fix, aicrew-quick, aicrew-conclude`);
  console.log('  aicrew-update-skills, aicrew-harness-audit, aicrew-benchmark, brainstorm, lean');
  console.log('  aicrew-install, aicrew-update, aicrew-status, aicrew-session, aicrew-handoff');
  console.log('\nMCP config patched — install server binary if not already done:');
  console.log('  npm install -g codebase-memory-mcp   # required for graph queries');
  console.log('  # context-mode: no install needed (auto via npx)');
  console.log('  Run `aicrew install mcp` for the full checklist.');
  console.log('\nInvoke via your Codex UI\'s skill picker.');
}

// ─── Platform: Gemini CLI ────────────────────────────────────────────────────

function installGemini() {
  console.log('\n=== aicrew — Install: Gemini CLI ===\n');

  ensureAgents();

  console.log('\n=== Gemini CLI setup ===');
  console.log('~/Agents/ is populated with all commands and agents.');
  console.log('');
  console.log('Gemini CLI wiring (manual steps — varies by Gemini CLI version):');
  console.log('');
  console.log('  Option A — if your Gemini CLI supports a commands path config:');
  console.log('    Point it to ~/Agents/commands/');
  console.log('    Slash commands (/dev, /fix, /quick, etc.) will be available.');
  console.log('');
  console.log('  Option B — reference commands directly:');
  console.log('    Paste contents of ~/Agents/commands/dev.md as a system prompt.');
  console.log('    Or reference ~/Agents/ in your Gemini config as a rules path.');
  console.log('');
  console.log("  Interactive checkpoints: use Gemini's native ask tool (e.g. `ask_human`) if available; otherwise end response and wait.");
  console.log('');
  console.log('  See: skills/docs/platform-entry-points.md for full Gemini notes.');
  console.log('  Gemini CLI docs: https://ai.google.dev/gemini-api/docs/gemini-cli');
}

// ─── All platforms ───────────────────────────────────────────────────────────

function install() {
  console.log('\n=== aicrew — Global Install (all platforms) ===\n');

  ensureAgents();

  // Claude Code
  console.log('\nClaude skills:');
  if (!fs.existsSync(SKILLS_TARGET_DIR)) {
    copyDir(SKILLS_PACKAGE_DIR, SKILLS_TARGET_DIR);
    console.log(`  ✓  Copied skills to   ${SKILLS_TARGET_DIR}`);
  } else {
    mergeSkills(SKILLS_PACKAGE_DIR, SKILLS_TARGET_DIR, SKILLS_TARGET_DIR);
  }

  console.log('\nCommands:');
  mkdirp(COMMANDS_DIR);
  const cmdsDir = path.join(AGENTS_DIR, 'commands');
  if (fs.existsSync(cmdsDir)) {
    for (const f of fs.readdirSync(cmdsDir)) {
      if (!f.endsWith('.md')) continue;
      symlink(path.join(cmdsDir, f), path.join(COMMANDS_DIR, f));
    }
  }

  console.log('\nHooks:');
  const memScript = path.join(AGENTS_DIR, 'hooks', 'session-memory.py');
  const secScript = path.join(AGENTS_DIR, 'hooks', 'security-guard.py');
  registerStopHook(SETTINGS_FILE, memScript, 'session-memory.py');
  registerPreToolUseHook(SETTINGS_FILE, secScript, 'security-guard.py');

  // Codex
  console.log('\nCodex skills:');
  if (fs.existsSync(CODEX_SKILLS_PACKAGE_DIR)) {
    if (!fs.existsSync(CODEX_SKILLS_TARGET_DIR)) {
      copyDir(CODEX_SKILLS_PACKAGE_DIR, CODEX_SKILLS_TARGET_DIR);
      console.log(`  ✓  Copied skills to   ${CODEX_SKILLS_TARGET_DIR}`);
    } else {
      mergeSkills(CODEX_SKILLS_PACKAGE_DIR, CODEX_SKILLS_TARGET_DIR, CODEX_SKILLS_TARGET_DIR);
    }
  } else {
    console.log(`  ⚠  Missing:           ${CODEX_SKILLS_PACKAGE_DIR}`);
  }

  // MCP configs
  console.log('\nMCP servers:');
  symlinkMcp(path.join(MCP_CONFIG_DIR, 'claude.json'), CLAUDE_MCP_LINK, 'Claude Code');
  const cursorLocalSrc    = path.join(MCP_CONFIG_DIR, 'cursor.local.json');
  const cursorTemplateSrc = path.join(MCP_CONFIG_DIR, 'cursor.json');
  if (!fs.existsSync(cursorLocalSrc) && fs.existsSync(cursorTemplateSrc)) {
    fs.copyFileSync(cursorTemplateSrc, cursorLocalSrc);
    console.log(`  ✓  Created local:     config/mcp/cursor.local.json (fill in real API keys)`);
  }
  symlinkMcp(cursorLocalSrc, CURSOR_MCP_LINK, 'Cursor');
  registerCodexMcpServers(CODEX_CONFIG_FILE, path.join(MCP_CONFIG_DIR, 'codex.toml'));

  // Summary
  const cmdCount = fs.existsSync(COMMANDS_DIR)
    ? fs.readdirSync(COMMANDS_DIR).filter(f => f.endsWith('.md')).length
    : 0;

  console.log('\n=== Install complete ===');
  console.log(`Commands available: ${cmdCount}`);
  console.log('\nClaude Code:   /dev  /fix  /quick  /conclude  /brainstorm');
  console.log('               /session  /handoff  /lean   (/normal = /lean off)');
  console.log('               Maintenance (rare): /update-skills  /harness-audit  /benchmark');
  console.log('\nCodex:         aicrew-dev  aicrew-fix  aicrew-quick  aicrew-conclude');
  console.log('               aicrew-harness-audit  aicrew-update-skills  brainstorm  lean');
  console.log('               aicrew-install  aicrew-update  aicrew-status');
  console.log('               aicrew-session  aicrew-handoff  aicrew-normal');
  console.log('\nCursor:        Slash commands via Claude integration; MCP wired; see agent-kit');
  console.log('Gemini CLI:    ~/Agents/ populated; wire manually per Gemini CLI config');
  console.log('\nMCP config wired — install server binaries if not already done (one-time):');
  console.log('  npm install -g codebase-memory-mcp   # required for graph queries');
  console.log('  npm install -g token-optimizer-mcp   # optional (Cursor)');
  console.log('  # context-mode: no install needed (auto via npx)');
  console.log('  Run `aicrew install mcp` for the full checklist with paths and notes.');
  console.log('\nRun `aicrew status` to verify per-platform install state.');
}

// ─── MCP server install checklist ────────────────────────────────────────────

function installMcp() {
  console.log('\n=== aicrew — MCP Server Setup ===\n');
  console.log('`aicrew install` wires MCP config files only — it does NOT install server binaries.');
  console.log('Run the commands below once per machine to install the servers themselves.\n');

  console.log('1. codebase-memory-mcp  (required — powers graph queries, ~500 tok vs ~80K grep)');
  console.log('   npm install -g codebase-memory-mcp');
  console.log('   Binary lands at: ~/.local/bin/codebase-memory-mcp  (or your npm global bin)');
  console.log('   Source: https://github.com/DeusData/codebase-memory-mcp\n');

  console.log('2. context-mode  (no install needed)');
  console.log('   Config uses `npx -y context-mode` — auto-downloaded on first MCP use.\n');

  console.log('3. token-optimizer-mcp  (optional — Cursor only)');
  console.log('   npm install -g token-optimizer-mcp');
  console.log('   Cursor config points to the global node_modules dist path.\n');

  console.log('After installing, restart your AI tool to pick up the new servers.');
  console.log('Verify with: aicrew status');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mergeSkills(src, dest, baseDir) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      mkdirp(d);
      mergeSkills(s, d, baseDir);
    } else if (!fs.existsSync(d)) {
      fs.copyFileSync(s, d);
      console.log(`  ✓  Added:            ${path.relative(baseDir, d)}`);
    } else {
      console.log(`  ↻  Exists, kept:     ${path.relative(baseDir, d)}`);
    }
  }
}

function symlinkMcp(src, link, label) {
  if (!fs.existsSync(src)) {
    console.log(`  ⚠  Missing source:    ${src}`);
    return;
  }
  if (fs.existsSync(link) || fs.existsSync(link.replace(/\/$/, ''))) {
    try {
      const stat = fs.lstatSync(link);
      if (stat.isSymbolicLink()) {
        const current = fs.readlinkSync(link);
        if (current === src) {
          console.log(`  ↻  Already linked:   ${label} (${link})`);
          return;
        }
        fs.unlinkSync(link);
      } else {
        const backup = link + '.bak';
        fs.renameSync(link, backup);
        console.log(`  ✓  Backed up:        ${backup}`);
      }
    } catch (_) {}
  }
  mkdirp(path.dirname(link));
  fs.symlinkSync(src, link);
  console.log(`  ✓  Linked:           ${label} → ${path.basename(src)}`);
}

module.exports = { install, installClaude, installCursor, installCodex, installGemini, installMcp };
