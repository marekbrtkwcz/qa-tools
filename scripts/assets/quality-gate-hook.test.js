#!/usr/bin/env node
'use strict';

/**
 * Unit tests for quality-gate-hook.js
 */

const test = require('node:test');
const assert = require('node:assert');

// Import the module
const qualityGate = require('./quality-gate-hook.js');

test.describe('Quality Gate Hook', () => {
  test.beforeEach(() => {
    qualityGate.resetState();
  });

  test.describe('shouldRunQualityGate', () => {
    test('should run for file_system.write_file', () => {
      const result = qualityGate.shouldRunQualityGate('file_system.write_file', {
        file_path: 'scripts/test.js',
      });
      assert.strictEqual(result, true);
    });

    test('should run for edit', () => {
      const result = qualityGate.shouldRunQualityGate('edit', {
        file_path: 'scripts/test.js',
      });
      assert.strictEqual(result, true);
    });

    test('should not run for blocked files (package-lock.json)', () => {
      const result = qualityGate.shouldRunQualityGate('file_system.write_file', {
        file_path: 'package-lock.json',
      });
      assert.strictEqual(result, false);
    });

    test('should not run for blocked files (node_modules)', () => {
      const result = qualityGate.shouldRunQualityGate('file_system.write_file', {
        file_path: 'node_modules/some-package/index.js',
      });
      assert.strictEqual(result, false);
    });

    test('should not run for git commands', () => {
      const result = qualityGate.shouldRunQualityGate('bash', {
        command: 'git commit -m "test"',
      });
      assert.strictEqual(result, false);
    });

    test('should not run for npm run commands', () => {
      const result = qualityGate.shouldRunQualityGate('bash', {
        command: 'npm run test',
      });
      assert.strictEqual(result, false);
    });

    test('should run for bash commands not in allowed list', () => {
      const result = qualityGate.shouldRunQualityGate('bash', {
        command: 'echo "test"',
      });
      assert.strictEqual(result, true);
    });
  });

  test.describe('formatResults', () => {
    test('should format successful results', () => {
      const results = {
        p2: { passed: true, error: null },
        p3: { passed: true, error: null },
        lint: { passed: true, error: null },
        build: { passed: true, error: null },
        verify: { passed: true, error: null },
      };

      const formatted = qualityGate.formatResults(results);

      assert.ok(formatted.includes('Quality Gate Check Results'));
      assert.ok(formatted.includes('✅ p2'));
      assert.ok(formatted.includes('✅ All quality gates passed!'));
    });

    test('should format failed results', () => {
      const results = {
        p2: { passed: false, error: 'Links validation failed' },
        p3: { passed: true, error: null },
        lint: { passed: true, error: null },
        build: { passed: true, error: null },
        verify: { passed: true, error: null },
      };

      const formatted = qualityGate.formatResults(results);

      assert.ok(formatted.includes('Quality Gate Check Results'));
      assert.ok(formatted.includes('❌ p2'));
      assert.ok(formatted.includes('❌ Some quality gates failed!'));
    });

    test('should format error results', () => {
      const results = { error: 'Unable to run checks' };

      const formatted = qualityGate.formatResults(results);

      assert.ok(formatted.includes('❌ Quality Gate Error'));
      assert.ok(formatted.includes('Unable to run checks'));
    });
  });

  test.describe('allGatesPassed', () => {
    test('should return true when all pass', () => {
      const results = {
        p2: { passed: true },
        p3: { passed: true },
        lint: { passed: true },
      };

      const passed = qualityGate.allGatesPassed(results);
      assert.strictEqual(passed, true);
    });

    test('should return false when one fails', () => {
      const results = {
        p2: { passed: true },
        p3: { passed: false },
        lint: { passed: true },
      };

      const passed = qualityGate.allGatesPassed(results);
      assert.strictEqual(passed, false);
    });

    test('should return false on error', () => {
      const results = { error: 'Some error' };

      const passed = qualityGate.allGatesPassed(results);
      assert.strictEqual(passed, false);
    });
  });

  test.describe('State Management', () => {
    test('should reset state', () => {
      const state = qualityGate.getState();
      assert.ok(state.lastCheck === null);
      assert.ok(state.lastCheckPassed === null);
      assert.ok(state.cache.size === 0);
    });
  });
});

// Run tests if executed directly
if (require.main === module) {
  test.run();
}
