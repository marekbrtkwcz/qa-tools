#!/usr/bin/env node
'use strict';

/**
 * P4.4: Performance Benchmarking Script
 *
 * Measures and tracks performance of:
 * - P2 maintenance scripts
 * - P3 test suites
 * - Build process
 * - Individual operations
 *
 * Usage:
 *   node scripts/benchmark-performance.ts [options]
 *
 * Options:
 *   --runs, -r      Number of benchmark runs (default: 3)
 *   --script, -s    Specific script to benchmark
 *   --save, -S      Save results to file
 *   --compare, -c   Compare with previous results
 *   --json, -j      Output results as JSON
 *   --help, -h      Show help
 */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

interface BenchmarkRun {
  run: number;
  durationMs: number;
  duration: string;
  success: boolean;
  output?: string;
  error?: unknown;
}

interface BenchmarkStatistics {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  successRate: number;
}

interface Benchmark {
  name: string;
  command: string;
  runs: BenchmarkRun[];
  statistics: BenchmarkStatistics;
  error?: string;
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: {
  runs: number;
  script: string | null;
  save: boolean;
  compare: boolean;
  json: boolean;
  help: boolean;
} = {
  runs: 3,
  script: null,
  save: false,
  compare: false,
  json: false,
  help: false,
};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--runs':
    case '-r':
      options.runs = parseInt(args[++i] as string, 10) || 3;
      break;
    case '--script':
    case '-s':
      options.script = args[++i] as string;
      break;
    case '--save':
    case '-S':
      options.save = true;
      break;
    case '--compare':
    case '-c':
      options.compare = true;
      break;
    case '--json':
    case '-j':
      options.json = true;
      break;
    case '--help':
    case '-h':
      options.help = true;
      break;
    default:
      break;
  }
}

// Show help
if (options.help) {
  console.log(`
⚡ Performance Benchmarking

Usage: node scripts/benchmark-performance.ts [options]

Options:
  --runs, -r      Number of benchmark runs (default: 3)
  --script, -s    Specific script to benchmark
  --save, -S      Save results to file
  --compare, -c   Compare with previous results
  --json, -j      Output results as JSON
  --help, -h      Show help

Examples:
  node scripts/benchmark-performance.ts
  node scripts/benchmark-performance.ts --runs 5 --save
  node scripts/benchmark-performance.ts --script "npm run build"
`);
  process.exit(0);
}

// Benchmark storage
const results: {
  benchmarks: Benchmark[];
  startTime: string;
  endTime: string | null;
} = {
  benchmarks: [],
  startTime: new Date().toISOString(),
  endTime: null,
};

// Previous results file
const RESULTS_FILE = '.benchmark-results.json';

/**
 * Benchmark a command multiple times
 */
function benchmarkCommand(command: string, name: string, runs: number = options.runs) {
  const benchmark: Benchmark = {
    name: name,
    command: command,
    runs: [],
    statistics: {} as BenchmarkStatistics,
  };

  console.log(`\n📊 Benchmarking: ${name}`);
  console.log(`   Command: ${command}`);
  console.log(`   Runs: ${runs}`);

  for (let i = 1; i <= runs; i++) {
    console.log(`   Run ${i}/${runs}...`);

    const startTime = process.hrtime.bigint();
    let success = true;
    let output = '';
    let error: unknown = null;

    try {
      output = execSync(command, {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 10,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (err) {
      success = false;
      const e = err as { message?: string; stdout?: string; stderr?: string };
      error = e.message || e.stdout || e.stderr;
    }

    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;

    benchmark.runs.push({
      run: i,
      durationMs: durationMs,
      duration: formatDuration(durationMs),
      success: success,
      output: output.length > 500 ? output.substring(0, 500) + '...' : output,
      error: error,
    });

    console.log(`      Duration: ${formatDuration(durationMs)} ${success ? '✅' : '❌'}`);
  }

  // Calculate statistics
  const durations = benchmark.runs.map((r) => r.durationMs);
  benchmark.statistics = {
    min: Math.min(...durations),
    max: Math.max(...durations),
    mean: durations.reduce((a, b) => a + b, 0) / durations.length,
    median: calculateMedian(durations),
    stdDev: calculateStdDev(durations),
    successRate: benchmark.runs.filter((r) => r.success).length / benchmark.runs.length,
  };

  results.benchmarks.push(benchmark);

  return benchmark;
}

/**
 * Calculate median
 */
function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a: number, b: number) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return ((sorted[middle - 1] as number) + (sorted[middle] as number)) / 2;
  }
  return sorted[middle] as number;
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[]): number {
  const mean = values.reduce((a: number, b: number) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v: number) => (v - mean) ** 2);
  const variance = squaredDiffs.reduce((a: number, b: number) => a + b, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Format duration in human-readable format
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  } else {
    return `${(ms / 60000).toFixed(2)}m`;
  }
}

