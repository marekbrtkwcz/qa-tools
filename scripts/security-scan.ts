#!/usr/bin/env node
'use strict';

/**
 * P4.2: Security Scanning Script
 *
 * Scans the repository for security issues:
 * - dependency vulnerabilities
 * - sensitive data in files
 * - insecure file permissions
 * - outdated dependencies
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

// Configuration
const SECRETS_PATTERNS = [
  // API keys - match patterns like: apiKey = "xxx", api_key: 'xxx', apikey="xxx"
  /(?:api[_-]?key|apikey)[\s]*[=:]?[\s]*["']?[a-zA-Z0-9\-_]{20,}["']?/i,
  /(?:access[_-]?token|auth[_-]?token)[\s]*[=:]?[\s]*["']?[a-zA-Z0-9\-_.]{20,}["']?/i,

  // Passwords and credentials - match patterns like: password: "xxx", "password": "xxx"
  /(?:password|passwd|pwd|secret)[=:"\s]*[=:"\s]*[^\s"\n]{6,}/i,

  // Private keys
  /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
  /-----END (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,

  // AWS credentials
  /(?:aws[_-]?access[_-]?key[_-]?id)[=:"\s]*[=:"\s]*[A-Z0-9]{16,}/i,
  /(?:aws[_-]?secret[_-]?access[_-]?key)[=:"\s]*[=:"\s]*[A-Za-z0-9/+=]{40,}/i,
  /(?:aws[_-]?session[_-]?token)[=:"\s][A-Za-z0-9/+=]{100,}/i,

  // GitHub tokens
  /(?:ghp_[a-zA-Z0-9]{36,})/i,
  /(?:github[_-]?token)[=:"\s][a-zA-Z0-9]{40,}/i,

  // Generic tokens
  /(?:bearer )[a-zA-Z0-9\-_.]{20,}/i,
];

const SENSITIVE_FILE_PATTERNS = [
  /\.env/i,
  /\.env\.(?:local|development|production|test)/i,
  /config\.(?:json|yml|yaml|js)$/i,
  /secrets?\.(?:json|yml|yaml|js)$/i,
  /credentials?\.(?:json|yml|yaml|js)$/i,
];

const ALLOWED_DIRECTORIES = ['node_modules', '.git', 'plugins', '.vibe', 'test', '__tests__'];

// Result types
interface SecretFinding {
  file: string;
  pattern: string;
  match: string;
  line: number;
}

interface VulnerabilityFinding {
  package: string;
  severity: string;
  version?: string;
  fixAvailable?: unknown;
  description?: string;
}

interface PermissionFinding {
  file: string;
  issue: string;
  severity: string;
  mode: string;
}

interface ScanWarning {
  file: string;
  issue: string;
  severity: string;
  mode?: string;
  version?: string;
}

interface ScanError {
  type: string;
  message: string;
  output?: string;
  error?: string;
}

interface AuditVulnerability {
  severity: string;
  range: string;
  fixAvailable: unknown;
  via: Array<{ description?: string }>;
}

// Results storage
const results: {
  secrets: SecretFinding[];
  vulnerabilities: VulnerabilityFinding[];
  permissions: PermissionFinding[];
  warnings: ScanWarning[];
  errors: ScanError[];
} = {
  secrets: [],
  vulnerabilities: [],
  permissions: [],
  warnings: [],
  errors: [],
};

/**
 * Check for secrets in file content
 */
function scanForSecrets(filePath: string): void {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    SECRETS_PATTERNS.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach((match: string) => {
          // Mask the secret value
          const maskedMatch = pattern.toString().includes('PRIVATE KEY')
            ? '-----BEGIN PRIVATE KEY-----'
            : match.replace(/[a-zA-Z0-9\-_=+/.@]{8,}/g, '***REDACTED***');

          results.secrets.push({
            file: filePath,
            pattern: pattern.toString().substring(0, 50) + '...',
            match: maskedMatch,
            line: findLineNumber(content, match),
          });
        });
      }
    });
  } catch (error) {
    // Ignore binary files
  }
}

/**
 * Find line number of a match in content
 */
function findLineNumber(content: string, match: string): number {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]?.includes(match)) {
      return i + 1;
    }
  }
  return -1;
}

/**
 * Check file permissions
 */
