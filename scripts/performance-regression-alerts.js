#!/usr/bin/env node
'use strict';

/**
 * P5.4: Performance Regression Alerts System
 * 
 * Monitors performance benchmarks and alerts when:
 * - Performance degrades beyond threshold
 * - New benchmarks are added
 * - Performance improves significantly
 * 
 * Usage:
 *   node scripts/performance-regression-alerts.js [command] [options]
 * 
 * Commands:
 *   baseline     - Create baseline performance measurements
 *   check        - Check current performance against baseline
 *   monitor      - Monitor performance continuously
 *   history      - Show performance history
 *   alert       - Generate alert if regression detected
 *   clear        - Clear baseline or history
 * 
 * Options:
 *   --script, -s    Specific script to benchmark
 *   --runs, -r      Number of runs (default: 5)
 *   --threshold, -T  Regression threshold percentage (default: 10)
 *   --file, -f      Baseline file path (default: .performance-baseline.json)
 *   --history, -H   History file path (default: .performance-history.json)
 *   --json, -j      Output as JSON
 *   --force, -F     Force overwrite of baseline
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  script: null,
  runs: 5,
  threshold: 10, // 10% regression threshold
  baselineFile: '.performance-baseline.json',
  historyFile: '.performance-history.json',
  json: false,
  force: false,
  help: false,
};

let command = null;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === 'baseline' || arg === 'check' || arg === 'monitor' || 
      arg === 'history' || arg === 'alert' || arg === 'clear' || arg === 'help') {
    command = arg;
  } else if (arg === '--script' || arg === '-s') {
    options.script = args[++i];
  } else if (arg === '--runs' || arg === '-r') {
    options.runs = parseInt(args[++i], 10) || 5;
  } else if (arg === '--threshold' || arg === '-T') {
    options.threshold = parseInt(args[++i], 10) || 10;
  } else if (arg === '--file' || arg === '-f') {
    options.baselineFile = args[++i];
  } else if (arg === '--history' || arg === '-H') {
    options.historyFile = args[++i];
  } else if (arg === '--json' || arg === '-j') {
    options.json = true;
  } else if (arg === '--force' || arg === '-F') {
    options.force = true;
  } else if (arg === '--help' || arg === '-h') {
    options.help = true;
  }
}

// Show help
if (options.help || !command) {
  console.log(`
📊 Performance Regression Alerts System

Usage: node scripts/performance-regression-alerts.js [command] [options]

Commands:
  baseline     - Create baseline performance measurements
  check        - Check current performance against baseline
  monitor      - Monitor performance continuously
  history      - Show performance history
  alert        - Generate alert if regression detected
  clear        - Clear baseline or history

Options:
  --script, -s    Specific script to benchmark
  --runs, -r      Number of runs (default: 5)
  --threshold, -T  Regression threshold percentage (default: 10)
  --file, -f      Baseline file path (default: .performance-baseline.json)
  --history, -H   History file path (default: .performance-history.json)
  --json, -j      Output as JSON
  --force, -F     Force overwrite of baseline
  --help, -h      Show help

Examples:
  node scripts/performance-regression-alerts.js baseline
  node scripts/performance-regression-alerts.js check
  node scripts/performance-regression-alerts.js check --threshold 5
  node scripts/performance-regression-alerts.js history
`);
  process.exit(0);
}

// State
const state = {
  baseline: {
    file: options.baselineFile,
    data: { benchmarks: [], createdAt: null, version: '1.0' },
  },
  history: {
    file: options.historyFile,
    data: { entries: [], version: '1.0' },
  },
};

/**
 * Load baseline data
 */
function loadBaseline() {
  try {
    if (fs.existsSync(state.baseline.file)) {
      const content = fs.readFileSync(state.baseline.file, 'utf8');
      state.baseline.data = JSON.parse(content);
    }
  } catch (error) {
    console.warn(`⚠️  Warning: Could not load baseline file: ${error.message}`);
  }
  return state.baseline.data;
}

/**
 * Save baseline data
 */
