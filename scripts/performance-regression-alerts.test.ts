#!/usr/bin/env node
'use strict';

/**
 * Unit tests for performance-regression-alerts.js
 */

const test = require('node:test');
const assert = require('node:assert');

// Import the module
const alerts = require('./performance-regression-alerts.ts');

test.describe('Performance Regression Alerts', () => {
  test.beforeEach(() => {
    alerts.resetState();
  });

  test.describe('formatDuration', () => {
    test('should format milliseconds', () => {
      assert.strictEqual(alerts.formatDuration(100), '100.00ms');
      assert.strictEqual(alerts.formatDuration(500), '500.00ms');
    });

    test('should format seconds', () => {
      assert.strictEqual(alerts.formatDuration(1000), '1.00s');
      assert.strictEqual(alerts.formatDuration(2500), '2.50s');
    });

    test('should format minutes', () => {
      assert.strictEqual(alerts.formatDuration(60000), '1.00m');
    });
  });

  test.describe('calculateMean', () => {
    test('should calculate mean of numbers', () => {
      const values: number[] = [1, 2, 3, 4, 5];
      const mean = alerts.calculateMean(values);
      assert.strictEqual(mean, 3);
    });

    test('should handle empty array', () => {
      const values: number[] = [];
      const mean = alerts.calculateMean(values);
      assert.ok(Number.isNaN(mean));
    });
  });

  test.describe('calculateStdDev', () => {
    test('should calculate standard deviation', () => {
      const values: number[] = [2, 4, 4, 4, 5, 5, 7, 9];
      const stdDev = alerts.calculateStdDev(values);
      // Expected std dev is approximately 2
      assert.ok(Math.abs(stdDev - 2) < 0.01);
    });

    test('should return 0 for constant values', () => {
      const values: number[] = [5, 5, 5, 5, 5];
      const stdDev = alerts.calculateStdDev(values);
      assert.strictEqual(stdDev, 0);
    });
  });

  test.describe('getBenchmarkableScripts', () => {
    test('should return array of scripts', () => {
      const scripts = alerts.getBenchmarkableScripts();

      assert.ok(Array.isArray(scripts));
      assert.ok(scripts.length > 0);

      scripts.forEach((script: { name: string; command: string }) => {
        assert.ok(script.name, 'Script should have name');
        assert.ok(script.command, 'Script should have command');
      });
    });
  });

  test.describe('State Management', () => {
    test('should reset state', () => {
      alerts.resetState();
      const state = alerts.getState();

      assert.ok(state.baseline.data.benchmarks.length === 0);
      assert.ok(state.history.data.entries.length === 0);
    });
  });
});

// Run tests if executed directly
if (require.main === module) {
  test.run();
}
