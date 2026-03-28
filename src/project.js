'use strict';

// project.js — `aicrew add-project`
//
// Generates .ai/skills/ for the current project:
// - Detects tech stack
// - Asks which templates to generate
// - Fills placeholders from user answers
// - Creates .ai/skills/setup.sh and registers the project hook

const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { ask, confirm, menu, expandHome, mkdirp, symlink, copyFile, fillTemplate, fillTemplateDir, detectProjectType, run } = require('./utils');
const { registerPreToolUseHook } = require('./settings');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');
const SKILLS_DIR    = expandHome('~/.claude/skills');

async function addProject(cwd) {
  cwd = cwd || process.cwd();
  console.log(`\n=== aicrew — Add Project Skills ===`);
  console.log(`Project: ${cwd}\n`);

  // Detect stack
  const stackType = detectProjectType(cwd);
  console.log(`Detected stack: ${stackType}`);

  // Gather answers for template placeholders
  const projectName = await ask(`Project name [${path.basename(cwd)}]: `) || path.basename(cwd);
  const techStack   = await ask(`Tech stack summary (e.g. "FastAPI + React + SQLite"): `);
  const testCmd     = await ask(`Test command (e.g. "pytest -q" or "npm test"): `);
  const lintCmd     = await ask(`Lint/type-check command (e.g. "ruff check . && mypy ."): `);
  const deployTarget = await ask(`Deployment target (e.g. "Heroku", "AWS EC2", "Vercel"): `);
  const database    = await ask(`Database (e.g. "PostgreSQL", "SQLite", "MongoDB"): `);

  const vars = {
    PROJECT_NAME:         projectName,
    TECH_STACK_SUMMARY:   techStack   || stackType,
    TEST_COMMAND:         testCmd     || 'echo "no test command configured"',
    LINT_COMMAND:         lintCmd     || 'echo "no lint command configured"',
    DEPLOYMENT_TARGET:    deployTarget || 'unknown',
    DATABASE:             database    || 'unknown',
    STACK_RULE:           buildStackRule(stackType),
    KEY_PATTERNS:         '- (add key patterns from your codebase here)',
    COMMON_PITFALLS:      '- (add common pitfalls from your codebase here)',
    AUDIT_CHECKLIST:      '- [ ] All required fields present\n- [ ] No broken references',
    DATA_INTEGRITY_CHECKS:'- [ ] Foreign key relationships intact',
    MIGRATION_CHECKS:     buildMigrationChecks(stackType),
    ENVIRONMENT_CHECKS:   '- No hardcoded localhost or absolute paths\n- All env vars documented in .env.example',
    CONCURRENCY_CHECKS:   '- No shared mutable state across requests',
    FILE_NAMING_CONVENTION: '- snake_case for Python files, camelCase for JS/TS',
    IMPORT_STYLE:         '- (describe import ordering convention)',
    ERROR_HANDLING_PATTERN: '- (describe how errors are handled and surfaced)',
  };

  // Choose which templates to generate
  console.log('\nWhich files do you want to generate?');
  const options = [
    { key: 'agents',    label: 'AGENTS.md — Codex/OpenAI entry point with non-negotiables' },
    { key: 'cursor',    label: 'cursor-rules/[project].mdc — Cursor rules' },
    { key: 'audit',     label: 'commands/audit.md — domain compliance audit command' },
    { key: 'cloud',     label: 'agents/cloud-expert.md — infra review override' },
    { key: 'auditguard',label: 'hooks/audit-guard.py — PreToolUse domain invariant hook' },
  ];

  const selected = [];
  for (const opt of options) {
    const yes = await confirm(`  ${opt.label}?`);
    if (yes) selected.push(opt.key);
  }

  if (selected.length === 0) {
    console.log('\nNothing selected. Exiting.');
    return;
  }

  // Output directory
  const skillsDir = path.join(cwd, '.ai', 'skills');

  // Generate selected templates
  if (selected.includes('agents')) {
    const dest = path.join(skillsDir, 'AGENTS.md');
    generateFromTemplate('AGENTS.md', dest, vars);
    console.log(`  ✓  ${dest}`);
  }

  if (selected.includes('cursor')) {
    const slug = projectName.toLowerCase().replace(/\s+/g, '-');
    const dest = path.join(skillsDir, 'cursor-rules', `${slug}.mdc`);
    generateFromTemplate('cursor-rules/project.mdc', dest, vars);
    console.log(`  ✓  ${dest}`);
  }

  if (selected.includes('audit')) {
    const dest = path.join(skillsDir, 'commands', 'audit.md');
    generateFromTemplate('commands/audit.md', dest, vars);
    console.log(`  ✓  ${dest}`);
  }

  if (selected.includes('cloud')) {
    const dest = path.join(skillsDir, 'agents', 'cloud-expert.md');
    generateFromTemplate('agents/cloud-expert.md', dest, vars);
    console.log(`  ✓  ${dest}`);
  }

  if (selected.includes('auditguard')) {
    const dest = path.join(skillsDir, 'hooks', 'audit-guard.py');
    generateFromTemplate('hooks/audit-guard.py', dest, vars);
    console.log(`  ✓  ${dest}`);
  }

  // Write setup.sh for this project
  writeProjectSetup(skillsDir, cwd, selected);
  console.log(`  ✓  ${path.join(skillsDir, 'setup.sh')}`);

  // Run setup
  const setupScript = path.join(skillsDir, 'setup.sh');
  console.log('\nRunning project setup...');
  const { ok, stderr } = run(`bash ${setupScript}`, { cwd });
  if (!ok) console.warn(`  ⚠  setup.sh had errors: ${stderr}`);
  else     console.log('  ✓  setup.sh complete');

  // Offer Agents doc symlink
  const wantDoc = await confirm(`\nAdd ~/Agents/SKILLS_SYSTEM.md symlink to this project repo?`, 'y');
  if (wantDoc) {
    const agentsDir = path.join(cwd, 'Agents');
    mkdirp(agentsDir);
    const docSrc  = path.join(SKILLS_DIR, 'SKILLS_SYSTEM.md');
    const docLink = path.join(agentsDir, 'SKILLS_SYSTEM.md');
    if (fs.existsSync(docSrc)) {
      symlink(docSrc, docLink);
    }
  }

  console.log('\n=== Project setup complete ===');
  console.log('Edit the generated files to add project-specific knowledge, then commit them.');
}

