'use strict';

// cli.js — interactive CLI for aicrew
//
// Commands:
//   aicrew install        — global setup: install skills, symlinks, hooks
//   aicrew update         — re-run install to pick up new skills (merge, no overwrites)
//   aicrew status         — show what is installed
//   aicrew --version / -v

const pkg       = require('../package.json');
const installer = require('./installer');
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
    'install          — first-time setup (skills, symlinks, hooks)',
    'update           — update global skills (merge, keeps your edits)',
    'status           — show what is installed',
    'exit',
  ]);

  switch (choice) {
    case 1: installer.install(); break;
    case 2: installer.install(); break;
    case 3: showStatus(); break;
    case 4: break;
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
  npx aicrew [command]

COMMANDS
  install        Install skills globally (~/.claude/skills/, hooks, symlinks)
  update         Re-run install to pick up new skills (preserves your edits)
  status         Show installed skills and active hooks
  --version      Show version

AFTER INSTALL
  Open Claude Code in any project directory and type:

    /dev             — full development pipeline (bug fix, feature, refactor)
    /fix             — fast bug fix (3 questions, no ceremony)
    /conclude        — save session learnings to memory
    /update-skills   — maintain skills + generate project-specific skills

  To add project-specific skills (audit, domain hooks, cursor rules):
    Open Claude Code in your repo, then type: /update-skills
    Choose option 2 "Generate project skills".
`);
}

function showStatus() {
  const fs   = require('fs');
  const path = require('path');
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
    console.log('\nProject skills: none (use /update-skills in Claude Code to generate)');
  }
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
