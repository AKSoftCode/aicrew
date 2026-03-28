'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Prompt user with a question, return trimmed answer (sync via readline)
function ask(question) {
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Ask a yes/no question. Returns true for y/yes, false otherwise.
// Default: pass 'y' or 'n' as defaultAnswer
async function confirm(question, defaultAnswer = 'y') {
  const hint = defaultAnswer === 'y' ? '[Y/n]' : '[y/N]';
  const answer = await ask(`${question} ${hint} `);
  if (answer === '') return defaultAnswer === 'y';
  return answer.toLowerCase().startsWith('y');
}

// Ask a numbered menu question, return the 1-based choice as a number.
// choices: array of strings
async function menu(title, choices) {
  console.log(`\n${title}`);
  choices.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
  while (true) {
    const answer = await ask(`\nChoice [1-${choices.length}]: `);
    const n = parseInt(answer, 10);
    if (n >= 1 && n <= choices.length) return n;
    console.log(`  Please enter a number between 1 and ${choices.length}.`);
  }
}

// Resolve ~ in paths
function expandHome(p) {
  if (p.startsWith('~/') || p === '~') {
    return path.join(process.env.HOME || process.env.USERPROFILE || '', p.slice(1));
  }
  return p;
}

// Ensure directory exists (mkdir -p)
function mkdirp(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

// Create a symlink. Skips if already a symlink to the right target. Warns if something else exists.
function symlink(target, link) {
  if (fs.existsSync(link)) {
    const stat = fs.lstatSync(link);
    if (stat.isSymbolicLink()) {
      const current = fs.readlinkSync(link);
      if (current === target) {
        console.log(`  ↻  Already linked:   ${link}`);
        return;
      }
      fs.unlinkSync(link);
    } else {
      console.log(`  ⚠  Exists (not symlink), skipping: ${link}`);
      return;
    }
  }
  mkdirp(path.dirname(link));
  fs.symlinkSync(target, link);
  console.log(`  ✓  Linked:           ${link}`);
}

// Copy a file. Overwrites destination.
function copyFile(src, dest) {
  mkdirp(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

// Copy directory tree recursively
function copyDir(src, dest) {
  mkdirp(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      copyFile(s, d);
    }
  }
}

// Run a shell command silently. Returns { stdout, stderr, ok }.
function run(cmd, opts = {}) {
  try {
    const stdout = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...opts });
    return { stdout, stderr: '', ok: true };
  } catch (e) {
    return { stdout: e.stdout || '', stderr: e.stderr || '', ok: false };
  }
}

// Detect the project type from files present in cwd
function detectProjectType(cwd) {
  if (fs.existsSync(path.join(cwd, 'pubspec.yaml')))          return 'flutter';
  if (fs.existsSync(path.join(cwd, 'manage.py')))              return 'django';
  if (fs.existsSync(path.join(cwd, 'requirements.txt')) ||
      fs.existsSync(path.join(cwd, 'pyproject.toml')))        return 'python';
  if (fs.existsSync(path.join(cwd, 'package.json')))           return 'node';
  return 'unknown';
}

// Replace {{PLACEHOLDER}} markers in a string
function fillTemplate(str, vars) {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] !== undefined ? vars[key] : `{{${key}}}`);
}

// Replace placeholders in all files under a directory tree (in-place)
function fillTemplateDir(dir, vars) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fillTemplateDir(p, vars);
    } else if (entry.isFile()) {
      const content = fs.readFileSync(p, 'utf8');
      const filled  = fillTemplate(content, vars);
      if (filled !== content) fs.writeFileSync(p, filled, 'utf8');
    }
  }
}

module.exports = { ask, confirm, menu, expandHome, mkdirp, symlink, copyFile, copyDir, run, detectProjectType, fillTemplate, fillTemplateDir };
