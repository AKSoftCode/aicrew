'use strict';

// installer.js — global `aicrew install`
//
// Installs the package skills into ~/Agents and ~/.claude/skills/,
// creates command symlinks, and registers global hooks in ~/.claude/settings.json.

const fs   = require('fs');
const path = require('path');
const { expandHome, mkdirp, symlink, copyDir, run } = require('./utils');
const { registerStopHook, registerPreToolUseHook, registerCodexMcpServers }  = require('./settings');

const SKILLS_PACKAGE_DIR      = path.join(__dirname, '..', 'skills');
const SKILLS_TARGET_DIR       = expandHome('~/.claude/skills');
const COMMANDS_DIR            = expandHome('~/.claude/commands');
const SETTINGS_FILE           = expandHome('~/.claude/settings.json');
const AGENTS_DIR              = expandHome('~/Agents');
const CODEX_SKILLS_PACKAGE_DIR = path.join(__dirname, '..', 'codex-skills');
const CODEX_SKILLS_TARGET_DIR  = expandHome('~/.codex/skills');
const MCP_CONFIG_DIR          = path.join(__dirname, '..', 'config', 'mcp');
const CLAUDE_MCP_LINK         = expandHome('~/.claude/.mcp.json');
const CURSOR_MCP_LINK         = expandHome('~/.cursor/mcp.json');
const CODEX_CONFIG_FILE       = expandHome('~/.codex/config.toml');

function install() {
  console.log('\n=== aicrew — Global Install ===\n');

  // 1. Install package source-of-truth assets to ~/Agents
  console.log('Shared assets:');
  if (!fs.existsSync(AGENTS_DIR)) {
    copyDir(SKILLS_PACKAGE_DIR, AGENTS_DIR);
    console.log(`  ✓  Copied skills to   ${AGENTS_DIR}`);
  } else {
    mergeSkills(SKILLS_PACKAGE_DIR, AGENTS_DIR, AGENTS_DIR);
  }

  // 2. Copy skills to ~/.claude/skills/
  console.log('\nClaude skills:');
  if (!fs.existsSync(SKILLS_TARGET_DIR)) {
    copyDir(SKILLS_PACKAGE_DIR, SKILLS_TARGET_DIR);
    console.log(`  ✓  Copied skills to   ${SKILLS_TARGET_DIR}`);
  } else {
    mergeSkills(SKILLS_PACKAGE_DIR, SKILLS_TARGET_DIR, SKILLS_TARGET_DIR);
  }

  // 3. Command symlinks: ~/.claude/commands/*.md → ~/Agents/commands/*.md
  console.log('\nCommands:');
  mkdirp(COMMANDS_DIR);
  const cmdsDir = path.join(AGENTS_DIR, 'commands');
  if (fs.existsSync(cmdsDir)) {
    for (const f of fs.readdirSync(cmdsDir)) {
      if (!f.endsWith('.md')) continue;
      symlink(path.join(cmdsDir, f), path.join(COMMANDS_DIR, f));
    }
  }

  // 4. Register global hooks
  console.log('\nHooks:');
  const memScript = path.join(AGENTS_DIR, 'hooks', 'session-memory.py');
  const secScript = path.join(AGENTS_DIR, 'hooks', 'security-guard.py');
  registerStopHook(SETTINGS_FILE, memScript, 'session-memory.py');
  registerPreToolUseHook(SETTINGS_FILE, secScript, 'security-guard.py');

  // 5. Codex skills (tool-agnostic entry points)
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

  // 6. MCP configs — symlink Claude + Cursor, patch Codex
  console.log('\nMCP servers:');
  symlinkMcp(path.join(MCP_CONFIG_DIR, 'claude.json'), CLAUDE_MCP_LINK, 'Claude Code');
  // Cursor uses cursor.local.json (gitignored) so real API keys stay off git.
  // If cursor.local.json doesn't exist yet, seed it from the template.
  const cursorLocalSrc = path.join(MCP_CONFIG_DIR, 'cursor.local.json');
  const cursorTemplateSrc = path.join(MCP_CONFIG_DIR, 'cursor.json');
  if (!fs.existsSync(cursorLocalSrc)) {
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
  console.log('\nAvailable commands in Claude Code:');
  console.log('  /dev             — start the development pipeline');
  console.log('  /quick           — Scout → Act (graph-first, Karpathy guardrails)');
  console.log('  /conclude        — wrap up a session and save learnings');
  console.log('  /update-skills   — maintain and evolve the skills system');
  console.log('  /install  /update  /status  /agent-kit  /cursor-plugin');
  console.log('  /benchmark  /brainstorm  /session  /handoff  /lean  /terse  /normal');
  console.log('\nAvailable skills in Codex:');
  console.log('  aicrew-dev, aicrew-fix, aicrew-quick, aicrew-conclude, aicrew-harness-audit, aicrew-update-skills');
  console.log('  aicrew-install, aicrew-update, aicrew-status, aicrew-agent-kit, aicrew-cursor-plugin');
  console.log('  aicrew-session, aicrew-handoff, aicrew-benchmark, aicrew-terse, aicrew-normal');
  console.log('  brainstorm, lean');
}

// Copy files from src that don't already exist in dest (preserve user edits)
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

// Symlink an MCP config file, backing up any existing regular file first.
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

module.exports = { install };
