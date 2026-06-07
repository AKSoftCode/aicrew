'use strict';

// cli.js — interactive CLI for aicrew
//
// Commands:
//   aicrew install        — global setup: install skills, symlinks, hooks
//   aicrew update         — re-run install to pick up new skills (merge, no overwrites)
//   aicrew status         — show what is installed
//   aicrew --version / -v

const path      = require('path');
const pkg       = require('../package.json');
const installer = require('./installer');
const agentKit  = require('./agent-kit');
const cursorPlugin = require('./cursor-plugin');
const { menu, ask } = require('./utils');

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

  if (cmd === 'agent-kit') {
    const sub = args[1];
    const dest = args[2] || path.join(process.cwd(), 'agent-kit');
    if (sub === 'init' || sub === 'scaffold') {
      agentKit.initAgentKit(dest);
      return;
    }
    agentKit.printAgentKitHelp();
    return;
  }

  if (cmd === 'cursor-plugin') {
    const sub = args[1];
    const dest = args[2] || path.join(process.cwd(), 'cursor-multi-tool-plugin');
    if (sub === 'init' || sub === 'scaffold') {
      cursorPlugin.initCursorPlugin(dest);
      return;
    }
    cursorPlugin.printCursorPluginHelp();
    return;
  }

  // No command — interactive menu
  printBanner();
  const choice = await menu('What would you like to do?', [
    'install          — first-time setup (skills, symlinks, hooks)',
    'update           — update global skills (merge, keeps your edits)',
    'status           — show what is installed',
    'agent-kit init   — scaffold Cursor-rules single source of truth (./agent-kit)',
    'cursor-plugin init — scaffold Cursor extension for multi-tool terminals',
    'exit',
  ]);

  switch (choice) {
    case 1: installer.install(); break;
    case 2: installer.install(); break;
    case 3: showStatus(); break;
    case 4: {
      const def = path.join(process.cwd(), 'agent-kit');
      const answer = await ask(`Directory for agent-kit [${def}]: `);
      const dest = answer.trim() || def;
      agentKit.initAgentKit(dest);
      break;
    }
    case 5: {
      const def = path.join(process.cwd(), 'cursor-multi-tool-plugin');
      const answer = await ask(`Directory for cursor plugin [${def}]: `);
      const dest = answer.trim() || def;
      cursorPlugin.initCursorPlugin(dest);
      break;
    }
    case 6: break;
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
  install        Install skills globally (~/.claude/skills/, ~/.codex/skills, hooks, symlinks)
  update         Re-run install to pick up new skills (preserves your edits)
  status         Show installed skills and active hooks
  agent-kit init [path]      Scaffold Cursor-rules single source of truth (default: ./agent-kit)
  cursor-plugin init [path]   Scaffold Cursor extension (default: ./cursor-multi-tool-plugin)
  --version      Show version

AFTER INSTALL
  Open Claude Code in any project directory and type:

    /dev             — full development pipeline (bug fix, feature, refactor)
    /fix             — fast bug fix (3 questions, no ceremony)
    /conclude        — save session learnings to memory
    /update-skills   — maintain skills + generate project-specific skills

  In Codex, use the aicrew-* skills and $brainstorm (no slash commands).

  To add project-specific skills (audit, domain hooks, cursor rules):
    Open Claude Code in your repo, then type: /update-skills
    Choose option 2 "Generate project skills".

  To share Cursor .mdc rules across repos (single source of truth + symlinks):
    npx aicrew agent-kit init ./agent-kit

  To scaffold a Cursor extension for Claude/Gemini/Codex terminals:
    npx aicrew cursor-plugin init ./cursor-multi-tool-plugin
`);
}

function showStatus() {
  const fs   = require('fs');
  const path = require('path');
  const { expandHome } = require('./utils');

  const skillsDir   = expandHome('~/.claude/skills');
  const commandsDir = expandHome('~/.claude/commands');
  const settingsFile = expandHome('~/.claude/settings.json');
  const codexSkillsDir = expandHome('~/.codex/skills');
  const sharedDir = expandHome('~/Agents');

  console.log('\n=== aicrew status ===\n');

  console.log(`Shared assets: ${fs.existsSync(sharedDir) ? sharedDir : '(not installed)'}`);

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

  // Codex skills
  if (fs.existsSync(codexSkillsDir)) {
    const codexSkills = fs.readdirSync(codexSkillsDir)
      .filter(d => d.startsWith('aicrew-') || d === 'brainstorm' || d === 'lean');
    console.log(`\nCodex skills: ${codexSkills.length ? codexSkills.join(', ') : '(not installed)'}`);
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
