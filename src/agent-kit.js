'use strict';

// Scaffold templates/agent-kit → target directory (Cursor rules SOT layout).

const fs   = require('fs');
const path = require('path');
const { mkdirp, copyDir } = require('./utils');

const TEMPLATE_DIR = path.join(__dirname, '..', 'templates', 'agent-kit');

function initAgentKit(destDir) {
  const abs = path.resolve(destDir);

  if (fs.existsSync(abs)) {
    const entries = fs.readdirSync(abs);
    const hasInstall = fs.existsSync(path.join(abs, 'install.sh'));
    if (entries.length === 0) {
      // copy into empty dir
    } else if (hasInstall) {
      console.log(`\nAgent kit already present at ${abs} (install.sh exists). Nothing to do.\n`);
      return;
    } else {
      throw new Error(
        `Refusing to scaffold: ${abs} exists and is not empty (no install.sh). ` +
          'Remove contents or choose another path.'
      );
    }
  }

  mkdirp(abs);
  copyDir(TEMPLATE_DIR, abs);

  try {
    fs.chmodSync(path.join(abs, 'install.sh'), 0o755);
  } catch (_) {
    /* non-fatal */
  }

  console.log(`\n✓  Scaffolded agent-kit at ${abs}`);
  console.log('   • Add .mdc files under repos/<product>/cursor-rules/');
  console.log('   • Edit install.sh — set the SETUPS array to each repo’s .ai/skills/setup.sh');
  console.log('   • Run: bash install.sh\n');
}

function printAgentKitHelp() {
  console.log(`
aicrew agent-kit — Cursor rules single source of truth

USAGE
  npx aicrew agent-kit init [path]

ARGUMENTS
  path        Directory to create (default: ./agent-kit)

Creates README, VERSION, install.sh, repos/, and shared/skills/ from the aicrew template.
`);
}

module.exports = { initAgentKit, printAgentKitHelp, TEMPLATE_DIR };
