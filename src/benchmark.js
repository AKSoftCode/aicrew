'use strict';

// benchmark.js — token-savings benchmark for aicrew
//
// CLI: aicrew benchmark [--project <path>] [--session <id>] [--report] [--compare lean|quick|full]
//
// All token counts are ESTIMATES based on bytes/lines/tool-call counts.
// Labels clearly say "estimated" wherever exact counts are unavailable.
// Rule of thumb: 1 token ≈ 4 bytes of English/code text (GPT-family).

const fs   = require('fs');
const path = require('path');

const BYTES_PER_TOKEN = 4;

// File extensions considered "source" for baseline estimation.
const SOURCE_EXTS = new Set([
  '.js', '.ts', '.tsx', '.jsx', '.mjs', '.cjs',
  '.py', '.rb', '.go', '.rs', '.java', '.kt', '.swift',
  '.sh', '.bash',
  '.md', '.txt', '.json', '.toml', '.yaml', '.yml',
  '.css', '.scss', '.html',
]);

// Directories to skip when scanning.
const SKIP_DIRS = new Set([
  'node_modules', '.git', '.next', '__pycache__', '.venv', 'venv',
  'dist', 'build', '.cache', 'coverage', '.nyc_output',
]);

// ── Token estimation ──────────────────────────────────────────────────────────

/** Estimate tokens for a string or byte count. */
function estimateTokens(bytesOrStr) {
  const bytes = typeof bytesOrStr === 'string'
    ? Buffer.byteLength(bytesOrStr, 'utf8')
    : bytesOrStr;
  return Math.round(bytes / BYTES_PER_TOKEN);
}

/** Count lines in a file (for slice-read estimates). */
function lineCount(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (_) {
    return 0;
  }
}

// ── Project scanning ──────────────────────────────────────────────────────────

/**
 * Walk a directory tree and collect source file stats.
 * Returns { files: [{path, bytes, lines}], totalBytes, totalLines }
 */
function scanProject(dir) {
  const files = [];

  function walk(current) {
    let entries;
    try { entries = fs.readdirSync(current, { withFileTypes: true }); }
    catch (_) { return; }

    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.ai') continue;
      if (SKIP_DIRS.has(entry.name)) continue;

      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (!SOURCE_EXTS.has(ext)) continue;
        try {
          const stat = fs.statSync(full);
          if (stat.size > 500_000) continue; // skip minified/generated blobs
          const lines = lineCount(full);
          files.push({ path: full, bytes: stat.size, lines });
        } catch (_) { /* ignore unreadable files */ }
      }
    }
  }

  walk(dir);

  const totalBytes = files.reduce((s, f) => s + f.bytes, 0);
  const totalLines = files.reduce((s, f) => s + f.lines, 0);
  return { files, totalBytes, totalLines };
}

// ── Benchmark model ───────────────────────────────────────────────────────────

/**
 * Constants derived from README + codebase-memory-mcp documentation.
 * All values labeled as ESTIMATED or FIXED (based on documented examples).
 */
const CONSTANTS = {
  // From README: "A repo-wide grep costs ~80,000 tokens"
  grepFullScanTokens: 80_000,

  // From README: "A graph query costs ~500 tokens"
  graphQueryTokens: 500,

  // /quick SCOUT schema: fixed fields ≈ 150 words → ~200 tokens output.
  // Docs cite ~1–2 K for the full SCOUT block; 200 is a conservative floor / schema minimum.
  scoutSchemaTokens: 200,

  // Average lines read per "slice" read vs full file
  avgSliceLinesRead: 30,

  // Compact .ai/state checkpoint ≈ 300 tokens
  stateCheckpointTokens: 300,

  // A full chat replay for context rebuild: estimated at 10–20K tokens
  fullChatReplayTokens: 15_000,

  // Caveman/lean output reduces output tokens by ~35% (estimated from response length studies)
  cavemanOutputReductionPct: 35,

  // /dev phase-boundary compaction reduces accumulated context per phase by ~60%
  phaseCompactionReductionPct: 60,

  // Number of /dev phases that benefit from compaction
  devPhaseCount: 9,

  // Average tokens accumulated per /dev phase (input + output, rough estimate)
  tokensPerDevPhase: 4_000,
};

/**
 * Compute benchmark results for a project.
 * @param {object} scan   output of scanProject()
 * @param {string} mode   'lean' | 'quick' | 'full' (compare mode)
 * @returns {object}      structured benchmark results
 */