function saveBaseline() {
  try {
    state.baseline.data.createdAt = new Date().toISOString();
    fs.writeFileSync(state.baseline.file, JSON.stringify(state.baseline.data, null, 2), 'utf8');
    console.log(`✅ Baseline saved to ${state.baseline.file}`);
  } catch (error) {
    console.error(`❌ Error saving baseline: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Load history data
 */
function loadHistory() {
  try {
    if (fs.existsSync(state.history.file)) {
      const content = fs.readFileSync(state.history.file, 'utf8');
      state.history.data = JSON.parse(content);
    }
  } catch (error) {
    console.warn(`⚠️  Warning: Could not load history file: ${error.message}`);
  }
  return state.history.data;
}

/**
 * Save history data
 */
function saveHistory() {
  try {
    fs.writeFileSync(state.history.file, JSON.stringify(state.history.data, null, 2), 'utf8');
  } catch (error) {
    console.error(`❌ Error saving history: ${error.message}`);
  }
}

/**
 * Format duration in milliseconds
 */
function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  } else {
    return `${(ms / 60000).toFixed(2)}m`;
  }
}

/**
 * Calculate mean
 */
function calculateMean(values) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values) {
  const mean = calculateMean(values);
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Benchmark a command
 */
function benchmarkCommand(command, name, runs = options.runs) {
  const durations = [];
  
  for (let i = 1; i <= runs; i++) {
    try {
      const startTime = process.hrtime.bigint();
      execSync(command, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;
      durations.push(durationMs);
    } catch (error) {
      // Ignore errors for benchmarking
    }
  }
  
  return {
    name: name,
    command: command,
    runs: runs,
    durations: durations,
    statistics: {
      min: Math.min(...durations),
      max: Math.max(...durations),
      mean: calculateMean(durations),
      median: durations.sort((a, b) => a - b)[Math.floor(durations.length / 2)],
      stdDev: calculateStdDev(durations),
    },
  };
}

/**
 * Get benchmarkable scripts
 */
function getBenchmarkableScripts() {
  if (options.script) {
    return [{ name: options.script, command: options.script }];
  }
  
  return [
    { name: 'P2: CHANGELOG check', command: 'npm run changelog:check' },
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
 * Create baseline measurements
 */
function createBaseline() {
  console.log('📊 Creating performance baseline...\n');
  
  loadBaseline();
  
  if (!options.force && state.baseline.data.benchmarks.length > 0) {
    console.log('⚠️  Baseline already exists. Use --force to overwrite.');
    process.exit(1);
  }
  
  const scripts = getBenchmarkableScripts();
  const benchmarks = [];
  
  for (const script of scripts) {
    console.log(`   Benchmarking: ${script.name}...`);
    const benchmark = benchmarkCommand(script.command, script.name, options.runs);
    benchmarks.push(benchmark);
    console.log(`   ✅ ${benchmark.statistics.mean.toFixed(2)}ms (min: ${benchmark.statistics.min.toFixed(2)}ms, max: ${benchmark.statistics.max.toFixed(2)}ms)`);
  }
  
  state.baseline.data.benchmarks = benchmarks;
  saveBaseline();
  
  console.log(`\n✅ Baseline created with ${benchmarks.length} benchmarks.`);
  
  if (options.json) {
    console.log(formatJSON(state.baseline.data));
  }
}

/**
 * Check current performance against baseline
 */
function checkPerformance() {
  console.log('📊 Checking performance against baseline...\n');
  
  loadBaseline();
  loadHistory();
  
  if (state.baseline.data.benchmarks.length === 0) {
    console.log('❌ No baseline found. Create baseline first: node scripts/performance-regression-alerts.js baseline');
    process.exit(1);
  }
  
  const currentBenchmarks = [];
  const alerts = [];
  const improvements = [];
  
  for (const baselineBenchmark of state.baseline.data.benchmarks) {
    console.log(`   Checking: ${baselineBenchmark.name}...`);
    
    const current = benchmarkCommand(
      baselineBenchmark.command,
      baselineBenchmark.name,
      options.runs
    );
    
    currentBenchmarks.push(current);
    
    // Calculate regression
    const baselineMean = baselineBenchmark.statistics.mean;
    const currentMean = current.statistics.mean;
    const regressionPercent = ((currentMean - baselineMean) / baselineMean) * 100;
    
    if (regressionPercent > options.threshold) {
      alerts.push({
        name: baselineBenchmark.name,
        baseline: baselineMean,
        current: currentMean,
        regressionPercent: regressionPercent,
        severity: regressionPercent > options.threshold * 2 ? 'high' : 'medium',
      });
      console.log(`   ⚠️  REGRESSION: ${regressionPercent.toFixed(1)}% (${formatDuration(baselineMean)} → ${formatDuration(currentMean)})`);
    } else if (regressionPercent < -options.threshold) {
      improvements.push({
        name: baselineBenchmark.name,
        baseline: baselineMean,
        current: currentMean,
        improvementPercent: -regressionPercent,
      });
      console.log(`   ✅ IMPROVEMENT: ${(-regressionPercent).toFixed(1)}% (${formatDuration(baselineMean)} → ${formatDuration(currentMean)})`);
    } else {
      console.log(`   ✅ STABLE: ${regressionPercent.toFixed(1)}% (${formatDuration(baselineMean)} → ${formatDuration(currentMean)})`);
    }
  }
  
  // Save to history
  state.history.data.entries.push({
    timestamp: new Date().toISOString(),
    benchmarks: currentBenchmarks,
    alerts: alerts,
    improvements: improvements,
  });
  saveHistory();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Performance Check Summary:');
  console.log('-'.repeat(60));
  console.log(`   Total benchmarks: ${currentBenchmarks.length}`);
  console.log(`   Alerts: ${alerts.length}`);
  console.log(`   Improvements: ${improvements.length}`);
  
  if (alerts.length > 0) {
    console.log('\n⚠️  Performance Regressions:');
    console.log('-'.repeat(60));
    alerts.forEach(alert => {
      console.log(`   [${alert.severity.toUpperCase()}] ${alert.name}`);
      console.log(`      Baseline: ${formatDuration(alert.baseline)}`);
      console.log(`      Current: ${formatDuration(alert.current)}`);
      console.log(`      Regression: ${alert.regressionPercent.toFixed(1)}%`);
    });
  }
  
  if (improvements.length > 0) {
    console.log('\n✅ Performance Improvements:');
    console.log('-'.repeat(60));
    improvements.forEach(imp => {
      console.log(`   ${imp.name}`);
      console.log(`      Baseline: ${formatDuration(imp.baseline)}`);
      console.log(`      Current: ${formatDuration(imp.current)}`);
      console.log(`      Improvement: ${imp.improvementPercent.toFixed(1)}%`);
    });
  }
  
  if (options.json) {
    console.log(formatJSON({
      benchmarks: currentBenchmarks,
      alerts: alerts,
      improvements: improvements,
    }));
  }
  
  // Exit with error code if there are high severity alerts
  const highSeverityAlerts = alerts.filter(a => a.severity === 'high');
  if (highSeverityAlerts.length > 0) {
    console.log(`\n❌ ${highSeverityAlerts.length} high severity performance regression(s) detected!`);
    process.exit(1);
  }
}

/**
 * Monitor performance continuously
 */
function monitorPerformance() {
  console.log('📊 Starting continuous performance monitoring...\n');
  console.log('Press Ctrl+C to stop.\n');
  
  // Run check every hour
  const interval = 60 * 60 * 1000; // 1 hour
  
  const monitor = setInterval(() => {
    console.log(`\n🕒 Monitoring at ${new Date().toISOString()}\n`);
    checkPerformance();
  }, interval);
  
  // Handle Ctrl+C
  process.on('SIGINT', () => {
    clearInterval(monitor);
    console.log('\n✅ Performance monitoring stopped.');
    process.exit(0);
  });
  
  // Initial check
  checkPerformance();
}

/**
 * Show performance history
 */
function showHistory() {
  console.log('📊 Performance History:\n');
  
  loadHistory();
  
  if (state.history.data.entries.length === 0) {
    console.log('ℹ️  No history entries found.');
    process.exit(0);
  }
  
  console.log(`Found ${state.history.data.entries.length} history entries.\n`);
  
  state.history.data.entries.forEach((entry, index) => {
    console.log(`${index + 1}. ${new Date(entry.timestamp).toLocaleString()}`);
    console.log(`   Alerts: ${entry.alerts.length}, Improvements: ${entry.improvements.length}`);
    
    if (entry.alerts.length > 0) {
      console.log('   Regressions:');
      entry.alerts.forEach(alert => {
        console.log(`      - ${alert.name}: ${alert.regressionPercent.toFixed(1)}%`);
      });
    }
    
    if (entry.improvements.length > 0) {
      console.log('   Improvements:');
      entry.improvements.forEach(imp => {
        console.log(`      - ${imp.name}: ${imp.improvementPercent.toFixed(1)}%`);
      });
    }
    console.log('');
  });
  
  if (options.json) {
    console.log(formatJSON(state.history.data));
  }
}

/**
 * Generate alert
 */
function generateAlert() {
  console.log('🚨 Generating performance regression alert...\n');
  
  loadBaseline();
  loadHistory();
  
  const currentBenchmarks = [];
  const alerts = [];
  
  for (const baselineBenchmark of state.baseline.data.benchmarks) {
    const current = benchmarkCommand(
      baselineBenchmark.command,
      baselineBenchmark.name,
      options.runs
    );
    
    currentBenchmarks.push(current);
    
    const baselineMean = baselineBenchmark.statistics.mean;
    const currentMean = current.statistics.mean;
    const regressionPercent = ((currentMean - baselineMean) / baselineMean) * 100;
    
    if (regressionPercent > options.threshold) {
      alerts.push({
        name: baselineBenchmark.name,
        baseline: baselineMean,
        current: currentMean,
        regressionPercent: regressionPercent,
        severity: regressionPercent > options.threshold * 2 ? 'high' : 'medium',
      });
    }
  }
  
  if (alerts.length === 0) {
    console.log('✅ No performance regressions detected.');
    process.exit(0);
  }
  
  // Generate alert message
  console.log('🚨 PERFORMANCE REGRESSION ALERT');
  console.log('='.repeat(60));
  console.log(`Generated: ${new Date().toISOString()}`);
  console.log(`Threshold: ${options.threshold}%`);
  console.log(`Alerts: ${alerts.length}\n`);
  
  alerts.forEach(alert => {
    console.log(`[${alert.severity.toUpperCase()}] ${alert.name}`);
    console.log(`   Baseline: ${formatDuration(alert.baseline)}`);
    console.log(`   Current: ${formatDuration(alert.current)}`);
    console.log(`   Regression: ${alert.regressionPercent.toFixed(1)}%`);
    console.log('');
  });
  
  console.log('='.repeat(60));
  console.log('Recommended actions:');
  console.log('   1. Investigate the regressions');
  console.log('   2. Check for recent changes that might have caused this');
  console.log('   3. Review performance benchmarks');
  console.log('   4. Optimize code if necessary');
  
  if (options.json) {
    console.log(formatJSON({ alerts, timestamp: new Date().toISOString() }));
  }
  
  process.exit(alerts.length > 0 ? 1 : 0);
}

/**
 * Clear baseline or history
 */
function clearData() {
  if (args.includes('baseline')) {
    if (fs.existsSync(state.baseline.file)) {
      fs.unlinkSync(state.baseline.file);
      console.log(`✅ Baseline file deleted: ${state.baseline.file}`);
    } else {
      console.log('ℹ️  Baseline file does not exist.');
    }
  } else if (args.includes('history')) {
    if (fs.existsSync(state.history.file)) {
      fs.unlinkSync(state.history.file);
      console.log(`✅ History file deleted: ${state.history.file}`);
    } else {
      console.log('ℹ️  History file does not exist.');
    }
  } else {
    // Clear both
    if (fs.existsSync(state.baseline.file)) {
      fs.unlinkSync(state.baseline.file);
      console.log(`✅ Baseline file deleted: ${state.baseline.file}`);
    }
    if (fs.existsSync(state.history.file)) {
      fs.unlinkSync(state.history.file);
      console.log(`✅ History file deleted: ${state.history.file}`);
    }
    console.log('\n✅ All performance data cleared.');
  }
}

/**
 * Format as JSON
 */
function formatJSON(data) {
  return JSON.stringify(data, null, 2);
}

/**
 * Main function
 */
function main() {
  switch (command) {
    case 'baseline':
      createBaseline();
      break;
    
    case 'check':
      checkPerformance();
      break;
    
    case 'monitor':
      monitorPerformance();
      break;
    
    case 'history':
      showHistory();
      break;
    
    case 'alert':
      generateAlert();
      break;
    
    case 'clear':
      clearData();
      break;
    
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.error('   Use --help for usage information.');
      process.exit(1);
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadBaseline,
    saveBaseline,
    loadHistory,
    saveHistory,
    formatDuration,
    calculateMean,
    calculateStdDev,
    benchmarkCommand,
    getBenchmarkableScripts,
    createBaseline,
    checkPerformance,
    generateAlert,
    clearData,
    getState: () => ({ ...state }),
    resetState: () => {
      state.baseline.data = { benchmarks: [], createdAt: null, version: '1.0' };
      state.history.data = { entries: [], version: '1.0' };
    },
  };
}

// Run if executed directly
if (require.main === module) {
  main();
}
