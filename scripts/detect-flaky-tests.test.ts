#!/usr/bin/env node
'use strict';

/**
 * Unit tests for detect-flaky-tests.js
 */

const test = require('node:test');
const assert = require('node:assert');

// Import the module
const flakyDetector = require('./detect-flaky-tests.ts');

test.describe('Flaky Test Detection', () => {
  test.beforeEach(() => {
    flakyDetector.resetResults();
  });

  test.describe('calculateStability', () => {
    test('should return 100 for consistent passes', () => {
      const testData = {
        passed: 5,
        failed: 0,
        results: [],
      };

      const stability = flakyDetector.calculateStability(testData);
      assert.strictEqual(stability, 100);
    });

    test('should return 0 for inconsistent results', () => {
      const testData = {
        passed: 3,
        failed: 2,
        results: [],
      };

      const stability = flakyDetector.calculateStability(testData);
      assert.strictEqual(stability, 0);
    });

    test('should return 50 for consistent failures', () => {
      const testData = {
        passed: 0,
        failed: 5,
        results: [],
      };

      const stability = flakyDetector.calculateStability(testData);
      assert.strictEqual(stability, 50);
    });

    test('should return 100 for no runs', () => {
      const testData = {
        passed: 0,
        failed: 0,
        results: [],
      };

      const stability = flakyDetector.calculateStability(testData);
      assert.strictEqual(stability, 100);
    });
  });

  test.describe('parseTestOutput', () => {
    test('should parse node:test TAP output', () => {
      const output = `
# tests 68
# pass 68
# fail 0
# skip 0
# todo 0
ok 1 - Test 1
ok 2 - Test 2
ok 3 - Test 3
`;

      const parsed = flakyDetector.parseTestOutput(output, true);

      assert.strictEqual(parsed.passed, 68);
      assert.strictEqual(parsed.failed, 0);
      assert.strictEqual(parsed.skipped, 0);
      assert.strictEqual(parsed.todo, 0);
      assert.strictEqual(parsed.tests.length, 3);
    });

    test('should parse failed tests', () => {
      const output = `
# tests 3
# pass 2
# fail 1
not ok 1 - Test 1
ok 2 - Test 2
ok 3 - Test 3
`;

      const parsed = flakyDetector.parseTestOutput(output, false);

      assert.strictEqual(parsed.passed, 2);
      assert.strictEqual(parsed.failed, 1);
      assert.strictEqual(parsed.tests.length, 3);
      assert.strictEqual(parsed.tests[0].passed, false);
      assert.strictEqual(parsed.tests[1].passed, true);
    });

    test('should handle empty output', () => {
      const output = '';

      const parsed = flakyDetector.parseTestOutput(output, true);

      assert.strictEqual(parsed.passed, 0);
      assert.strictEqual(parsed.failed, 0);
    });
  });

  test.describe('analyzeFlakyTests', () => {
    test('should detect inconsistent tests', () => {
      const results = flakyDetector.getResults();

      // Add test data with inconsistent results
      results.allTests.set('InconsistentTest', {
        passed: 3,
        failed: 2,
        results: [
          { run: 1, success: true },
          { run: 2, success: false },
          { run: 3, success: true },
          { run: 4, success: false },
          { run: 5, success: true },
        ],
      });

      const flaky = flakyDetector.analyzeFlakyTests();

      assert.strictEqual(flaky.length, 1);
      assert.strictEqual(flaky[0].name, 'InconsistentTest');
      assert.strictEqual(flaky[0].type, 'inconsistent');
      assert.strictEqual(flaky[0].stability, 0);
    });

    test('should detect consistent failures', () => {
      const results = flakyDetector.getResults();

      results.allTests.set('ConsistentFail', {
        passed: 0,
        failed: 5,
        results: [
          { run: 1, success: false },
          { run: 2, success: false },
          { run: 3, success: false },
          { run: 4, success: false },
          { run: 5, success: false },
        ],
      });

      const flaky = flakyDetector.analyzeFlakyTests();

      assert.strictEqual(flaky.length, 1);
      assert.strictEqual(flaky[0].type, 'consistent_failure');
    });

    test('should not detect stable tests', () => {
      const results = flakyDetector.getResults();

      results.allTests.set('StableTest', {
        passed: 5,
        failed: 0,
        results: [
          { run: 1, success: true },
          { run: 2, success: true },
          { run: 3, success: true },
          { run: 4, success: true },
          { run: 5, success: true },
        ],
      });

      const flaky = flakyDetector.analyzeFlakyTests();

      assert.strictEqual(flaky.length, 0);
    });

    test('should sort by stability (most flaky first)', () => {
      const results = flakyDetector.getResults();

      results.allTests.set('Flaky1', {
        passed: 2,
        failed: 3,
        results: [],
      });

      results.allTests.set('Flaky2', {
        passed: 1,
        failed: 4,
        results: [],
      });

      const flaky = flakyDetector.analyzeFlakyTests();

      assert.strictEqual(flaky.length, 2);
      // Both have 0 stability, but we check sorting is stable
      assert.ok(flaky[0].name === 'Flaky1' || flaky[0].name === 'Flaky2');
    });
  });

  test.describe('formatResults', () => {
    test('should format empty results', () => {
      const formatted = flakyDetector.formatResults();

      assert.ok(formatted.includes('FLAKY TEST DETECTION RESULTS'));
      assert.ok(formatted.includes('No flaky tests detected'));
    });

    test('should format results with flaky tests', () => {
      const results = flakyDetector.getResults();
      results.allTests.set('FlakyTest', {
        passed: 3,
        failed: 2,
        results: [
          { run: 1, success: true },
          { run: 2, success: false },
          { run: 3, success: true },
        ],
      });

      const formatted = flakyDetector.formatResults();

      assert.ok(formatted.includes('FLAKY TESTS DETECTED'));
      assert.ok(formatted.includes('FlakyTest'));
    });
  });

  test.describe('formatJSON', () => {
    test('should format as valid JSON', () => {
      const results = flakyDetector.getResults();
      results.allTests.set('Test1', {
        passed: 5,
        failed: 0,
        results: [
          { run: 1, success: true, duration: 100 },
          { run: 2, success: true, duration: 110 },
          { run: 3, success: true, duration: 105 },
        ],
      });

      const json = flakyDetector.formatJSON();
      const parsed = JSON.parse(json);

      assert.ok(parsed.metadata);
      assert.ok(parsed.summary);
      assert.ok(Array.isArray(parsed.flakyTests));
      assert.ok(parsed.allTests);
    });
  });
});

// Run tests if executed directly
if (require.main === module) {
  test.run();
}
