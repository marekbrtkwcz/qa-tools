#!/usr/bin/env node
'use strict';

/**
 * P4.3: Flaky Test Detection Script
 * 
 * Detects flaky (intermittently failing) tests by:
 * - Running tests multiple times
 * - Tracking inconsistent results
 * - Identifying tests that pass/fail randomly
 * 
 * Usage:
 *   node scripts/detect-flaky-tests.js [options]
 * 
 * Options:
 *   --runs, -r      Number of times to run tests (default: 5)
 *   --test, -t      Specific test file to check
 *   --threshold, -T  Failure threshold for flaky detection (default: 1)
 *   --check, -c     Exit with code 1 if flaky tests found
 *   --json, -j      Output results as JSON
 *   --help, -h      Show help
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  runs: 5,
  test: null,
  threshold: 1,
  check: false,
  json: false,
  help: false,
};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--runs':
    case '-r':
      options.runs = parseInt(args[++i], 10) || 5;
      break;
    case '--test':
    case '-t':
      options.test = args[++i];
      break;
    case '--threshold':
    case '-T':
      options.threshold = parseInt(args[++i], 10) || 1;
      break;
    case '--check':
    case '-c':
      options.check = true;
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
🔍 Flaky Test Detection

Usage: node scripts/detect-flaky-tests.js [options]

Options:
  --runs, -r      Number of times to run tests (default: 5)
  --test, -t      Specific test file to check
  --threshold, -T  Failure threshold for flaky detection (default: 1)
  --check, -c     Exit with code 1 if flaky tests found
  --json, -j      Output results as JSON
  --help, -h      Show help

Examples:
  node scripts/detect-flaky-tests.js
  node scripts/detect-flaky-tests.js --runs 10 --check
  node scripts/detect-flaky-tests.js --test scripts/validate-links.test.js --runs 5
`);
  process.exit(0);
}

// Results storage
const results = {
  allTests: new Map(), // testName -> { runs: number, passed: number, failed: number, results: [] }
  flakyTests: [],
  totalRuns: options.runs,
  startTime: new Date().toISOString(),
  endTime: null,
};

/**
 * Run a test command and parse results
 */
function runTest(testCommand, runNumber) {
  const testResults = {};
  const startTime = Date.now();
  
  try {
    // Run the test and capture output
    const output = execSync(testCommand, {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });
    const duration = Date.now() - startTime;
    
    // Parse test results from node:test output
    const parsed = parseTestOutput(output, true);
    
    testResults.passed = parsed.passed;
    testResults.failed = parsed.failed;
    testResults.skipped = parsed.skipped;
    testResults.todo = parsed.todo;
    testResults.duration = duration;
    testResults.output = output;
    testResults.runNumber = runNumber;
    testResults.success = parsed.failed === 0;
    testResults.tests = parsed.tests || [];
    
    return testResults;
  } catch (error) {
    const duration = Date.now() - startTime;
    const output = error.stdout || error.message;
    
    // Parse failed test output
    const parsed = parseTestOutput(output, false);
    
    testResults.passed = parsed.passed || 0;
    testResults.failed = parsed.failed || 1;
    testResults.skipped = parsed.skipped || 0;
    testResults.todo = parsed.todo || 0;
    testResults.duration = duration;
    testResults.output = output;
    testResults.runNumber = runNumber;
    testResults.success = false;
    testResults.tests = parsed.tests || [];
    testResults.error = error.message;
    
    return testResults;
  }
}

/**
 * Parse node:test output
 */