function computeBenchmark(scan, mode = 'quick') {
  const { files, totalBytes, totalLines } = scan;
  const fileCount = files.length;

  // ── Baseline: naive full-read of all source files ──────────────────────────
  const baselineTokens = estimateTokens(totalBytes);
  // Plus one grep scan per "exploration session"
  const baselineWithGrep = baselineTokens + CONSTANTS.grepFullScanTokens;

  // ── /quick Scout → Act savings ─────────────────────────────────────────────
  // Baseline for discovery: one full grep scan
  const quickBaselineDiscovery = CONSTANTS.grepFullScanTokens;
  // With /quick: graph query + SCOUT schema
  const quickAicrewDiscovery = CONSTANTS.graphQueryTokens + CONSTANTS.scoutSchemaTokens;
  const quickSaved = quickBaselineDiscovery - quickAicrewDiscovery;

  // ── /lean slice-read savings ───────────────────────────────────────────────
  // Naive: read whole files when exploring (assume 10 files read per session)
  const filesReadPerSession = Math.min(10, fileCount);
  const avgFileLines = fileCount > 0 ? Math.round(totalLines / fileCount) : 200;
  const avgFileTokens = fileCount > 0
    ? Math.round(totalBytes / fileCount / BYTES_PER_TOKEN)
    : 500;

  const leanBaselineRead = filesReadPerSession * avgFileTokens;
  const leanAicrewRead   = filesReadPerSession * Math.round(
    (CONSTANTS.avgSliceLinesRead / Math.max(avgFileLines, 1)) * avgFileTokens
  );
  const leanSaved = Math.max(0, leanBaselineRead - leanAicrewRead);

  // ── graph MCP vs grep ──────────────────────────────────────────────────────
  // Assume 3 discovery queries per session
  const graphQueriesPerSession = 3;
  const graphBaselineTokens = graphQueriesPerSession * CONSTANTS.grepFullScanTokens;
  const graphAicrewTokens   = graphQueriesPerSession * CONSTANTS.graphQueryTokens;
  const graphSaved = graphBaselineTokens - graphAicrewTokens;

  // ── /handoff + .ai/state ──────────────────────────────────────────────────
  const handoffBaselineTokens = CONSTANTS.fullChatReplayTokens;
  const handoffAicrewTokens   = CONSTANTS.stateCheckpointTokens;
  const handoffSaved = handoffBaselineTokens - handoffAicrewTokens;

  // ── /dev phase-boundary compaction ────────────────────────────────────────
  const devBaselineTokens = CONSTANTS.devPhaseCount * CONSTANTS.tokensPerDevPhase;
  const compactionSaved   = Math.round(
    devBaselineTokens * (CONSTANTS.phaseCompactionReductionPct / 100)
  );
  const devAicrewTokens   = devBaselineTokens - compactionSaved;

  // ── caveman/terse output ───────────────────────────────────────────────────
  // Estimate: session output tokens, assume 5K output tokens per session naive
  const cavemanBaselineOutput = 5_000;
  const cavemanSaved = Math.round(
    cavemanBaselineOutput * (CONSTANTS.cavemanOutputReductionPct / 100)
  );

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totalSaved = quickSaved + leanSaved + graphSaved + handoffSaved
    + compactionSaved + cavemanSaved;
  const totalBaseline = quickBaselineDiscovery + leanBaselineRead
    + graphBaselineTokens + handoffBaselineTokens + devBaselineTokens
    + cavemanBaselineOutput;
  const totalAicrew = totalBaseline - totalSaved;
  const savingsPct = totalBaseline > 0
    ? Math.round((totalSaved / totalBaseline) * 100)
    : 0;

  return {
    projectFiles: fileCount,
    projectBytes: totalBytes,
    projectLines: totalLines,
    avgFileTokens,
    mode,
    baseline: {
      total: totalBaseline,
      fullRead: baselineWithGrep,
      grepScan: CONSTANTS.grepFullScanTokens,
      filesRead: leanBaselineRead,
      graphQueries: graphBaselineTokens,
      handoff: handoffBaselineTokens,
      devSession: devBaselineTokens,
      output: cavemanBaselineOutput,
    },
    aicrew: {
      total: totalAicrew,
      quickScout: quickAicrewDiscovery,
      leanReads: leanAicrewRead,
      graphQueries: graphAicrewTokens,
      handoff: handoffAicrewTokens,
      devSession: devAicrewTokens,
      output: cavemanBaselineOutput - cavemanSaved,
    },
    features: [
      {
        name: '/quick Scout → Act',
        baselineTokens: quickBaselineDiscovery,
        aicrewTokens:   quickAicrewDiscovery,
        saved:          quickSaved,
        howMeasured:    'graph query (~500 tok) vs repo-wide grep (~80K tok) — documented ratio',
      },
      {
        name: '/lean slice reads',
        baselineTokens: leanBaselineRead,
        aicrewTokens:   leanAicrewRead,
        saved:          leanSaved,
        howMeasured:    `${CONSTANTS.avgSliceLinesRead}-line slices vs full file (avg ${avgFileLines} lines); ${filesReadPerSession} files/session — estimated`,
      },
      {
        name: 'graph MCP (codebase-memory-mcp)',
        baselineTokens: graphBaselineTokens,
        aicrewTokens:   graphAicrewTokens,
        saved:          graphSaved,
        howMeasured:    `${graphQueriesPerSession} queries × 500 tok (graph) vs 80K tok (grep) — documented ratio`,
      },
      {
        name: '/handoff + .ai/state',
        baselineTokens: handoffBaselineTokens,
        aicrewTokens:   handoffAicrewTokens,
        saved:          handoffSaved,
        howMeasured:    `compact state (~${CONSTANTS.stateCheckpointTokens} tok) vs full chat replay (~${CONSTANTS.fullChatReplayTokens / 1000}K tok) — estimated`,
      },
      {
        name: '/dev phase compaction',
        baselineTokens: devBaselineTokens,
        aicrewTokens:   devAicrewTokens,
        saved:          compactionSaved,
        howMeasured:    `${CONSTANTS.phaseCompactionReductionPct}% context reduction at ${CONSTANTS.devPhaseCount} phase boundaries — estimated`,
      },
      {
        name: 'caveman/terse output',
        baselineTokens: cavemanBaselineOutput,
        aicrewTokens:   cavemanBaselineOutput - cavemanSaved,
        saved:          cavemanSaved,
        howMeasured:    `~${CONSTANTS.cavemanOutputReductionPct}% shorter output tokens vs verbose style — estimated`,
      },
    ],
    totals: { baseline: totalBaseline, aicrew: totalAicrew, saved: totalSaved, savingsPct },
  };
}

