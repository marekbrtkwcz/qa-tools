#!/usr/bin/env node
'use strict';

/**
 * Unit tests for benchmark-performance.js
 */

const test = require('node:test');
const assert = require('node:assert');

// Import the module
const benchmark = require('./benchmark-performance.ts');

test.describe('Performance Benchmarking', () => {
  test.beforeEach(() => {
    benchmark.resetResults();
  });

  test.describe('formatDuration', () => {
    test('should format milliseconds', () => {
      assert.strictEqual(benchmark.formatDuration(100), '100.00ms');
      assert.strictEqual(benchmark.formatDuration(500), '500.00ms');
      assert.strictEqual(benchmark.formatDuration(999), '999.00ms');
    });

    test('should format seconds', () => {
      assert.strictEqual(benchmark.formatDuration(1000), '1.00s');
      assert.strictEqual(benchmark.formatDuration(2500), '2.50s');
      // 59999ms = 59.999s, which rounds to 60.00s with toFixed(2)
      assert.strictEqual(benchmark.formatDuration(59999), '60.00s');
      assert.strictEqual(benchmark.formatDuration(59000), '59.00s');
    });

    test('should format minutes', () => {
      assert.strictEqual(benchmark.formatDuration(60000), '1.00m');
      assert.strictEqual(benchmark.formatDuration(120000), '2.00m');
    });
  });

  test.describe('calculateMedian', () => {
    test('should calculate median of odd-length array', () => {
      const values: number[] = [1, 2, 3, 4, 5];
      const median = benchmark.calculateMedian(values);
      assert.strictEqual(median, 3);
    });

    test('should calculate median of even-length array', () => {
      const values: number[] = [1, 2, 3, 4];
      const median = benchmark.calculateMedian(values);
      assert.strictEqual(median, 2.5);
    });

    test('should handle single value', () => {
      const values: number[] = [42];
      const median = benchmark.calculateMedian(values);
      assert.strictEqual(median, 42);
    });

    test('should handle empty array', () => {
      const values: number[] = [];
      const median = benchmark.calculateMedian(values);
      assert.ok(isNaN(median));
    });
  });

  test.describe('calculateStdDev', () => {
    test('should calculate standard deviation', () => {
      const values: number[] = [2, 4, 4, 4, 5, 5, 7, 9];
      const stdDev = benchmark.calculateStdDev(values);
      // Expected std dev is approximately 2
      assert.ok(Math.abs(stdDev - 2) < 0.01);
    });

    test('should return 0 for constant values', () => {
      const values: number[] = [5, 5, 5, 5, 5];
      const stdDev = benchmark.calculateStdDev(values);
      assert.strictEqual(stdDev, 0);
    });

    test('should handle single value', () => {
      const values: number[] = [10];
      const stdDev = benchmark.calculateStdDev(values);
      assert.strictEqual(stdDev, 0);
    });
  });

  test.describe('getBenchmarkableScripts', () => {
    test('should return array of scripts', () => {
      const scripts = benchmark.getBenchmarkableScripts();

      assert.ok(Array.isArray(scripts));
      assert.ok(scripts.length > 0);

      scripts.forEach((script: { name: string; command: string }) => {
        assert.ok(script.name, 'Script should have name');
        assert.ok(script.command, 'Script should have command');
      });
    });

    test('should include P2 scripts', () => {
      const scripts = benchmark.getBenchmarkableScripts();
      const scriptNames = scripts.map((s: { name: string }) => s.name);

      assert.ok(
        scriptNames.some(
          (name: string) => name.includes('P2') || name.includes('CHANGELOG') || name.includes('README'),
        ),
      );
    });

    test('should include P3 scripts', () => {
      const scripts = benchmark.getBenchmarkableScripts();
      const scriptNames = scripts.map((s: { name: string }) => s.name);

      assert.ok(scriptNames.some((name: string) => name.includes('P3') || name.includes('test')));
    });
  });

  test.describe('formatResults', () => {
    test('should format empty results', () => {
      const formatted = benchmark.formatResults();

      assert.ok(formatted.includes('PERFORMANCE BENCHMARKING RESULTS'));
      assert.ok(formatted.includes('Benchmarks: 0'));
    });

    test('should format results with benchmarks', () => {
      const results = benchmark.getResults();
      results.benchmarks.push({
        name: 'Test Benchmark',
        command: 'echo test',
        runs: [
          { run: 1, durationMs: 100, duration: '100.00ms', success: true },
          { run: 2, durationMs: 110, duration: '110.00ms', success: true },
          { run: 3, durationMs: 95, duration: '95.00ms', success: true },
        ],
        statistics: {
          min: 95,
          max: 110,
          mean: 101.66666666666667,
          median: 100,
          stdDev: 7.0710678118654755,
          successRate: 1,
        },
      });

      const formatted = benchmark.formatResults();

      assert.ok(formatted.includes('Test Benchmark'));
      assert.ok(formatted.includes('100.00ms'));
    });
  });

  test.describe('formatJSON', () => {
    test('should format as valid JSON', () => {
      const results = benchmark.getResults();
      results.benchmarks.push({
        name: 'Test',
        command: 'echo test',
        runs: [],
        statistics: {},
      });

      const json = benchmark.formatJSON();
      const parsed = JSON.parse(json);

      assert.ok(parsed.metadata);
      assert.ok(parsed.summary);
      assert.ok(Array.isArray(parsed.benchmarks));
    });
  });
});

// Run tests if executed directly
if (require.main === module) {
  test.run();
}
