'use strict';

// cli.js — interactive CLI for aicrew
//
// Commands:
//   aicrew install        — global setup: install skills, symlinks, hooks
//   aicrew add-project    — generate .ai/skills/ for the current project
//   aicrew update         — re-run install to pick up new skills (merge, no overwrites)
//   aicrew status         — show what is installed
//   aicrew --version / -v

const pkg       = require('../package.json');
const installer = require('./installer');
const project   = require('./project');
const { menu }  = require('./utils');

const args = process.argv.slice(2);

async function main() {
  const cmd = args[0];

  if (cmd === '--version' || cmd === '-v' || cmd === 'version') {
    console.log(`aicrew v${pkg.version}`);
    return;
  }

  if (cmd === '--help' || cmd === '-h' || cmd === 'help') {
    printHelp();
    return;
  }

  if (cmd === 'install') {
    installer.install();
    return;
  }

  if (cmd === 'add-project') {
    await project.addProject(process.cwd());
    return;
  }

  if (cmd === 'update') {
    console.log('Re-running install to merge new skills...');
    installer.install();
    return;
  }

  if (cmd === 'status') {
    showStatus();
    return;
  }

  // No command — interactive menu
  printBanner();
  const choice = await menu('What would you like to do?', [
    'install          — global setup (skills, symlinks, hooks)',
    'add-project      — add .ai/skills/ to this project',
    'update           — update global skills (merge, keeps your edits)',
    'status           — show what is installed',
    'exit',
  ]);

  switch (choice) {
    case 1: installer.install(); break;
    case 2: await project.addProject(process.cwd()); break;
    case 3: installer.install(); break;
    case 4: showStatus(); break;
    case 5: break;
  }
}

function printBanner() {
  console.log(`
  ╔═══════════════════════════════════╗
  ║   aicrew v${pkg.version.padEnd(6)}                 ║
  ║   Adaptive AI development skills  ║
  ╚═══════════════════════════════════╝
  `);
}

function printHelp() {
  console.log(`
aicrew v${pkg.version} — Adaptive AI development pipeline

USAGE
  aicrew [command]

COMMANDS
  install        Install skills globally (~/.claude/skills/, hooks, symlinks)
  add-project    Generate .ai/skills/ for the current project
  update         Re-run install to pick up new skills (preserves your edits)
  status         Show installed skills and active hooks
  --version      Show version

AFTER INSTALL
  In Claude Code:
    /dev             — start the adaptive development pipeline
    /conclude        — wrap up a session and save learnings
    /update-skills   — maintain and evolve the skills system

  Project skills live in .ai/skills/ — commit them to your repo.
`);
}

function showStatus() {
  const fs   = require('fs');
  const path = require('path');
  const os   = require('os');
  const { expandHome } = require('./utils');

  const skillsDir   = expandHome('~/.claude/skills');
  const commandsDir = expandHome('~/.claude/commands');
  const settingsFile = expandHome('~/.claude/settings.json');

  console.log('\n=== aicrew status ===\n');

  // Global skills
  const dirs = ['commands', 'agents', 'hooks'];
  for (const d of dirs) {
    const p = path.join(skillsDir, d);
    if (fs.existsSync(p)) {
      const files = fs.readdirSync(p);
      console.log(`Global ${d}: ${files.join(', ')}`);
    } else {
      console.log(`Global ${d}: (not installed)`);
    }
  }

  // Command symlinks
  if (fs.existsSync(commandsDir)) {
    const cmds = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
    console.log(`\nCommand symlinks: ${cmds.map(f => '/' + f.replace('.md', '')).join(', ')}`);
  }

  // Hooks
  if (fs.existsSync(settingsFile)) {
    try {
      const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      const hooks = settings.hooks || {};
      console.log('\nRegistered hooks:');
      for (const [event, list] of Object.entries(hooks)) {
        for (const entry of list) {
          for (const h of (entry.hooks || [])) {
            console.log(`  ${event}: ${h.command}`);
          }
        }
      }
    } catch (_) {
      console.log('\nHooks: (could not read settings.json)');
    }
  }

  // Project skills
  const projectSkillsDir = path.join(process.cwd(), '.ai', 'skills');
  if (fs.existsSync(projectSkillsDir)) {
    console.log(`\nProject skills (.ai/skills/):`);
    for (const d of dirs) {
      const p = path.join(projectSkillsDir, d);
      if (fs.existsSync(p)) {
        const files = fs.readdirSync(p);
        if (files.length) console.log(`  ${d}: ${files.join(', ')}`);
      }
    }
  } else {
    console.log('\nProject skills: none (run: aicrew add-project)');
  }
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
