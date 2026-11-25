#!/usr/bin/env node
'use strict';

/**
 * Unit tests for security-gate-enforce.js
 */

const test = require('node:test');
const assert = require('node:assert');

// Import the module
const securityGate = require('./security-gate-enforce.ts');

test.describe('Security Gate Enforcement', () => {
  test.beforeEach(() => {
    securityGate.resetResults();
  });

  test.describe('securityGatesPassed', () => {
    test('should return true when no issues', () => {
      const passed = securityGate.securityGatesPassed();
      assert.strictEqual(passed, true);
    });

    test('should return false with vulnerabilities', () => {
      const results = securityGate.getResults();
      results.vulnerabilities.push({
        package: 'test-package',
        severity: 'high',
        version: '1.0.0',
        fixAvailable: false,
      });

      const passed = securityGate.securityGatesPassed();
      assert.strictEqual(passed, false);
    });

    test('should return false with secrets', () => {
      const results = securityGate.getResults();
      results.secrets.push({
        file: 'test.js',
        pattern: 'api.*key',
        match: '***REDACTED***',
        line: 1,
      });

      const passed = securityGate.securityGatesPassed();
      assert.strictEqual(passed, false);
    });

    test('should return false with permission issues', () => {
      const results = securityGate.getResults();
      results.permissions.push({
        file: 'test.js',
        issue: 'World-writable',
        severity: 'high',
      });

      const passed = securityGate.securityGatesPassed();
      assert.strictEqual(passed, false);
    });

    test('should return false with errors', () => {
      const results = securityGate.getResults();
      results.errors.push({
        type: 'npm_audit',
        message: 'Error running audit',
      });

      const passed = securityGate.securityGatesPassed();
      assert.strictEqual(passed, false);
    });
  });

  test.describe('getBlockingIssues', () => {
    test('should return empty array when no issues', () => {
      const blocking = securityGate.getBlockingIssues();
      assert.strictEqual(blocking.length, 0);
    });

    test('should return vulnerabilities above threshold', () => {
      const results = securityGate.getResults();
      results.vulnerabilities.push({
        package: 'high-vuln',
        severity: 'high',
        version: '1.0.0',
      });
      results.vulnerabilities.push({
        package: 'low-vuln',
        severity: 'low',
        version: '1.0.0',
      });

      // With default threshold (high), only high should be blocking
      const blocking = securityGate.getBlockingIssues();
      assert.strictEqual(blocking.length, 1);
      assert.strictEqual(blocking[0].package, 'high-vuln');
    });

    test('should return all issues when threshold is low', () => {
      // Override the options for this test
      const originalSeverity = securityGate.options.severity;
      securityGate.options.severity = 'low';

      const results = securityGate.getResults();
      results.vulnerabilities.push({
        package: 'high-vuln',
        severity: 'high',
        version: '1.0.0',
      });
      results.vulnerabilities.push({
        package: 'low-vuln',
        severity: 'low',
        version: '1.0.0',
      });

      const blocking = securityGate.getBlockingIssues();
      assert.strictEqual(blocking.length, 2);

      // Restore original
      securityGate.options.severity = originalSeverity;
    });
  });

  test.describe('formatResults', () => {
    test('should format empty results', () => {
      const formatted = securityGate.formatResults();

      assert.ok(formatted.includes('SECURITY GATE ENFORCEMENT RESULTS'));
      assert.ok(formatted.includes('ALL SECURITY GATES PASSED'));
      assert.ok(formatted.includes('Merge can proceed'));
    });

    test('should format results with vulnerabilities', () => {
      const results = securityGate.getResults();
      results.vulnerabilities.push({
        package: 'test-package',
        severity: 'high',
        version: '1.0.0',
        fixAvailable: true,
      });

      const formatted = securityGate.formatResults();

      assert.ok(formatted.includes('SECURITY GATE ENFORCEMENT RESULTS'));
      assert.ok(formatted.includes('Vulnerabilities:'));
      assert.ok(formatted.includes('test-package'));
      assert.ok(formatted.includes('SECURITY GATES FAILED'));
      assert.ok(formatted.includes('Merge is BLOCKED'));
    });
  });
});

// Run tests if executed directly
if (require.main === module) {
  test.run();
}
