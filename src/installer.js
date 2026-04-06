'use strict';

// installer.js — global `aicrew install`
//
// Installs the package skills into ~/Agents and ~/.claude/skills/,
// creates command symlinks, and registers global hooks in ~/.claude/settings.json.

const fs   = require('fs');
const path = require('path');
const { expandHome, mkdirp, symlink, copyDir, run } = require('./utils');
const { registerStopHook, registerPreToolUseHook }  = require('./settings');

const SKILLS_PACKAGE_DIR      = path.join(__dirname, '..', 'skills');
const SKILLS_TARGET_DIR       = expandHome('~/.claude/skills');
const COMMANDS_DIR            = expandHome('~/.claude/commands');
const SETTINGS_FILE           = expandHome('~/.claude/settings.json');
const AGENTS_DIR              = expandHome('~/Agents');
const CODEX_SKILLS_PACKAGE_DIR = path.join(__dirname, '..', 'codex-skills');
const CODEX_SKILLS_TARGET_DIR  = expandHome('~/.codex/skills');

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

  // Summary
  const cmdCount = fs.existsSync(COMMANDS_DIR)
    ? fs.readdirSync(COMMANDS_DIR).filter(f => f.endsWith('.md')).length
    : 0;

  console.log('\n=== Install complete ===');
  console.log(`Commands available: ${cmdCount}`);
  console.log('\nAvailable commands in Claude Code:');
  console.log('  /dev             — start the development pipeline');
  console.log('  /conclude        — wrap up a session and save learnings');
  console.log('  /update-skills   — maintain and evolve the skills system');
  console.log('\nAvailable skills in Codex:');
  console.log('  $aicrew-dev, $brainstorm, $aicrew-fix, $aicrew-conclude');
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

module.exports = { install };
