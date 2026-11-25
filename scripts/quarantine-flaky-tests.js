#!/usr/bin/env node
'use strict';

/**
 * P5.3: Advanced Flaky Test Quarantine System
 * 
 * Manages flaky tests by:
 * - Detecting flaky tests from detection runs
 * - Automatically quarantining flaky tests
 * - Providing commands to manage quarantine
 * - Integrating with CI/CD
 * 
 * Usage:
 *   node scripts/quarantine-flaky-tests.js [command] [options]
 * 
 * Commands:
 *   detect        - Detect flaky tests and quarantine them
 *   list          - List quarantined tests
 *   add [test]    - Add test to quarantine
 *   remove [test] - Remove test from quarantine
 *   clear         - Clear all quarantined tests
 *   check         - Check if tests pass without quarantined tests
 *   restore       - Temporarily restore quarantined tests for testing
 * 
 * Options:
 *   --runs, -r      Number of detection runs (default: 5)
 *   --threshold, -T  Failure threshold (default: 1)
 *   --file, -f      Quarantine file path (default: .flaky-tests.json)
 *   --force, -F     Force quarantine without confirmation
 *   --json, -j      Output as JSON
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  runs: 5,
  threshold: 1,
  file: '.flaky-tests.json',
  force: false,
  json: false,
  help: false,
};

let command = null;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === 'detect' || arg === 'list' || arg === 'add' || arg === 'remove' || 
      arg === 'clear' || arg === 'check' || arg === 'restore' || arg === 'help') {
    command = arg;
  } else if (arg === '--runs' || arg === '-r') {
    options.runs = parseInt(args[++i], 10) || 5;
  } else if (arg === '--threshold' || arg === '-T') {
    options.threshold = parseInt(args[++i], 10) || 1;
  } else if (arg === '--file' || arg === '-f') {
    options.file = args[++i];
  } else if (arg === '--force' || arg === '-F') {
    options.force = true;
  } else if (arg === '--json' || arg === '-j') {
    options.json = true;
  } else if (arg === '--help' || arg === '-h') {
    options.help = true;
  } else if (command === 'add' || command === 'remove') {
    // This is the test name argument
    // Do nothing, it will be handled later
  }
}

// Show help
if (options.help || !command) {
  console.log(`
🏳️  Flaky Test Quarantine System

Usage: node scripts/quarantine-flaky-tests.js [command] [options]

Commands:
  detect        - Detect flaky tests and quarantine them
  list          - List quarantined tests
  add [test]    - Add test to quarantine
  remove [test] - Remove test from quarantine
  clear         - Clear all quarantined tests
  check         - Check if tests pass without quarantined tests
  restore       - Temporarily restore quarantined tests for testing

Options:
  --runs, -r      Number of detection runs (default: 5)
  --threshold, -T  Failure threshold (default: 1)
  --file, -f      Quarantine file path (default: .flaky-tests.json)
  --force, -F     Force quarantine without confirmation
  --json, -j      Output as JSON
  --help, -h      Show help

Examples:
  node scripts/quarantine-flaky-tests.js detect
  node scripts/quarantine-flaky-tests.js list
  node scripts/quarantine-flaky-tests.js add "Test name"
  node scripts/quarantine-flaky-tests.js remove "Test name"
  node scripts/quarantine-flaky-tests.js detect --runs 10 --threshold 2
`);
  process.exit(0);
}

// Quarantine state
const quarantine = {
  file: options.file,
  data: {
    quarantinedTests: [],
    lastUpdated: null,
    detectedAt: null,
    version: '1.0',
  },
};

/**
 * Load quarantine data from file
 */
function loadQuarantine() {
  try {
    if (fs.existsSync(quarantine.file)) {
      const content = fs.readFileSync(quarantine.file, 'utf8');
      quarantine.data = JSON.parse(content);
    }
  } catch (error) {
    console.warn(`⚠️  Warning: Could not load quarantine file: ${error.message}`);
  }
  return quarantine.data;
}

/**
 * Save quarantine data to file
 */