function parseTestOutput(output, success) {
  const result = {
    passed: 0,
    failed: 0,
    skipped: 0,
    todo: 0,
    tests: [],
  };
  
  // Try to parse node:test TAP output
  // Format: # tests 68
  //         # pass 68
  //         # fail 0
  const testsMatch = output.match(/# tests (\d+)/);
  const passMatch = output.match(/# pass (\d+)/);
  const failMatch = output.match(/# fail (\d+)/);
  const skipMatch = output.match(/# skip (\d+)/);
  const todoMatch = output.match(/# todo (\d+)/);
  
  if (testsMatch) result.testsCount = parseInt(testsMatch[1], 10);
  if (passMatch) result.passed = parseInt(passMatch[1], 10);
  if (failMatch) result.failed = parseInt(failMatch[1], 10);
  if (skipMatch) result.skipped = parseInt(skipMatch[1], 10);
  if (todoMatch) result.todo = parseInt(todoMatch[1], 10);
  
  // Parse individual test results
  const testLines = output.split('\n').filter(line => 
    (line.startsWith('# ok') || line.startsWith('# not ok') || 
     line.startsWith('ok') || line.startsWith('not ok')) &&
    !line.includes('# tests') && 
    !line.includes('# pass') && 
    !line.includes('# fail') &&
    !line.includes('# skip') &&
    !line.includes('# todo')
  );
  
  testLines.forEach(line => {
    // Format: # ok 1 - test name or ok 1 - test name
    //         # not ok 1 - test name or not ok 1 - test name
    const match = line.match(/^(?:#\s*)?(ok|not ok) (\d+) - (.+)$/);
    if (match) {
      result.tests.push({
        id: parseInt(match[2], 10),
        name: match[3],
        passed: match[1] === 'ok',
      });
    }
  });
  
  return result;
}

/**
 * Analyze flaky tests
 */
function analyzeFlakyTests() {
  const flaky = [];
  
  results.allTests.forEach((testData, testName) => {
    // A test is flaky if:
    // - It failed at least once AND passed at least once (inconsistent)
    // - OR it failed more than threshold times
    
    const hasFailed = testData.failed > 0;
    const hasPassed = testData.passed > 0;
    
    if (hasFailed && hasPassed) {
      // Inconsistent results - definitely flaky
      flaky.push({
        name: testName,
        type: 'inconsistent',
        passed: testData.passed,
        failed: testData.failed,
        stability: calculateStability(testData),
        runs: testData.results.map(r => r.success ? '✅' : '❌'),
      });
    } else if (testData.failed >= options.threshold) {
      // Failed consistently - might be a real bug
      flaky.push({
        name: testName,
        type: 'consistent_failure',
        passed: testData.passed,
        failed: testData.failed,
        stability: 0,
        runs: testData.results.map(r => r.success ? '✅' : '❌'),
      });
    }
  });
  
  // Sort by stability (most flaky first)
  flaky.sort((a, b) => a.stability - b.stability);
  
  results.flakyTests = flaky;
  
  return flaky;
}

/**
 * Calculate stability score (0 = very flaky, 100 = very stable)
 */
function calculateStability(testData) {
  const total = testData.passed + testData.failed;
  if (total === 0) return 100;
  
  // Inconsistent = very flaky (0 stability)
  if (testData.passed > 0 && testData.failed > 0) return 0;
  
  // Consistent pass = 100 stability
  if (testData.failed === 0) return 100;
  
  // Consistent fail = 50 stability (might be a real bug)
  return 50;
}

/**
 * Format results for display
 */
function formatResults() {
  const lines = [];
  const flaky = analyzeFlakyTests();
  
  results.endTime = new Date().toISOString();
  
  // Header
  lines.push('='.repeat(80));
  lines.push('🔍 FLAKY TEST DETECTION RESULTS');
  lines.push('='.repeat(80));
  lines.push('');
  
  // Summary
  lines.push(`📊 Summary:`);
  lines.push(`   Runs: ${options.runs}`);
  lines.push(`   Tests analyzed: ${results.allTests.size}`);
  lines.push(`   Flaky tests found: ${flaky.length}`);
  lines.push(`   Threshold: ${options.threshold}`);
  lines.push('');
  
  if (flaky.length === 0) {
    lines.push('✅ No flaky tests detected!');
    lines.push('');
    lines.push('All tests passed consistently across all runs.');
    lines.push('');
  } else {
    lines.push('⚠️  FLAKY TESTS DETECTED:');
    lines.push('-'.repeat(80));
    
    flaky.forEach(test => {
      lines.push('');
      lines.push(`   📝 ${test.name}`);
      lines.push(`      Type: ${test.type.replace('_', ' ').toUpperCase()}`);
      lines.push(`      Passed: ${test.passed}/${options.runs}`);
      lines.push(`      Failed: ${test.failed}/${options.runs}`);
      lines.push(`      Stability: ${test.stability}%`);
      lines.push(`      Results: ${test.runs.join(' ')}`);
      lines.push('');
    });
    
    lines.push('-'.repeat(80));
    
    if (flaky.length > 0) {
      lines.push('');
      lines.push('💡 Recommendations:');
      lines.push('   1. Investigate tests with inconsistent results (✅❌✅❌)');
      lines.push('   2. Check for timing issues, race conditions, or external dependencies');
      lines.push('   3. Add retries with quarantine for flaky tests');
      lines.push('   4. Consider marking flaky tests with test.skip() temporarily');
      lines.push('');
    }
  }
  
  // Run details
  lines.push('📋 Run Details:');
  lines.push('-'.repeat(80));
  
  results.allTests.forEach((testData, testName) => {
    lines.push(`   📝 ${testName}`);
    lines.push(`      Runs: ${testData.results.length}`);
    lines.push(`      Passed: ${testData.passed}`);
    lines.push(`      Failed: ${testData.failed}`);
    lines.push('');
  });
  
  lines.push('='.repeat(80));
  
  return lines.join('\n');
}

/**
 * Format results as JSON
 */
function formatJSON() {
  const flaky = analyzeFlakyTests();
  
  const jsonResult = {
    metadata: {
      startTime: results.startTime,
      endTime: new Date().toISOString(),
      runs: options.runs,
      threshold: options.threshold,
    },
    summary: {
      testsAnalyzed: results.allTests.size,
      flakyTests: flaky.length,
      passed: true,
    },
    flakyTests: flaky,
    allTests: Object.fromEntries(results.allTests),
  };
  
  // Update summary passed flag
  jsonResult.summary.passed = flaky.length === 0;
  
  return JSON.stringify(jsonResult, null, 2);
}

/**
 * Get test command based on options
 */
function getTestCommand() {
  if (options.test) {
    return `node --test ${options.test}`;
  }
  return 'npm run test:all';
}

/**
 * Main function
 */
function main() {
  const startTime = Date.now();
  const testCommand = getTestCommand();
  
  console.log(`🔍 Starting flaky test detection...\n`);
  console.log(`   Runs: ${options.runs}`);
  console.log(`   Threshold: ${options.threshold}`);
  console.log(`   Test command: ${testCommand}\n`);
  
  // Run tests multiple times
  for (let i = 1; i <= options.runs; i++) {
    console.log(`Run ${i}/${options.runs}...`);
    
    const testResult = runTest(testCommand, i);
    
    // Process individual test results
    if (testResult.tests && testResult.tests.length > 0) {
      testResult.tests.forEach(test => {
        const testName = test.name;
        
        if (!results.allTests.has(testName)) {
          results.allTests.set(testName, {
            passed: 0,
            failed: 0,
            results: [],
          });
        }
        
        const testData = results.allTests.get(testName);
        testData.results.push({
          run: i,
          success: test.passed,
          duration: testResult.duration / testResult.tests.length || 0,
        });
        
        if (test.passed) {
          testData.passed++;
        } else {
          testData.failed++;
        }
      });
    } else {
      // If we can't parse individual tests, treat the whole run as one test
      const suiteName = testCommand;
      
      if (!results.allTests.has(suiteName)) {
        results.allTests.set(suiteName, {
          passed: 0,
          failed: 0,
          results: [],
        });
      }
      
      const testData = results.allTests.get(suiteName);
      testData.results.push({
        run: i,
        success: testResult.success,
        duration: testResult.duration,
      });
      
      if (testResult.success) {
        testData.passed++;
      } else {
        testData.failed++;
      }
    }
    
    console.log(`   ✅ Passed: ${testResult.passed}, Failed: ${testResult.failed}, Duration: ${(testResult.duration / 1000).toFixed(2)}s`);
  }
  
  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ Flaky test detection completed in ${elapsedTime}s\n`);
  
  // Analyze and display results
  const flaky = analyzeFlakyTests();
  
  if (options.json) {
    console.log(formatJSON());
  } else {
    console.log(formatResults());
  }
  
  // Exit with appropriate code
  const exitCode = options.check && flaky.length > 0 ? 1 : 0;
  process.exit(exitCode);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runTest,
    parseTestOutput,
    analyzeFlakyTests,
    calculateStability,
    formatResults,
    formatJSON,
    getTestCommand,
    getResults: () => ({ ...results }),
    resetResults: () => {
      results.allTests.clear();
      results.flakyTests = [];
    },
  };
}

// Run if executed directly
if (require.main === module) {
  main();
}
