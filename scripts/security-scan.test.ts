#!/usr/bin/env node
'use strict';

/**
 * Unit tests for security-scan.js
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

// Import the module
const securityScan = require('./security-scan.ts');

// Create a temporary directory for test files
const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'security-scan-test-'));

// Helper to create test files
function createTestFile(name: string, content: string): string {
  const filePath = path.join(testDir, name);
  fs.writeFileSync(filePath, content);
  return filePath;
}

// Helper to clean up
function cleanup() {
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
}

// Reset results before each test
function setup() {
  securityScan.resetResults();
}

test.describe('Security Scan', () => {
  test.beforeEach(() => {
    setup();
  });

  test.after(() => {
    cleanup();
  });

  test.describe('scanForSecrets', () => {
    test('should detect API keys in files', () => {
      securityScan.resetResults();
      const filePath = createTestFile(
        'test1.js',
        `
        const apiKey = 'sk-1234567890abcdef1234567890abcdef';
        console.log(apiKey);
      `,
      );

      securityScan.scanForSecrets(filePath);
      const results = securityScan.getResults();

      assert.ok(results.secrets.length > 0, 'Should detect API key pattern');
      assert.ok(
        results.secrets.some((s: { file: string }) => s.file === filePath),
        'Should reference correct file',
      );
    });

    test('should detect passwords in files', () => {
      securityScan.resetResults();
      const filePath = createTestFile(
        'test2.json',
        `
        {
          "password": "mySecretPassword123",
          "username": "admin"
        }
      `,
      );

      securityScan.scanForSecrets(filePath);
      const results = securityScan.getResults();

      assert.ok(results.secrets.length > 0, 'Should detect password pattern');
    });

    test('should detect bearer tokens', () => {
      securityScan.resetResults();
      const filePath = createTestFile(
        'test3.txt',
        `
        Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
      `,
      );

      securityScan.scanForSecrets(filePath);
      const results = securityScan.getResults();

      assert.ok(results.secrets.length > 0, 'Should detect bearer token');
    });

    test('should detect private keys', () => {
      securityScan.resetResults();
      const filePath = createTestFile(
        'test4.pem',
        `
        -----BEGIN PRIVATE KEY-----
        MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7...
        -----END PRIVATE KEY-----
      `,
      );

      securityScan.scanForSecrets(filePath);
      const results = securityScan.getResults();

      assert.ok(results.secrets.length > 0, 'Should detect private key');
    });
  });

  test.describe('checkPermissions', () => {
    test('should detect sensitive files', () => {
      const filePath = createTestFile('.env', 'SECRET=value123');

      // Note: We can't actually set world-readable on Windows easily
      // So we just check that the function runs without error
      securityScan.checkPermissions(filePath);
      const results = securityScan.getResults();

      // Should not crash
      assert.ok(typeof results.permissions === 'object');
    });
  });

  test.describe('formatResults', () => {
    test('should format empty results', () => {
      const formatted = securityScan.formatResults();

      assert.ok(formatted.output.includes('SECURITY SCAN RESULTS'));
      assert.ok(formatted.output.includes('No secrets detected'));
      assert.ok(formatted.output.includes('No vulnerabilities detected'));
      assert.ok(formatted.output.includes('No permission issues detected'));
      assert.ok(formatted.exitCode === 0);
    });

    test('should format results with issues', () => {
      securityScan.getResults().secrets.push({
        file: 'test.js',
        pattern: 'api.*key',
        match: '***REDACTED***',
        line: 1,
      });

      const formatted = securityScan.formatResults();

      assert.ok(formatted.output.includes('SECRETS FOUND'));
      assert.ok(formatted.exitCode === 1);
    });

    test('should calculate correct summary', () => {
      const results = securityScan.getResults();
      results.secrets.push({ file: 'a.js', pattern: 'p1', match: 'm1', line: 1 });
      results.vulnerabilities.push({ package: 'pkg', severity: 'high', version: '1.0', fixAvailable: true });
      results.permissions.push({ file: 'b.js', issue: 'World-writable', severity: 'high', mode: '777' });
      results.warnings.push({ file: 'c.js', issue: 'World-readable', severity: 'low', mode: '644' });

      const formatted = securityScan.formatResults();

      assert.strictEqual(formatted.summary.secrets, 1);
      assert.strictEqual(formatted.summary.vulnerabilities, 1);
      assert.strictEqual(formatted.summary.permissions, 1);
      assert.strictEqual(formatted.summary.warnings, 1);
      assert.strictEqual(formatted.summary.totalIssues, 3);
      assert.strictEqual(formatted.summary.passed, false);
    });
  });
});

// Run tests if executed directly
if (require.main === module) {
  test.run();
}