function saveQuarantine() {
  try {
    quarantine.data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(quarantine.file, JSON.stringify(quarantine.data, null, 2), 'utf8');
    console.log(`✅ Quarantine saved to ${quarantine.file}`);
  } catch (error) {
    console.error(`❌ Error saving quarantine: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Format output as JSON
 */
function formatJSON(data) {
  return JSON.stringify(data, null, 2);
}

/**
 * Add test to quarantine
 */
function addToQuarantine(testName) {
  if (!quarantine.data.quarantinedTests.includes(testName)) {
    quarantine.data.quarantinedTests.push(testName);
    saveQuarantine();
    return true;
  }
  return false;
}

/**
 * Remove test from quarantine
 */
function removeFromQuarantine(testName) {
  const index = quarantine.data.quarantinedTests.indexOf(testName);
  if (index > -1) {
    quarantine.data.quarantinedTests.splice(index, 1);
    saveQuarantine();
    return true;
  }
  return false;
}

/**
 * Clear all quarantined tests
 */
function clearQuarantine() {
  quarantine.data.quarantinedTests = [];
  saveQuarantine();
}

/**
 * Detect flaky tests using detect-flaky-tests.js
 */
function detectFlakyTests() {
  console.log(`🔍 Detecting flaky tests (${options.runs} runs, threshold: ${options.threshold})...\n`);
  
  try {
    const output = execSync(
      `node scripts/detect-flaky-tests.js --runs ${options.runs} --threshold ${options.threshold} --json`,
      { encoding: 'utf8' }
    );
    
    const result = JSON.parse(output);
    return result;
  } catch (error) {
    console.error(`❌ Error detecting flaky tests: ${error.message}`);
    return null;
  }
}

/**
 * Get test file from test name
 */
function getTestFile(testName) {
  // Look for test files in scripts/ directory
  const scriptsDir = path.join(process.cwd(), 'scripts');
  const files = fs.readdirSync(scriptsDir);
  
  for (const file of files) {
    if (file.endsWith('.test.js')) {
      const filePath = path.join(scriptsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if testName exists in this file
      if (content.includes(testName)) {
        return filePath;
      }
    }
  }
  
  return null;
}

/**
 * Quarantine a test by adding test.skip()
 */
function quarantineTestInFile(testName) {
  const filePath = getTestFile(testName);
  
  if (!filePath) {
    console.warn(`⚠️  Could not find test "${testName}" in any test file`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the test and add .skip()
    // Pattern: test('test name' or test("test name"
    const pattern = new RegExp(`(test\s*\(\s*['"]${testName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"])\s*`, 'g');
    
    const newContent = content.replace(pattern, `$1.skip()`);
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Quarantined test "${testName}" in ${path.basename(filePath)}`);
      return true;
    } else {
      console.warn(`⚠️  Could not find exact test match for "${testName}"`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error quarantining test: ${error.message}`);
    return false;
  }
}

/**
 * Restore a test by removing test.skip()
 */
function restoreTestInFile(testName) {
  const filePath = getTestFile(testName);
  
  if (!filePath) {
    console.warn(`⚠️  Could not find test "${testName}" in any test file`);
    return false;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove .skip() from test
    const pattern = new RegExp(`(test\s*\(\s*['"]${testName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"])\s*\.skip\s*\(\)`, 'g');
    
    const newContent = content.replace(pattern, '$1');
    
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Restored test "${testName}" in ${path.basename(filePath)}`);
      return true;
    } else {
      console.warn(`⚠️  Could not find skipped test for "${testName}"`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error restoring test: ${error.message}`);
    return false;
  }
}

/**
 * Run tests without quarantined tests
 */
function runTestsWithoutQuarantine() {
  console.log('🧪 Running tests without quarantined tests...\n');
  
  try {
    // Create a temporary test file that excludes quarantined tests
    // For now, just run all tests
    const output = execSync('npm run test:all', { 
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    
    console.log(output);
    return true;
  } catch (error) {
    console.error(error.stdout);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  // Load quarantine data
  loadQuarantine();
  
  switch (command) {
    case 'detect':
      {
        const result = detectFlakyTests();
        
        if (!result) {
          process.exit(1);
        }
        
        if (result.flakyTests && result.flakyTests.length > 0) {
          console.log(`\n⚠️  Found ${result.flakyTests.length} flaky test(s):`);
          result.flakyTests.forEach(test => {
            console.log(`   - ${test.name} (${test.type})`);
          });
          
          if (!options.force) {
            console.log('\n💡 To quarantine these tests, use --force flag or confirm:');
            console.log('   Y/n?');
            
            const readline = require('readline');
            const rl = readline.createInterface({
              input: process.stdin,
              output: process.stdout,
            });
            
            rl.question('', (answer) => {
              rl.close();
              if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                quarantineTests(result.flakyTests.map(t => t.name));
              } else {
                console.log('❌ Quarantine cancelled.');
              }
            });
          } else {
            quarantineTests(result.flakyTests.map(t => t.name));
          }
        } else {
          console.log('\n✅ No flaky tests detected!');
        }
        
        if (options.json) {
          console.log(formatJSON(result));
        }
        break;
      }
    
    case 'list':
      {
        if (quarantine.data.quarantinedTests.length === 0) {
          console.log('ℹ️  No tests in quarantine.');
        } else {
          console.log(`📋 Quarantined Tests (${quarantine.data.quarantinedTests.length}):`);
          console.log('-'.repeat(50));
          quarantine.data.quarantinedTests.forEach((test, index) => {
            console.log(`   ${index + 1}. ${test}`);
          });
          console.log('-'.repeat(50));
          console.log(`Last updated: ${quarantine.data.lastUpdated || 'Never'}`);
        }
        
        if (options.json) {
          console.log(formatJSON(quarantine.data));
        }
        break;
      }
    
    case 'add':
      {
        const testName = args.find(arg => !arg.startsWith('-'));
        
        if (!testName) {
          console.error('❌ Error: Test name is required for add command.');
          console.error('   Usage: node scripts/quarantine-flaky-tests.js add "Test name"');
          process.exit(1);
        }
        
        if (addToQuarantine(testName)) {
          console.log(`✅ Added "${testName}" to quarantine.`);
        } else {
          console.log(`⚠️  "${testName}" is already in quarantine.`);
        }
        
        if (options.json) {
          console.log(formatJSON(quarantine.data));
        }
        break;
      }
    
    case 'remove':
      {
        const testName = args.find(arg => !arg.startsWith('-'));
        
        if (!testName) {
          console.error('❌ Error: Test name is required for remove command.');
          console.error('   Usage: node scripts/quarantine-flaky-tests.js remove "Test name"');
          process.exit(1);
        }
        
        if (removeFromQuarantine(testName)) {
          console.log(`✅ Removed "${testName}" from quarantine.`);
        } else {
          console.log(`⚠️  "${testName}" is not in quarantine.`);
        }
        
        if (options.json) {
          console.log(formatJSON(quarantine.data));
        }
        break;
      }
    
    case 'clear':
      {
        if (!options.force) {
          console.log('⚠️  This will clear ALL quarantined tests. Continue? Y/n');
          
          const readline = require('readline');
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });
          
          rl.question('', (answer) => {
            rl.close();
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
              clearQuarantine();
              console.log('✅ All quarantined tests cleared.');
            } else {
              console.log('❌ Clear cancelled.');
            }
          });
        } else {
          clearQuarantine();
          console.log('✅ All quarantined tests cleared.');
        }
        break;
      }
    
    case 'check':
      {
        const passed = runTestsWithoutQuarantine();
        process.exit(passed ? 0 : 1);
        break;
      }
    
    case 'restore':
      {
        console.log('🔄 Restoring quarantined tests...\n');
        
        const restored = [];
        for (const testName of quarantine.data.quarantinedTests) {
          if (restoreTestInFile(testName)) {
            restored.push(testName);
          }
        }
        
        console.log(`\n✅ Restored ${restored.length} test(s).`);
        
        if (restored.length > 0) {
          console.log('   To re-quarantine: node scripts/quarantine-flaky-tests.js detect --force');
        }
        break;
      }
    
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.error('   Use --help for usage information.');
      process.exit(1);
  }
}

/**
 * Quarantine multiple tests
 */
function quarantineTests(testNames) {
  let count = 0;
  
  for (const testName of testNames) {
    if (addToQuarantine(testName)) {
      if (quarantineTestInFile(testName)) {
        count++;
      }
    }
  }
  
  console.log(`\n✅ Quarantined ${count} test(s).`);
  console.log('   Tests have been added to quarantine and marked with test.skip().');
  console.log('   Use "list" command to see quarantined tests.');
  console.log('   Use "restore" command to restore tests.');
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadQuarantine,
    saveQuarantine,
    addToQuarantine,
    removeFromQuarantine,
    clearQuarantine,
    detectFlakyTests,
    getTestFile,
    quarantineTestInFile,
    restoreTestInFile,
    runTestsWithoutQuarantine,
    getQuarantine: () => ({ ...quarantine }),
    resetQuarantine: () => {
      quarantine.data = {
        quarantinedTests: [],
        lastUpdated: null,
        detectedAt: null,
        version: '1.0',
      };
    },
  };
}

// Run if executed directly
if (require.main === module) {
  main();
}