function checkPermissions(filePath: string): void {
  try {
    const stats = fs.statSync(filePath);
    const mode = stats.mode;

    // Check for world-writable files
    const isWorldWritable = (mode & 0o002) !== 0;

    // Check for group-writable files
    const isGroupWritable = (mode & 0o020) !== 0;

    // Check for world-readable sensitive files
    const isWorldReadable = (mode & 0o004) !== 0;

    if (isWorldWritable) {
      results.permissions.push({
        file: filePath,
        issue: 'World-writable file',
        severity: 'high',
        mode: mode.toString(8),
      });
    }

    if (isGroupWritable && isSensitiveFile(filePath)) {
      results.permissions.push({
        file: filePath,
        issue: 'Group-writable sensitive file',
        severity: 'medium',
        mode: mode.toString(8),
      });
    }

    if (isWorldReadable && isSensitiveFile(filePath) && !filePath.includes('.git/')) {
      results.warnings.push({
        file: filePath,
        issue: 'World-readable sensitive file',
        severity: 'low',
        mode: mode.toString(8),
      });
    }
  } catch (error) {
    // Ignore permission errors
  }
}

/**
 * Check if file is sensitive based on name
 */
function isSensitiveFile(filePath: string): boolean {
  const fileName = path.basename(filePath).toLowerCase();
  return SENSITIVE_FILE_PATTERNS.some((pattern) => pattern.test(fileName));
}

/**
 * Check for npm vulnerabilities
 */
function checkDependencies(): void {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const lockFile = fs.readFileSync('package-lock.json', 'utf8');

    // Run npm audit
    try {
      const auditOutput = execSync('npm audit --json --audit-level=moderate 2>/dev/null', {
        cwd: process.cwd(),
        encoding: 'utf8',
      });

      const auditData = JSON.parse(auditOutput) as { vulnerabilities?: Record<string, AuditVulnerability[]> };

      if (auditData.vulnerabilities) {
        Object.entries(auditData.vulnerabilities).forEach(([pkg, vulns]) => {
          vulns.forEach((vuln) => {
            results.vulnerabilities.push({
              package: pkg,
              severity: vuln.severity,
              version: vuln.range,
              fixAvailable: vuln.fixAvailable || false,
              description: vuln.via[0]?.description || '',
            });
          });
        });
      }
    } catch (error) {
      // npm audit might fail if there are vulnerabilities
      const err = error as { stdout?: string; message: string };
      const output = err.stdout || err.message;
      if (output.includes('found') || output.includes('vulnerabilities')) {
        results.errors.push({
          type: 'npm_audit_error',
          message: 'npm audit detected vulnerabilities (parse failed)',
          output: output.substring(0, 500),
        });
      }
    }
  } catch (error) {
    results.errors.push({
      type: 'audit_read_error',
      message: 'Could not read package files',
      error: (error as Error).message,
    });
  }
}

/**
 * Check for outdated dependencies
 */
function checkOutdated(): void {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8')) as {
      devDependencies?: Record<string, string>;
    };
    const devDeps: Record<string, string> = packageJson.devDependencies || {};

    // Check for outdated packages (simple version check)
    Object.entries(devDeps).forEach(([pkg, version]) => {
      if (version.startsWith('^') || version.startsWith('~')) {
        results.warnings.push({
          file: 'package.json',
          issue: `Package ${pkg} uses caret (^) or tilde (~) version`,
          version: version,
          severity: 'info',
        });
      }
    });
  } catch (error) {
    // Ignore
  }
}

/**
 * Scan all files recursively
 */
function scanFiles(directory: string, basePath: string = directory): void {
  const entries = fs.readdirSync(directory);

  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const relativePath = path.relative(basePath, fullPath);

    // Skip allowed directories
    if (
      ALLOWED_DIRECTORIES.some((dir) => relativePath.startsWith(dir + path.sep)) ||
      ALLOWED_DIRECTORIES.includes(entry)
    ) {
      continue;
    }

    try {
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        scanFiles(fullPath, basePath);
      } else if (stats.isFile()) {
        // Scan for secrets
        scanForSecrets(fullPath);

        // Check permissions
        checkPermissions(fullPath);
      }
    } catch (error) {
      // Ignore errors (permission denied, etc.)
    }
  }
}

/**
 * Format results for display
 */