function generateFromTemplate(templateRelPath, dest, vars) {
  const src = path.join(TEMPLATES_DIR, templateRelPath);
  if (!fs.existsSync(src)) {
    console.warn(`  ⚠  Template not found: ${src}`);
    return;
  }
  const raw    = fs.readFileSync(src, 'utf8');
  const filled = fillTemplate(raw, vars);
  mkdirp(path.dirname(dest));
  fs.writeFileSync(dest, filled, 'utf8');
}

function buildStackRule(stackType) {
  const rules = {
    python:  '- Use type annotations\n- Run ruff check + mypy before committing\n- Prefer dataclasses over plain dicts for structured data',
    flutter: '- Run flutter analyze (zero warnings) before committing\n- No hardcoded colors or strings — use theme/l10n\n- Widget tests for all new screens',
    node:    '- Parameterize all SQL queries — no string concatenation\n- Validate all user input at route boundaries\n- npm audit before every release',
    django:  '- Use ORM — no raw SQL without review\n- Run manage.py test before committing\n- Migration for every model change',
  };
  return rules[stackType] || '- (add stack-specific rules here)';
}

function buildMigrationChecks(stackType) {
  const checks = {
    python:  '- Is the migration reversible (has downgrade())?\n- Is it safe to run on a live database (no full table rewrites)?\n- Are new columns nullable or have defaults?',
    flutter: '- Is the local DB schema change backward compatible?\n- Does the migration handle existing data?',
    node:    '- Is the migration idempotent?\n- Does it handle existing rows safely?',
  };
  return checks[stackType] || '- Is the migration reversible?\n- Is it safe to run on a live database?';
}

