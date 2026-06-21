'use strict';

// cli.js — interactive CLI for aicrew
//
// Commands:
//   aicrew install [platform]  — global or targeted platform setup
//   aicrew update              — re-run install to pick up new skills (merge, no overwrites)
//   aicrew status              — show per-platform install state
//   aicrew --version / -v
//
// Platforms for `aicrew install <platform>`:
//   claude   — ~/Agents/ + ~/.claude/ commands, skills, hooks, MCP
//   cursor   — ~/Agents/ + ~/.cursor/mcp.json
//   codex    — ~/Agents/ + ~/.codex/skills/ + config.toml MCP
//   gemini   — ~/Agents/ populated + Gemini config instructions
//   all      — all platforms (default)

const path      = require('path');
const pkg       = require('../package.json');
const installer = require('./installer');
const agentKit  = require('./agent-kit');
const cursorPlugin = require('./cursor-plugin');
const benchmark = require('./benchmark');
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
    const platform = (args[1] || '').toLowerCase();
    switch (platform) {
      case 'claude':  installer.installClaude();  break;
      case 'cursor':  installer.installCursor();  break;
      case 'codex':   installer.installCodex();   break;
      case 'gemini':  installer.installGemini();  break;
      case 'mcp':     installer.installMcp();     break;
      case 'all':
      case '':
      default:        installer.install();        break;
    }
    return;
  }

  if (cmd === 'update') {
    const platform = (args[1] || '').toLowerCase();
    console.log('Re-running install to merge new skills...');
    switch (platform) {
      case 'claude':  installer.installClaude();  break;
      case 'cursor':  installer.installCursor();  break;
      case 'codex':   installer.installCodex();   break;
      case 'gemini':  installer.installGemini();  break;
      default:        installer.install();        break;
    }
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

  if (cmd === 'benchmark') {
    benchmark.runBenchmark(args.slice(1));
    return;
  }

  // No command — interactive menu
  printBanner();
  const choice = await menu('What would you like to do?', [
    'install all      — first-time setup (all platforms: Claude, Cursor, Codex, Gemini)',
    'install claude   — Claude Code only (commands, skills, hooks, MCP)',
    'install cursor   — Cursor only (MCP config)',
    'install codex    — Codex only (skills, config.toml)',
    'install gemini   — Gemini CLI (~/Agents/ + setup instructions)',
    'status           — show per-platform install state',
    'benchmark        — estimate token savings for this project',
    'agent-kit init   — scaffold Cursor-rules single source of truth (./agent-kit)',
    'cursor-plugin init — scaffold Cursor extension for multi-tool terminals',
    'exit',
  ]);

  switch (choice) {
    case 1: installer.install(); break;
    case 2: installer.installClaude(); break;
    case 3: installer.installCursor(); break;
    case 4: installer.installCodex(); break;
    case 5: installer.installGemini(); break;
    case 6: showStatus(); break;
    case 7: benchmark.runBenchmark(['--report']); break;
    case 8: {
      const def = path.join(process.cwd(), 'agent-kit');
      const answer = await ask(`Directory for agent-kit [${def}]: `);
      const dest = answer.trim() || def;
      agentKit.initAgentKit(dest);
      break;
    }
    case 9: {
      const def = path.join(process.cwd(), 'cursor-multi-tool-plugin');
      const answer = await ask(`Directory for cursor plugin [${def}]: `);
      const dest = answer.trim() || def;
      cursorPlugin.initCursorPlugin(dest);
      break;
    }
    case 10: break;
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
  npx aicrew [command] [options]

COMMANDS
  install [platform]     Install for all platforms or one platform
  update  [platform]     Re-run install to pick up new skills (preserves your edits)
  status                 Show per-platform install state
  benchmark [options]    Estimate token savings for a project (--report writes .ai/reports/)
  agent-kit init [path]  Scaffold Cursor-rules single source of truth (default: ./agent-kit)
  cursor-plugin init [path]  Scaffold Cursor extension (default: ./cursor-multi-tool-plugin)
  --version              Show version

INSTALL PLATFORMS
  aicrew install             All platforms (default)
  aicrew install all         Same as above
  aicrew install claude      Claude Code: ~/Agents/, ~/.claude/commands/, hooks, MCP
  aicrew install cursor      Cursor: ~/Agents/, ~/.cursor/mcp.json
  aicrew install codex       Codex: ~/Agents/, ~/.codex/skills/, config.toml MCP
  aicrew install gemini      Gemini CLI: ~/Agents/ populated + setup instructions
  aicrew install mcp         Print MCP server install checklist (binaries / npm packages)

  ~/Agents/ is always populated as shared source of truth — even for platform-specific installs.

  NOTE: `aicrew install` wires MCP config files only. To install the MCP server binaries:
    npm install -g codebase-memory-mcp   # required for graph queries
    npm install -g token-optimizer-mcp   # optional (Cursor)
    # context-mode: no install needed — auto via npx

AFTER INSTALL
  Claude Code — slash commands:
    /dev             — full development pipeline (bug fix, feature, refactor)
    /fix             — fast bug fix (3 questions, no ceremony)
    /quick           — Scout → Act (graph-first, Karpathy guardrails)
    /conclude        — save session learnings to memory
    /update-skills   — maintain skills + generate project-specific skills
    /install  /update  /status  /agent-kit  /cursor-plugin
    /benchmark  /brainstorm  /session  /handoff  /lean  /normal

  Codex — skill names:
    aicrew-dev, aicrew-fix, aicrew-quick, aicrew-conclude, aicrew-harness-audit
    aicrew-update-skills, brainstorm, lean
    aicrew-install, aicrew-update, aicrew-status, aicrew-session, aicrew-handoff

  Cursor — slash commands via Claude integration; MCP wired; rules from ~/Agents/agents/
  Gemini — slash commands if configured; ~/Agents/ as rules reference
  Antigravity — slash commands from ~/Agents/commands/

  Full matrix: skills/docs/platform-entry-points.md
`);
}

function showStatus() {
  const fs   = require('fs');
  const path = require('path');
  const { expandHome } = require('./utils');

  const skillsDir      = expandHome('~/.claude/skills');
  const commandsDir    = expandHome('~/.claude/commands');
  const settingsFile   = expandHome('~/.claude/settings.json');
  const codexSkillsDir = expandHome('~/.codex/skills');
  const sharedDir      = expandHome('~/Agents');
  const cursorMcpLink  = expandHome('~/.cursor/mcp.json');
  const claudeMcpLink  = expandHome('~/.claude/.mcp.json');

  const ok  = (s) => `  ✓  ${s}`;
  const warn = (s) => `  ⚠  ${s}`;

  console.log('\n=== aicrew status ===\n');

  // ── Shared
  const sharedOk = fs.existsSync(sharedDir);
  console.log(`Shared assets (~/Agents/):     ${sharedOk ? ok(sharedDir) : warn('not installed — run `aicrew install`')}`);

  // ── Claude Code
  console.log('\nClaude Code:');
  const cmdCount = fs.existsSync(commandsDir)
    ? fs.readdirSync(commandsDir).filter(f => f.endsWith('.md')).length
    : 0;
  if (cmdCount > 0) {
    const cmds = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'))
      .map(f => '/' + f.replace('.md', '')).join(', ');
    console.log(ok(`~/.claude/commands/ — ${cmdCount} commands: ${cmds}`));
  } else {
    console.log(warn('~/.claude/commands/ — not installed (run `aicrew install claude`)'));
  }

  const skillsOk = fs.existsSync(skillsDir);
  console.log(skillsOk
    ? ok(`~/.claude/skills/ — installed`)
    : warn('~/.claude/skills/ — not installed'));

  // Hooks
  if (fs.existsSync(settingsFile)) {
    try {
      const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      const hooks = settings.hooks || {};
      const hookNames = [];
      for (const [, list] of Object.entries(hooks)) {
        for (const entry of list) {
          for (const h of (entry.hooks || [])) {
            const name = h.command.split('/').pop();
            hookNames.push(name);
          }
        }
      }
      console.log(hookNames.length
        ? ok(`hooks registered: ${hookNames.join(', ')}`)
        : warn('no hooks registered in ~/.claude/settings.json'));
    } catch (_) {
      console.log(warn('could not read ~/.claude/settings.json'));
    }
  } else {
    console.log(warn('~/.claude/settings.json — not found'));
  }

  const claudeMcpOk = fs.existsSync(claudeMcpLink);
  console.log(claudeMcpOk
    ? ok(`~/.claude/.mcp.json — MCP linked`)
    : warn('~/.claude/.mcp.json — not linked (run `aicrew install claude`)'));

  // ── Cursor
  console.log('\nCursor:');
  try {
    const stat = fs.lstatSync(cursorMcpLink);
    const linked = stat.isSymbolicLink();
    console.log(linked
      ? ok(`~/.cursor/mcp.json — MCP linked`)
      : ok(`~/.cursor/mcp.json — exists (not a symlink)`));
  } catch (_) {
    console.log(warn('~/.cursor/mcp.json — not linked (run `aicrew install cursor`)'));
  }

  // ── Codex
  console.log('\nCodex:');
  if (fs.existsSync(codexSkillsDir)) {
    const codexSkills = fs.readdirSync(codexSkillsDir)
      .filter(d => d.startsWith('aicrew-') || d === 'brainstorm' || d === 'lean')
      .sort();
    console.log(codexSkills.length
      ? ok(`~/.codex/skills/ — ${codexSkills.length} skills: ${codexSkills.join(', ')}`)
      : warn('~/.codex/skills/ — no aicrew skills found'));
  } else {
    console.log(warn('~/.codex/skills/ — not installed (run `aicrew install codex`)'));
  }

  // ── Gemini
  console.log('\nGemini CLI:');
  console.log(sharedOk
    ? ok('~/Agents/ populated — manual Gemini CLI config needed (see skills/docs/platform-entry-points.md)')
    : warn('~/Agents/ not populated — run `aicrew install gemini`'));

  // ── Project skills
  console.log('');
  const projectSkillsDir = path.join(process.cwd(), '.ai', 'skills');
  if (fs.existsSync(projectSkillsDir)) {
    console.log(`Project skills (.ai/skills/): found`);
    for (const d of ['commands', 'agents', 'hooks']) {
      const p = path.join(projectSkillsDir, d);
      if (fs.existsSync(p)) {
        const files = fs.readdirSync(p);
        if (files.length) console.log(`  ${d}: ${files.join(', ')}`);
      }
    }
  } else {
    console.log('Project skills: none (use /update-skills in Claude Code to generate)');
  }
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