// ── Report renderer ───────────────────────────────────────────────────────────

function fmtK(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/**
 * Render benchmark results as a markdown report.
 */
function renderReport(results, projectPath, sessionId) {
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const label = sessionId || path.basename(projectPath || process.cwd());
  const { features, totals, projectFiles, projectLines, avgFileTokens } = results;

  const rows = features.map(f => {
    const pct = f.baselineTokens > 0
      ? Math.round((f.saved / f.baselineTokens) * 100)
      : 0;
    return `| ${f.name} | ${fmtK(f.baselineTokens)} | ${fmtK(f.aicrewTokens)} | ${fmtK(f.saved)} (${pct}%) | ${f.howMeasured} |`;
  }).join('\n');

  // Top recommendation
  const topFeature = [...features].sort((a, b) => b.saved - a.saved)[0];

  return `# Token Report — ${label} — ${now}

> **Note:** All token counts are **estimated** unless marked otherwise.
> Estimation method: 1 token ≈ 4 bytes; file sizes from \`fs.statSync\`; grep/graph ratios from aicrew README.

---

## Project snapshot

| Metric | Value |
|--------|-------|
| Source files scanned | ${projectFiles} |
| Total source lines | ${fmtK(projectLines)} |
| Avg file size (tokens) | ~${fmtK(avgFileTokens)} |
| Project path | \`${projectPath || process.cwd()}\` |

---

## Summary

| | Tokens (estimated) |
|--|--|
| **Baseline** (naive full-read + grep) | **${fmtK(totals.baseline)}** |
| **With aicrew** (graph-first + lean) | **${fmtK(totals.aicrew)}** |
| **Saved** | **${fmtK(totals.saved)} (${totals.savingsPct}%)** |

---

## By feature

| Feature | Baseline | With aicrew | Saved | How measured |
|---------|----------|-------------|-------|--------------|
${rows}

---

## Recommendations

${topFeature ? `- **Biggest win for this project:** \`${topFeature.name}\` saves ~${fmtK(topFeature.saved)} tokens per session (${Math.round(topFeature.saved / topFeature.baselineTokens * 100)}% reduction).` : ''}
- If \`codebase-memory-mcp\` is not yet indexed: run \`index_repository\` once, then every session benefits from graph queries.
- Large repos (500+ files): \`/quick\` + graph MCP makes the biggest difference. Run \`/lean on\` to add slice reads on top.
- Switching tools mid-session: use \`/handoff\` + \`.ai/state\` instead of re-pasting context — saves ~${fmtK(totals.aicrew > 0 ? features.find(f => f.name.includes('handoff'))?.saved || 0 : 0)} tokens per handoff.
- Use \`/dev\` for long sessions — phase-boundary compaction keeps the window from filling up.

---

## How to read this report

All numbers in this report are **estimates** derived from:
1. File sizes on disk → token count via \`bytes / 4\` (rough GPT-family approximation)
2. Documented grep/graph token ratio from [codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp): ~80K vs ~500
3. Output verbosity reduction: ~35% shorter with caveman/terse style (based on response length comparison)
4. Phase compaction and handoff savings: order-of-magnitude estimates

For exact token counts: enable token usage logging in your AI tool and compare sessions with \`/lean on\` vs off.

---

*Generated by \`aicrew benchmark\` — [aicrew](https://github.com/DeusData/aicrew)*
`;
}

