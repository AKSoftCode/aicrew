/* eslint-disable no-console */
'use strict';

const vscode = require('vscode');

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function createToolTerminal(label, toolCommand, sessionName, exportSessionVar) {
  const terminal = vscode.window.createTerminal({ name: label });
  terminal.show(true);

  if (exportSessionVar && sessionName) {
    terminal.sendText(`export AICREW_SESSION=${shellQuote(sessionName)}`, true);
  }

  terminal.sendText(toolCommand, true);
  return terminal;
}

function getConfig() {
  const cfg = vscode.workspace.getConfiguration('aicrewMultiTool');
  return {
    claude: cfg.get('claudeCommand', 'claude'),
    gemini: cfg.get('geminiCommand', 'gemini'),
    codex: cfg.get('codexCommand', 'codex'),
    exportSessionVar: cfg.get('exportSessionVar', true)
  };
}

async function startTask() {
  const sessionName = await vscode.window.showInputBox({
    prompt: 'Session/task name (used as AICREW_SESSION)',
    placeHolder: 'example: feature-auth-audit',
    ignoreFocusOut: true,
    validateInput(value) {
      if (!value || !value.trim()) {
        return 'Session name is required';
      }
      return null;
    }
  });

  if (!sessionName) {
    return;
  }

  const selection = await vscode.window.showQuickPick(
    [
      { label: 'Claude + Gemini + Codex', value: 'all' },
      { label: 'Claude + Gemini', value: 'claude-gemini' },
      { label: 'Claude + Codex', value: 'claude-codex' },
      { label: 'Claude only', value: 'claude' },
      { label: 'Gemini only', value: 'gemini' },
      { label: 'Codex only', value: 'codex' }
    ],
    {
      title: 'Select tools to launch',
      ignoreFocusOut: true
    }
  );

  if (!selection) {
    return;
  }

  const cfg = getConfig();
  const tools = [];

  if (selection.value === 'all' || selection.value === 'claude-gemini' || selection.value === 'claude-codex' || selection.value === 'claude') {
    tools.push({ label: `Claude (${sessionName})`, command: cfg.claude });
  }
  if (selection.value === 'all' || selection.value === 'claude-gemini' || selection.value === 'gemini') {
    tools.push({ label: `Gemini (${sessionName})`, command: cfg.gemini });
  }
  if (selection.value === 'all' || selection.value === 'claude-codex' || selection.value === 'codex') {
    tools.push({ label: `Codex (${sessionName})`, command: cfg.codex });
  }

  for (const tool of tools) {
    createToolTerminal(tool.label, tool.command, sessionName.trim(), cfg.exportSessionVar);
  }

  vscode.window.showInformationMessage(`AICrew multi-tool started: ${sessionName.trim()}`);
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('aicrewMultiTool.startTask', startTask)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('aicrewMultiTool.openClaude', () => {
      const cfg = getConfig();
      createToolTerminal('Claude', cfg.claude, '', false);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('aicrewMultiTool.openGemini', () => {
      const cfg = getConfig();
      createToolTerminal('Gemini', cfg.gemini, '', false);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('aicrewMultiTool.openCodex', () => {
      const cfg = getConfig();
      createToolTerminal('Codex', cfg.codex, '', false);
    })
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