function formatResults() {
  const lines: string[] = [];

  // Header
  lines.push('='.repeat(80));
  lines.push('🔒 SECURITY SCAN RESULTS');
  lines.push('='.repeat(80));
  lines.push('');

  // Summary
  const totalIssues =
    results.secrets.length + results.vulnerabilities.length + results.permissions.length + results.errors.length;
  const totalWarnings = results.warnings.length;

  lines.push(`📊 Summary:`);
  lines.push(`   Total Issues: ${totalIssues}`);
  lines.push(`   Total Warnings: ${totalWarnings}`);
  lines.push('');

  // Secrets
  if (results.secrets.length > 0) {
    lines.push('⚠️  SECRETS FOUND:');
    lines.push('-'.repeat(80));
    results.secrets.forEach((secret) => {
      lines.push(`   📁 ${secret.file}:${secret.line}`);
      lines.push(`      Pattern: ${secret.pattern}`);
      lines.push(`      Match: ${secret.match}`);
      lines.push('');
    });
  } else {
    lines.push('✅ No secrets detected');
    lines.push('');
  }

  // Vulnerabilities
  if (results.vulnerabilities.length > 0) {
    lines.push('⚠️  VULNERABILITIES:');
    lines.push('-'.repeat(80));
    results.vulnerabilities.forEach((vuln) => {
      lines.push(`   📦 ${vuln.package}@${vuln.version}`);
      lines.push(`      Severity: ${vuln.severity.toUpperCase()}`);
      lines.push(`      Fix Available: ${vuln.fixAvailable ? '✅ Yes' : '❌ No'}`);
      if (vuln.description) {
        lines.push(`      Description: ${vuln.description.substring(0, 200)}...`);
      }
      lines.push('');
    });
  } else {
    lines.push('✅ No vulnerabilities detected');
    lines.push('');
  }

  // Permissions
  if (results.permissions.length > 0) {
    lines.push('⚠️  PERMISSION ISSUES:');
    lines.push('-'.repeat(80));
    results.permissions.forEach((perm) => {
      lines.push(`   📁 ${perm.file}`);
      lines.push(`      Issue: ${perm.issue}`);
      lines.push(`      Severity: ${perm.severity.toUpperCase()}`);
      lines.push(`      Mode: ${perm.mode}`);
      lines.push('');
    });
  } else {
    lines.push('✅ No permission issues detected');
    lines.push('');
  }

  // Errors
  if (results.errors.length > 0) {
    lines.push('❌ ERRORS:');
    lines.push('-'.repeat(80));
    results.errors.forEach((error) => {
      lines.push(`   Type: ${error.type}`);
      lines.push(`   Message: ${error.message}`);
      lines.push('');
    });
  } else {
    lines.push('✅ No errors detected');
    lines.push('');
  }

  // Warnings
  if (results.warnings.length > 0) {
    lines.push('ℹ️  WARNINGS:');
    lines.push('-'.repeat(80));
    results.warnings.forEach((warning) => {
      lines.push(`   📁 ${warning.file || 'N/A'}`);
      lines.push(`      Issue: ${warning.issue}`);
      lines.push(`      Severity: ${warning.severity || 'info'}`);
      lines.push('');
    });
  }

  lines.push('='.repeat(80));

  // Exit code
  const exitCode = totalIssues > 0 ? 1 : 0;

  return {
    output: lines.join('\n'),
    exitCode: exitCode,
    summary: {
      secrets: results.secrets.length,
      vulnerabilities: results.vulnerabilities.length,
      permissions: results.permissions.length,
      errors: results.errors.length,
      warnings: results.warnings.length,
      totalIssues: totalIssues,
      passed: totalIssues === 0,
    },
  };
}

/**
 * Main function
 */
function main() {
  const startTime = Date.now();

  console.log('🔒 Starting security scan...\n');

  // Check dependencies
  console.log('📦 Checking dependencies...');
  checkDependencies();

  // Check outdated
  console.log('📅 Checking for outdated dependencies...');
  checkOutdated();

  // Scan files
  console.log('🔍 Scanning files for secrets...');
  scanFiles(process.cwd());

  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ Security scan completed in ${elapsedTime}s\n`);

  // Format and display results
  const formatted = formatResults();
  console.log(formatted.output);

  // Exit with appropriate code
  process.exit(formatted.exitCode);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    scanForSecrets,
    checkPermissions,
    checkDependencies,
    checkOutdated,
    scanFiles,
    formatResults,
    getResults: () => ({ ...results }),
    resetResults: () => {
      results.secrets = [];
      results.vulnerabilities = [];
      results.permissions = [];
      results.warnings = [];
      results.errors = [];
    },
  };
}

// Run if executed directly
if (require.main === module) {
  main();
}