// ── Main entry point ──────────────────────────────────────────────────────────

/**
 * Run benchmark CLI.
 * @param {string[]} argv  process.argv.slice(2) after 'benchmark' is consumed
 */
function runBenchmark(argv) {
  let projectPath = process.cwd();
  let sessionId   = null;
  let writeReport = false;
  let compareMode = 'quick';
  let outputPath  = null;

  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--project':
      case '-p':
        projectPath = path.resolve(argv[++i] || process.cwd());
        break;
      case '--session':
      case '-s':
        sessionId = argv[++i];
        break;
      case '--report':
      case '-r':
        writeReport = true;
        break;
      case '--compare':
      case '-c':
        compareMode = argv[++i] || 'quick';
        break;
      case '--output':
      case '-o':
        outputPath = argv[++i];
        break;
      case '--help':
      case '-h':
        printBenchmarkHelp();
        return;
      default:
        // Treat bare argument as project path
        if (!argv[i].startsWith('-')) {
          projectPath = path.resolve(argv[i]);
        }
    }
  }

  if (!fs.existsSync(projectPath)) {
    console.error(`Error: project path not found: ${projectPath}`);
    process.exit(1);
  }

  console.log(`\naicrew benchmark — scanning ${projectPath} ...\n`);

  const scan    = scanProject(projectPath);
  const results = computeBenchmark(scan, compareMode);
  const report  = renderReport(results, projectPath, sessionId);

  // Always print summary to stdout
  const { totals, projectFiles } = results;
  console.log(`Files scanned  : ${projectFiles}`);
  console.log(`Baseline est.  : ~${fmtK(totals.baseline)} tokens`);
  console.log(`With aicrew    : ~${fmtK(totals.aicrew)} tokens`);
  console.log(`Saved          : ~${fmtK(totals.saved)} tokens (${totals.savingsPct}%)`);
  console.log('');
  console.log('By feature:');
  for (const f of results.features) {
    const pct = f.baselineTokens > 0
      ? Math.round((f.saved / f.baselineTokens) * 100)
      : 0;
    console.log(`  ${f.name.padEnd(35)} ${fmtK(f.saved).padStart(6)} saved  (${pct}%)`);
  }

  // Write report if --report flag or --output given
  if (writeReport || outputPath) {
    const ts      = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    const reportsDir = outputPath
      ? path.dirname(path.resolve(outputPath))
      : path.join(projectPath, '.ai', 'reports');

    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const finalPath = outputPath
      ? path.resolve(outputPath)
      : path.join(reportsDir, `TOKEN_REPORT.${ts}.md`);

    fs.writeFileSync(finalPath, report, 'utf8');
    console.log(`\nReport written: ${finalPath}`);
  } else {
    console.log('\nTip: add --report to write a full markdown report to .ai/reports/');
  }
}

function printBenchmarkHelp() {
  console.log(`
aicrew benchmark — estimate token savings from aicrew patterns

USAGE
  aicrew benchmark [options] [project-path]

OPTIONS
  --project, -p <path>      Project directory to scan (default: cwd)
  --session, -s <id>        Session label for the report header
  --report, -r              Write full markdown report to .ai/reports/TOKEN_REPORT.<ts>.md
  --output, -o <path>       Write report to a specific file path
  --compare <mode>          Comparison mode: lean | quick | full (default: quick)
  --help, -h                Show this help

EXAMPLES
  aicrew benchmark                        # scan cwd, print summary
  aicrew benchmark --report               # scan cwd, write report to .ai/reports/
  aicrew benchmark --project ./myapp -r   # scan ./myapp, write report
  aicrew benchmark -s "fix-auth-bug" -r   # label the report with a session id

WHAT IT MEASURES
  All figures are ESTIMATED from file sizes (1 token ≈ 4 bytes) and
  documented grep-vs-graph ratios (~80K vs ~500 tokens per query).

  Features compared:
    /quick Scout → Act   graph query vs full grep scan
    /lean slice reads    30-line slices vs whole-file reads
    graph MCP            codebase-memory-mcp vs grep/glob
    /handoff + .ai/state compact state vs full chat replay
    /dev phase compaction context reduction at phase boundaries
    caveman/terse output  ~35% shorter output tokens

REPORT LOCATION
  .ai/reports/TOKEN_REPORT.<timestamp>.md
  (or pass --output to specify a custom path)
`);
}

module.exports = { runBenchmark, scanProject, computeBenchmark, renderReport, printBenchmarkHelp };
