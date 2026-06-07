'use strict';

// Reads and writes ~/.claude/settings.json and project .claude/settings.json
// Manages hook registration.

const fs   = require('fs');
const path = require('path');
const { expandHome } = require('./utils');

function loadSettings(settingsPath) {
  if (fs.existsSync(settingsPath)) {
    try {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (_) {}
  }
  return {};
}

function saveSettings(settingsPath, settings) {
  const dir = path.dirname(settingsPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4), 'utf8');
}

function alreadyRegistered(hookList, scriptBasename) {
  return hookList.some(entry => JSON.stringify(entry).includes(scriptBasename));
}

// Register a Stop hook (e.g. session-memory.py)
function registerStopHook(settingsPath, scriptPath, scriptBasename) {
  const settings = loadSettings(settingsPath);
  const hooks    = settings.hooks  || (settings.hooks  = {});
  const stopList = hooks.Stop       || (hooks.Stop      = []);

  if (alreadyRegistered(stopList, scriptBasename)) {
    console.log(`  ↻  Already registered: ${scriptBasename}`);
  } else {
    stopList.push({ hooks: [{ type: 'command', command: `python3 ${scriptPath}` }] });
    console.log(`  ✓  Registered:       Stop → ${scriptBasename}`);
  }

  saveSettings(settingsPath, settings);
}

// Register a PreToolUse hook (e.g. security-guard.py, audit-guard.py)
function registerPreToolUseHook(settingsPath, scriptPath, scriptBasename, matcher = 'Edit|Write|MultiEdit') {
  const settings = loadSettings(settingsPath);
  const hooks    = settings.hooks      || (settings.hooks      = {});
  const preList  = hooks.PreToolUse    || (hooks.PreToolUse    = []);

  if (alreadyRegistered(preList, scriptBasename)) {
    console.log(`  ↻  Already registered: ${scriptBasename}`);
  } else {
    preList.push({ matcher, hooks: [{ type: 'command', command: `python3 ${scriptPath}` }] });
    console.log(`  ✓  Registered:       PreToolUse → ${scriptBasename}`);
  }

  saveSettings(settingsPath, settings);
}

// Merge MCP server entries from a TOML snippet into ~/.codex/config.toml.
// Only adds entries whose [mcp_servers.X] header is not already present.
function registerCodexMcpServers(codexConfigPath, mcpTomlSnippetPath) {
  if (!fs.existsSync(mcpTomlSnippetPath)) {
    console.log(`  ⚠  Missing MCP snippet: ${mcpTomlSnippetPath}`);
    return;
  }

  const snippet = fs.readFileSync(mcpTomlSnippetPath, 'utf8');
  let config = fs.existsSync(codexConfigPath)
    ? fs.readFileSync(codexConfigPath, 'utf8')
    : '';

  // Split snippet into per-server blocks (split on [mcp_servers. headers)
  const blocks = snippet.split(/(?=\[mcp_servers\.)/).filter(b => b.trim());
  for (const block of blocks) {
    const headerMatch = block.match(/^\[mcp_servers\.([^\]]+)\]/);
    if (!headerMatch) continue;
    const serverKey = headerMatch[1];
    if (config.includes(`[mcp_servers.${serverKey}]`)) {
      console.log(`  ↻  Already in Codex:  ${serverKey}`);
    } else {
      config += `\n${block.trim()}\n`;
      console.log(`  ✓  Added to Codex:   ${serverKey}`);
    }
  }

  fs.mkdirSync(path.dirname(codexConfigPath), { recursive: true });
  fs.writeFileSync(codexConfigPath, config, 'utf8');
}

module.exports = { loadSettings, saveSettings, registerStopHook, registerPreToolUseHook, registerCodexMcpServers };