function writeProjectSetup(skillsDir, cwd, selected) {
  const hookPath   = path.join(skillsDir, 'hooks', 'audit-guard.py');
  const settingsPath = path.join(cwd, '.claude', 'settings.json');
  const cursorDir  = path.join(cwd, '.cursor', 'rules');

  const lines = [
    '#!/usr/bin/env bash',
    '# .ai/skills/setup.sh — project skills setup',
    '# Run once per machine: bash .ai/skills/setup.sh',
    '# Safe to re-run (idempotent).',
    '',
    'set -euo pipefail',
    `SKILLS_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"`,
    '',
  ];

  // Cursor rule symlinks
  const cursorRulesDir = path.join(skillsDir, 'cursor-rules');
  if (fs.existsSync(cursorRulesDir)) {
    lines.push('# Cursor rule symlinks');
    lines.push(`mkdir -p "${cursorDir}"`);
    lines.push(`for f in "$SKILLS_DIR/cursor-rules/"*.mdc; do`);
    lines.push(`  [ -f "$f" ] || continue`);
    lines.push(`  name="$(basename "$f")"`);
    lines.push(`  link="${cursorDir}/$name"`);
    lines.push(`  [ -L "$link" ] && echo "  ↻  Already linked: $name" && continue`);
    lines.push(`  [ -e "$link" ] && echo "  ⚠  Exists (not symlink), skipping: $name" && continue`);
    lines.push(`  ln -s "$f" "$link" && echo "  ✓  Linked cursor rule: $name"`);
    lines.push(`done`);
    lines.push('');
  }

  // AGENTS.md symlink
  const agentsMd = path.join(skillsDir, 'AGENTS.md');
  if (fs.existsSync(agentsMd)) {
    lines.push('# AGENTS.md symlink');
    lines.push(`AGENTS_TARGET="${cwd}/AGENTS.md"`);
    lines.push(`if [ -L "$AGENTS_TARGET" ]; then echo "  ↻  AGENTS.md already linked";`);
    lines.push(`elif [ -e "$AGENTS_TARGET" ]; then echo "  ⚠  AGENTS.md exists (not symlink), skipping";`);
    lines.push(`else ln -s "$SKILLS_DIR/AGENTS.md" "$AGENTS_TARGET" && echo "  ✓  Linked AGENTS.md"; fi`);
    lines.push('');
  }

  // audit-guard hook registration
  if (selected.includes('auditguard')) {
    lines.push('# Register audit-guard hook in project .claude/settings.json');
    lines.push(`python3 - "$SKILLS_DIR/hooks/audit-guard.py" "${settingsPath}" <<'PYEOF'`);
    lines.push('import json, sys');
    lines.push('from pathlib import Path');
    lines.push('script, settings_path = sys.argv[1], Path(sys.argv[2])');
    lines.push('settings = json.loads(settings_path.read_text()) if settings_path.exists() else {}');
    lines.push('hooks = settings.setdefault("hooks", {})');
    lines.push('pre = hooks.setdefault("PreToolUse", [])');
    lines.push('if not any("audit-guard" in json.dumps(e) for e in pre):');
    lines.push('    pre.append({"matcher": "Edit|Write|MultiEdit", "hooks": [{"type": "command", "command": f"python3 {script}"}]})');
    lines.push('    print("  ✓  Registered: PreToolUse → audit-guard.py")');
    lines.push('else:');
    lines.push('    print("  ↻  Already registered: audit-guard.py")');
    lines.push('settings_path.parent.mkdir(parents=True, exist_ok=True)');
    lines.push('settings_path.write_text(json.dumps(settings, indent=4))');
    lines.push('PYEOF');
    lines.push('');
  }

  lines.push('echo "Project setup complete."');

  const script = lines.join('\n') + '\n';
  mkdirp(skillsDir);
  fs.writeFileSync(path.join(skillsDir, 'setup.sh'), script, 'utf8');
  fs.chmodSync(path.join(skillsDir, 'setup.sh'), 0o755);
}

module.exports = { addProject };