/**
 * Get all benchmarkable scripts
 */
function getBenchmarkableScripts(): { name: string; command: string }[] {
  return [
    { name: 'P2: CHANGELOG preview', command: 'npm run changelog:preview' },
    { name: 'P2: README stats check', command: 'npm run readme:stats:check' },
    { name: 'P2: Links check', command: 'npm run links:check' },
    { name: 'P2: All checks', command: 'npm run p2' },
    { name: 'P3: Unit tests', command: 'npm run test:p3' },
    { name: 'All: Tests', command: 'npm run test:all' },
    { name: 'Build: Plugins', command: 'npm run build' },
    { name: 'Check: Full', command: 'npm run check' },
    { name: 'Verify: Drift', command: 'npm run verify' },
    { name: 'Lint: All', command: 'npm run lint' },
  ];
}

/**
 * Format results for display
 */
function formatResults(): string {
  const lines: string[] = [];

  // Header
  lines.push('='.repeat(80));
  lines.push('⚡ PERFORMANCE BENCHMARKING RESULTS');
  lines.push('='.repeat(80));
  lines.push('');

  // Summary
  lines.push(`📊 Summary:`);
  lines.push(`   Benchmarks: ${results.benchmarks.length}`);
  lines.push(`   Runs per benchmark: ${options.runs}`);
  lines.push(
    `   Total execution time: ${formatDuration(results.benchmarks.reduce((sum, b) => sum + b.runs.reduce((s, r) => s + r.durationMs, 0), 0))}`,
  );
  lines.push('');

  // Individual benchmarks
  results.benchmarks.forEach((benchmark) => {
    lines.push('📋 ' + benchmark.name);
    lines.push('-'.repeat(80));

    // Run details
    benchmark.runs.forEach((run) => {
      lines.push(`   Run ${run.run}: ${run.duration} ${run.success ? '✅' : '❌'}`);
    });

    // Statistics
    lines.push('');
    lines.push(`   📈 Statistics:`);
    lines.push(`      Min: ${formatDuration(benchmark.statistics.min)}`);
    lines.push(`      Max: ${formatDuration(benchmark.statistics.max)}`);
    lines.push(`      Mean: ${formatDuration(benchmark.statistics.mean)}`);
    lines.push(`      Median: ${formatDuration(benchmark.statistics.median)}`);
    lines.push(`      Std Dev: ${formatDuration(benchmark.statistics.stdDev)}`);
    lines.push(`      Success Rate: ${(benchmark.statistics.successRate * 100).toFixed(1)}%`);
    lines.push('');
  });

  // Performance comparison
  if (options.compare) {
    lines.push('📊 Performance Comparison:');
    lines.push('-'.repeat(80));

    try {
      if (fs.existsSync(RESULTS_FILE)) {
        const previousResults = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8')) as {
          benchmarks: { name: string; statistics: { mean: number } }[];
        };

        results.benchmarks.forEach((current) => {
          const previous = previousResults.benchmarks.find((b) => b.name === current.name);

          if (previous) {
            const diff = current.statistics.mean - previous.statistics.mean;
            const diffPercent = ((diff / previous.statistics.mean) * 100).toFixed(1);
            const trend = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';

            lines.push(`   ${current.name}:`);
            lines.push(`      Current: ${formatDuration(current.statistics.mean)}`);
            lines.push(`      Previous: ${formatDuration(previous.statistics.mean)}`);
            lines.push(`      Change: ${trend} ${formatDuration(Math.abs(diff))} (${diffPercent}%)`);
            lines.push('');
          }
        });
      } else {
        lines.push('   No previous results found for comparison.');
        lines.push('');
      }
    } catch (error) {
      lines.push(`   Error comparing results: ${(error as Error).message}`);
      lines.push('');
    }
  }

  // Recommendations
  lines.push('💡 Recommendations:');
  lines.push('-'.repeat(80));

  const slowBenchmarks = results.benchmarks.filter((b) => b.statistics.mean > 5000);
  if (slowBenchmarks.length > 0) {
    lines.push('   ⚠️  Slow benchmarks detected ( > 5s):');
    slowBenchmarks.forEach((b) => {
      lines.push(`      - ${b.name}: ${formatDuration(b.statistics.mean)}`);
    });
    lines.push('');
  }

  const highVariance = results.benchmarks.filter((b) => b.statistics.stdDev / b.statistics.mean > 0.2);
  if (highVariance.length > 0) {
    lines.push('   ⚠️  High variance detected ( > 20% std dev):');
    highVariance.forEach((b) => {
      lines.push(`      - ${b.name}: ${((b.statistics.stdDev / b.statistics.mean) * 100).toFixed(1)}% variance`);
    });
    lines.push('');
  }

  const failedBenchmarks = results.benchmarks.filter((b) => b.statistics.successRate < 1);
  if (failedBenchmarks.length > 0) {
    lines.push('   ❌ Failed benchmarks:');
    failedBenchmarks.forEach((b) => {
      lines.push(`      - ${b.name}: ${(b.statistics.successRate * 100).toFixed(1)}% success rate`);
    });
    lines.push('');
  }

  if (slowBenchmarks.length === 0 && highVariance.length === 0 && failedBenchmarks.length === 0) {
    lines.push('   ✅ All benchmarks are performing well!');
    lines.push('');
  }

  lines.push('='.repeat(80));

  return lines.join('\n');
}

