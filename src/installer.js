'use strict';

// installer.js — global `aicrew install`
//
// Copies skills to ~/.claude/skills/, creates command symlinks,
// and registers global hooks in ~/.claude/settings.json.

const fs   = require('fs');
const path = require('path');
const { expandHome, mkdirp, symlink, copyDir, run } = require('./utils');
const { registerStopHook, registerPreToolUseHook }  = require('./settings');

const SKILLS_PACKAGE_DIR = path.join(__dirname, '..', 'skills');
const SKILLS_TARGET_DIR  = expandHome('~/.claude/skills');
const COMMANDS_DIR       = expandHome('~/.claude/commands');
const SETTINGS_FILE      = expandHome('~/.claude/settings.json');
const AGENTS_DIR         = expandHome('~/Agents');

function install() {
  console.log('\n=== aicrew — Global Install ===\n');

  // 1. Copy skills to ~/.claude/skills/
  console.log('Skills:');
  if (!fs.existsSync(SKILLS_TARGET_DIR)) {
    copyDir(SKILLS_PACKAGE_DIR, SKILLS_TARGET_DIR);
    console.log(`  ✓  Copied skills to   ${SKILLS_TARGET_DIR}`);
  } else {
    // Merge: only copy files that don't exist yet (don't overwrite user edits)
    mergeSkills(SKILLS_PACKAGE_DIR, SKILLS_TARGET_DIR);
  }

  // 2. Command symlinks: ~/.claude/commands/*.md → ~/.claude/skills/commands/*.md
  console.log('\nCommands:');
  mkdirp(COMMANDS_DIR);
  const cmdsDir = path.join(SKILLS_TARGET_DIR, 'commands');
  if (fs.existsSync(cmdsDir)) {
    for (const f of fs.readdirSync(cmdsDir)) {
      if (!f.endsWith('.md')) continue;
      symlink(path.join(cmdsDir, f), path.join(COMMANDS_DIR, f));
    }
  }

  // 3. Register global hooks
  console.log('\nHooks:');
  const memScript = path.join(SKILLS_TARGET_DIR, 'hooks', 'session-memory.py');
  const secScript = path.join(SKILLS_TARGET_DIR, 'hooks', 'security-guard.py');
  registerStopHook(SETTINGS_FILE, memScript, 'session-memory.py');
  registerPreToolUseHook(SETTINGS_FILE, secScript, 'security-guard.py');

  // 4. ~/Agents symlink
  console.log('\nDocs:');
  mkdirp(AGENTS_DIR);
  const docSrc  = path.join(SKILLS_TARGET_DIR, 'SKILLS_SYSTEM.md');
  const docLink = path.join(AGENTS_DIR, 'SKILLS_SYSTEM.md');
  if (fs.existsSync(docSrc)) symlink(docSrc, docLink);

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
}

// Copy files from src that don't already exist in dest (preserve user edits)
function mergeSkills(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      mkdirp(d);
      mergeSkills(s, d);
    } else if (!fs.existsSync(d)) {
      fs.copyFileSync(s, d);
      console.log(`  ✓  Added:            ${path.relative(SKILLS_TARGET_DIR, d)}`);
    } else {
      console.log(`  ↻  Exists, kept:     ${path.relative(SKILLS_TARGET_DIR, d)}`);
    }
  }
}

module.exports = { install };
