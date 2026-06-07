'use strict';

const fs = require('fs');
const path = require('path');
const { mkdirp, copyDir } = require('./utils');

const TEMPLATE_DIR = path.join(__dirname, '..', 'templates', 'cursor-plugin');

function initCursorPlugin(destDir) {
  const abs = path.resolve(destDir);

  if (fs.existsSync(abs)) {
    const entries = fs.readdirSync(abs);
    const hasManifest = fs.existsSync(path.join(abs, 'package.json'));

    if (entries.length === 0) {
      // copy into empty dir
    } else if (hasManifest) {
      console.log(`\nCursor plugin already present at ${abs} (package.json exists). Nothing to do.\n`);
      return;
    } else {
      throw new Error(
        `Refusing to scaffold: ${abs} exists and is not empty (no package.json). ` +
          'Remove contents or choose another path.'
      );
    }
  }

  mkdirp(abs);
  copyDir(TEMPLATE_DIR, abs);

  console.log(`\nScaffolded Cursor plugin at ${abs}`);
  console.log('  Next: open this folder in Cursor and run F5 to test extension host.');
  console.log('  Then run command palette: AICrew: Start Multi-Tool Task\n');
}

function printCursorPluginHelp() {
  console.log(`
aicrew cursor-plugin - Cursor multi-tool extension scaffold

USAGE
  npx aicrew cursor-plugin init [path]

ARGUMENTS
  path        Directory to create (default: ./cursor-multi-tool-plugin)

Creates package.json, extension.js, README.md, and .vscodeignore from templates/cursor-plugin.
`);
}

module.exports = { initCursorPlugin, printCursorPluginHelp, TEMPLATE_DIR };
