#!/usr/bin/env node
'use strict';

/**
 * Unit tests for quarantine-flaky-tests.js
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

// Import the module
const quarantine = require('./quarantine-flaky-tests.ts');

// Create a temporary directory for test files
const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'quarantine-test-'));
const quarantineFile = path.join(testDir, 'test-quarantine.json');

test.describe('Flaky Test Quarantine', () => {
  test.beforeEach(() => {
    quarantine.resetQuarantine();
    // Override the quarantine file path
    quarantine.getQuarantine().file = quarantineFile;
  });

  test.after(() => {
    // Cleanup
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  test.describe('Quarantine Management', () => {
    test('should start with empty quarantine', () => {
      quarantine.loadQuarantine();
      const data = quarantine.getQuarantine().data;

      assert.strictEqual(data.quarantinedTests.length, 0);
    });

    test('should add test to quarantine', () => {
      quarantine.loadQuarantine();

      const added = quarantine.addToQuarantine('Test 1');
      assert.strictEqual(added, true);

      const data = quarantine.getQuarantine().data;
      assert.strictEqual(data.quarantinedTests.length, 1);
      assert.strictEqual(data.quarantinedTests[0], 'Test 1');
    });

    test('should not add duplicate test', () => {
      quarantine.loadQuarantine();

      quarantine.addToQuarantine('Test 1');
      const added = quarantine.addToQuarantine('Test 1');
      assert.strictEqual(added, false);

      const data = quarantine.getQuarantine().data;
      assert.strictEqual(data.quarantinedTests.length, 1);
    });

    test('should remove test from quarantine', () => {
      quarantine.loadQuarantine();

      quarantine.addToQuarantine('Test 1');
      const removed = quarantine.removeFromQuarantine('Test 1');
      assert.strictEqual(removed, true);

      const data = quarantine.getQuarantine().data;
      assert.strictEqual(data.quarantinedTests.length, 0);
    });

    test('should return false when removing non-existent test', () => {
      quarantine.loadQuarantine();

      const removed = quarantine.removeFromQuarantine('Non-existent');
      assert.strictEqual(removed, false);
    });

    test('should clear all quarantined tests', () => {
      quarantine.loadQuarantine();

      quarantine.addToQuarantine('Test 1');
      quarantine.addToQuarantine('Test 2');
      quarantine.addToQuarantine('Test 3');

      quarantine.clearQuarantine();

      const data = quarantine.getQuarantine().data;
      assert.strictEqual(data.quarantinedTests.length, 0);
    });
  });

  test.describe('Quarantine File I/O', () => {
    test('should save and load quarantine file', () => {
      quarantine.loadQuarantine();

      quarantine.addToQuarantine('Test 1');
      quarantine.addToQuarantine('Test 2');
      quarantine.saveQuarantine();

      // Reset and reload
      quarantine.resetQuarantine();
      quarantine.getQuarantine().file = quarantineFile;
      quarantine.loadQuarantine();

      const data = quarantine.getQuarantine().data;
      assert.strictEqual(data.quarantinedTests.length, 2);
      assert.ok(data.quarantinedTests.includes('Test 1'));
      assert.ok(data.quarantinedTests.includes('Test 2'));
    });
  });

  test.describe('Test File Operations', () => {
    test('should find test file', () => {
      // Create a temporary test file
      const testFile = path.join(testDir, 'test-file.test.js');
      fs.writeFileSync(
        testFile,
        `
        test('Test 1', () => {});
        test('Test 2', () => {});
      `,
      );

      const found = quarantine.getTestFile('Test 1');
      assert.ok(found);
      assert.strictEqual(found, testFile);
    });

    test('should return null for non-existent test', () => {
      const found = quarantine.getTestFile('Non-existent Test');
      assert.strictEqual(found, null);
    });
  });
});

// Run tests if executed directly
if (require.main === module) {
  test.run();
}
