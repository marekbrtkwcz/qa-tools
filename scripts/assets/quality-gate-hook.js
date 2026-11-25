#!/usr/bin/env node
'use strict';

/**
 * P5.1: Vibe CLI Quality Gate Hook
 *
 * This hook runs before tool calls to enforce quality gates:
 * - Prevents commits with failing quality checks
 * - Blocks file modifications that violate quality standards
 * - Runs on pre_tool events for file_system.write_file, edit, bash
 *
 * Usage: Added to bundles.yaml under hooks:
 *   hooks:
 *     - type: pre_tool
 *       match: [file_system.write_file, edit, bash]
 *       command: node vibe-hooks/quality-gate-hook.js
 *       strict: false
 */

const fs = require('node:fs');
const { execSync } = require('node:child_process');

// Configuration
const ALLOWED_COMMANDS = ['git add', 'git commit', 'git push', 'npm run'];
const BLOCKED_FILES = ['package-lock.json', 'node_modules/'];

// State
const state = {
  lastCheck: null,
  lastCheckPassed: null,
  cache: new Map(),
};

/**
 * Check if we should run quality gates for this operation
 */
function shouldRunQualityGate(operation, args) {
  // Check if this is a file modification
  if (operation === 'file_system.write_file' || operation === 'edit') {
    // Skip if modifying allowed files
    if (args?.file_path) {
      for (const blocked of BLOCKED_FILES) {
        if (args.file_path.includes(blocked)) {
          return false;
        }
      }
    }
    return true;
  }

  // Check if this is a bash command that might affect quality
  if (operation === 'bash') {
    const command = args?.command || '';
    for (const allowed of ALLOWED_COMMANDS) {
      if (command.startsWith(allowed)) {
        return false;
      }
    }
    return true;
  }

  return false;
}

/**
 * Run quality checks
 */
function runQualityChecks() {
  const results = {};

  try {
    // Check P2
    try {
      execSync('npm run p2', {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        encoding: 'utf8',
      });
      results.p2 = { passed: true, error: null };
    } catch (error) {
      results.p2 = { passed: false, error: error.message };
    }

    // Check P3
    try {
      execSync('npm run test:p3', {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        encoding: 'utf8',
      });
      results.p3 = { passed: true, error: null };
    } catch (error) {
      results.p3 = { passed: false, error: error.message };
    }

    // Check lint
    try {
      execSync('npm run lint', {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        encoding: 'utf8',
      });
      results.lint = { passed: true, error: null };
    } catch (error) {
      results.lint = { passed: false, error: error.message };
    }

    // Check build
    try {
      execSync('npm run build', {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        encoding: 'utf8',
      });
      results.build = { passed: true, error: null };
    } catch (error) {
      results.build = { passed: false, error: error.message };
    }

    // Check verify (drift gate)
    try {
      execSync('npm run verify', {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        encoding: 'utf8',
      });
      results.verify = { passed: true, error: null };
    } catch (error) {
      results.verify = { passed: false, error: error.message };
    }

    state.lastCheck = new Date();
    state.lastCheckPassed = Object.values(results).every((r) => r.passed);
    state.cache.set('lastCheck', { results, timestamp: state.lastCheck });

    return results;
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Format check results
 */
function formatResults(results) {
  const lines = [];

  if (results.error) {
    lines.push(`❌ Quality Gate Error: ${results.error}`);
    return lines.join('\n');
  }

  lines.push('🔍 Quality Gate Check Results:');
  lines.push('-'.repeat(50));

  for (const [check, result] of Object.entries(results)) {
    const status = result.passed ? '✅' : '❌';
    const error = result.error ? ` (${result.error.substring(0, 50)})` : '';
    lines.push(`   ${status} ${check}${error}`);
  }

  lines.push('-'.repeat(50));

  const allPassed = Object.values(results).every((r) => r.passed);
  if (allPassed) {
    lines.push('✅ All quality gates passed!');
  } else {
    lines.push('❌ Some quality gates failed!');
    lines.push('   Please run: npm run p2 && npm run test:p3 && npm run lint');
  }

  return lines.join('\n');
}

/**
 * Check if all quality gates passed
 */
function allGatesPassed(results) {
  if (results.error) return false;
  return Object.values(results).every((r) => r.passed);
}

/**
 * Main hook function
 */
function main() {
  // This hook runs in pre_tool context
  // It receives tool call information from stdin

  const input = JSON.parse(fs.readFileSync(0, 'utf8'));
  const { name, arguments: args } = input;

  // Check if we should run quality gate
  if (!shouldRunQualityGate(name, args)) {
    // Just pass through
    process.exit(0);
  }

  // Check if we have cached results
  const cached = state.cache.get('lastCheck');
  if (cached && state.lastCheckPassed) {
    // If last check passed and we're within a reasonable timeframe, allow
    const now = new Date();
    const diffMs = now - state.lastCheck;

    if (diffMs < 30000) {
      // 30 seconds
      process.exit(0);
    }
  }

  // Run quality checks
  const results = runQualityChecks();
  const output = formatResults(results);

  console.error(output);

  // If all gates passed, allow the operation
  if (allGatesPassed(results)) {
    process.exit(0);
  } else {
    // Block the operation
    console.error('\n❌ Quality Gate BLOCKED: Operation cannot proceed with failing quality checks.');
    console.error('   Please fix the issues and try again.');
    process.exit(1);
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    shouldRunQualityGate,
    runQualityChecks,
    formatResults,
    allGatesPassed,
    getState: () => ({ ...state }),
    resetState: () => {
      state.lastCheck = null;
      state.lastCheckPassed = null;
      state.cache.clear();
    },
  };
}

// Run if executed directly
if (require.main === module) {
  main();
}