/**
 * Format results as JSON
 */
function formatJSON(): string {
  results.endTime = new Date().toISOString();

  const jsonResult = {
    metadata: {
      startTime: results.startTime,
      endTime: results.endTime,
      runs: options.runs,
    },
    benchmarks: results.benchmarks.map((b) => ({
      name: b.name,
      command: b.command,
      runs: b.runs,
      statistics: b.statistics,
    })),
    summary: {
      totalBenchmarks: results.benchmarks.length,
      totalRuns: results.benchmarks.length * options.runs,
      totalDuration: results.benchmarks.reduce((sum, b) => sum + b.runs.reduce((s, r) => s + r.durationMs, 0), 0),
    },
  };

  return JSON.stringify(jsonResult, null, 2);
}

/**
 * Save results to file
 */
function saveResults() {
  try {
    const json = formatJSON();
    fs.writeFileSync(RESULTS_FILE, json, 'utf8');
    console.log(`\n✅ Results saved to ${RESULTS_FILE}`);
    console.log(`   Use --compare to compare with previous results`);
  } catch (error) {
    console.error(`\n❌ Error saving results: ${(error as Error).message}`);
  }
}

/**
 * Main function
 */
function main() {
  const startTime = Date.now();

  console.log(`⚡ Starting performance benchmarking...\n`);

  // Determine which scripts to benchmark
  let scriptsToBenchmark: { name: string; command: string }[];

  if (options.script) {
    scriptsToBenchmark = [{ name: options.script, command: options.script }];
  } else {
    scriptsToBenchmark = getBenchmarkableScripts();
  }

  console.log(`Benchmarks to run: ${scriptsToBenchmark.length}`);
  console.log(`Runs per benchmark: ${options.runs}`);
  console.log('');

  // Run benchmarks
  for (const script of scriptsToBenchmark) {
    try {
      benchmarkCommand(script.command, script.name, options.runs);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`\n❌ Error benchmarking ${script.name}: ${message}`);
      results.benchmarks.push({
        name: script.name,
        command: script.command,
        runs: [],
        statistics: {} as BenchmarkStatistics,
        error: message,
      });
    }
  }

  results.endTime = new Date().toISOString();
  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n✅ Performance benchmarking completed in ${elapsedTime}s\n`);

  // Display results
  if (options.json) {
    console.log(formatJSON());
  } else {
    console.log(formatResults());
  }

  // Save results if requested
  if (options.save) {
    saveResults();
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    benchmarkCommand,
    calculateMedian,
    calculateStdDev,
    formatDuration,
    getBenchmarkableScripts,
    formatResults,
    formatJSON,
    getResults: () => ({ ...results }),
    resetResults: () => {
      results.benchmarks = [];
    },
  };
}

// Run if executed directly
if (require.main === module) {
  main();
}
