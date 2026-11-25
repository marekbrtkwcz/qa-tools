#!/usr/bin/env node
'use strict';

/**
 * P5.5: Security Gate Enforcement
 *
 * Enforces security gates that block merges when security issues are found.
 * This makes the security scan from P4.2 blocking instead of non-blocking.
 *
 * Usage:
 *   node scripts/security-gate-enforce.ts [command] [options]
 *
 * Commands:
 *   check        - Run security checks (blocking)
 *   scan         - Run security scan with enforcement
 *   validate     - Validate security configuration
 *
 * Options:
 *   --strict, -s     Strict mode: block on warnings too
 *   --severity, -S   Minimum severity to block (low, medium, high)
 *   --json, -j       Output as JSON
 *   --help, -h       Show help
 *
 * Exit Codes:
 *   0 - All security gates passed
 *   1 - Security gates failed (blocking)
 *   2 - Error running security checks
 */

const fs = require('node:fs');
const { execSync } = require('node:child_process');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  strict: false,
  severity: 'high', // Only block on high severity by default
  json: false,
  help: false,
};

let command: string | null = null;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === 'check' || arg === 'scan' || arg === 'validate' || arg === 'help') {
    command = arg;
  } else if (arg === '--strict' || arg === '-s') {
    options.strict = true;
  } else if (arg === '--severity' || arg === '-S') {
    const severity = args[++i];
    if (severity !== undefined && ['low', 'medium', 'high', 'critical'].includes(severity)) {
      options.severity = severity;
    }
  } else if (arg === '--json' || arg === '-j') {
    options.json = true;
  } else if (arg === '--help' || arg === '-h') {
    options.help = true;
  }
}

// Severity levels
const SEVERITY_LEVELS: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

// Show help
if (options.help || !command) {
  console.log(`
🔒 Security Gate Enforcement

Usage: node scripts/security-gate-enforce.ts [command] [options]

Commands:
  check        - Run security checks (blocking)
  scan         - Run security scan with enforcement
  validate     - Validate security configuration

Options:
  --strict, -s     Strict mode: block on warnings too
  --severity, -S   Minimum severity to block (low, medium, high, critical)
  --json, -j       Output as JSON
  --help, -h       Show help

Exit Codes:
  0 - All security gates passed
  1 - Security gates failed (blocking)
  2 - Error running security checks

Examples:
  node scripts/security-gate-enforce.ts check
  node scripts/security-gate-enforce.ts check --strict
  node scripts/security-gate-enforce.ts check --severity medium
  node scripts/security-gate-enforce.ts check --strict --severity low
`);
  process.exit(0);
}

// Result types
interface GateVulnerability {
  package: string;
  severity: string;
  version: string;
  fixAvailable?: unknown;
  description?: string;
}

interface GateSecret {
  file: string;
  pattern?: string;
  match?: string;
  line?: number;
}

interface GatePermission {
  file: string;
  issue: string;
  severity: string;
}

interface GateWarning {
  file: string;
  issue: string;
  severity: string;
}

interface GateError {
  type: string;
  message: string;
}

interface BlockingIssue {
  severity?: string;
  file?: string;
  package?: string;
  issue?: string;
}

interface AuditVulnerability {
  severity: string;
  range: string;
  fixAvailable: unknown;
  via: Array<{ description?: string }>;
}

// Results storage
const results: {
  vulnerabilities: GateVulnerability[];
  secrets: GateSecret[];
  permissions: GatePermission[];
  warnings: GateWarning[];
  errors: GateError[];
} = {
  vulnerabilities: [],
  secrets: [],
  permissions: [],
  warnings: [],
  errors: [],
};

/**
 * Run npm audit
 */
function runNpmAudit(): void {
  try {
    const output = execSync('npm audit --json --audit-level=low', {
      cwd: process.cwd(),
      encoding: 'utf8',
    });

    const auditData = JSON.parse(output) as { vulnerabilities?: Record<string, AuditVulnerability[]> };

    if (auditData.vulnerabilities) {
      Object.entries(auditData.vulnerabilities).forEach(([pkg, vulns]) => {
        vulns.forEach((vuln) => {
          results.vulnerabilities.push({
            package: pkg,
            severity: vuln.severity || 'unknown',
            version: vuln.range,
            fixAvailable: vuln.fixAvailable || false,
            description: vuln.via[0]?.description || '',
          });
        });
      });
    }
  } catch (error) {
    results.errors.push({
      type: 'npm_audit',
      message: (error as Error).message,
    });
  }
}

/**
 * Scan for secrets
 */
function scanForSecrets() {
  try {
    const output = execSync('node scripts/security-scan.ts --json', {
      cwd: process.cwd(),
      encoding: 'utf8',
    });

    const scanData = JSON.parse(output);

    if (scanData.summary) {
      results.secrets = scanData.secrets || [];
      results.permissions = scanData.permissions || [];
      results.warnings = scanData.warnings || [];
    }
  } catch (error) {
    results.errors.push({
      type: 'secret_scan',
      message: (error as Error).message,
    });
  }
}

/**
 * Check file permissions
 */
function checkPermissions() {
  try {
    // Find world-writable files
    const output = execSync('find . -type f -perm -o=w ! -path "./node_modules/*" ! -path "./.git/*" 2>/dev/null', {
      encoding: 'utf8',
    });

    const files = output
      .trim()
      .split('\n')
      .filter((f: string) => f);

    files.forEach((file: string) => {
      results.permissions.push({
        file: file,
        issue: 'World-writable file',
        severity: 'high',
      });
    });
  } catch {
    // Ignore errors (command not available on Windows)
  }
}

/**
 * Check for sensitive files in git
 */
function checkSensitiveFiles() {
  const sensitivePatterns = [
    /\.env/i,
    /\.env\./i,
    /config\.(json|yml|yaml)$/i,
    /secrets?\.(json|yml|yaml|txt)$/i,
    /credentials?\.(json|yml|yaml|txt)$/i,
    /private.*key/i,
    /id_rsa/i,
    /api.*key/i,
  ];

  try {
    const output = execSync('git ls-files', {
      cwd: process.cwd(),
      encoding: 'utf8',
    });

    const files = output
      .trim()
      .split('\n')
      .filter((f: string) => f);

    files.forEach((file: string) => {
      for (const pattern of sensitivePatterns) {
        if (pattern.test(file)) {
          results.warnings.push({
            file: file,
            issue: 'Sensitive file in git',
            severity: 'medium',
          });
          break;
        }
      }
    });
  } catch {
    // Ignore errors (not a git repo or git not available)
  }
}

/**
 * Check if security gates passed
 */
function securityGatesPassed(): boolean {
  const minSeverityLevel = SEVERITY_LEVELS[options.severity] || SEVERITY_LEVELS[options.severity.toLowerCase()] || 0;

  // Check for blocking issues
  const blockingIssues: BlockingIssue[] = [
    ...results.vulnerabilities.filter((v) => (SEVERITY_LEVELS[v.severity] ?? 0) >= minSeverityLevel),
    ...results.secrets,
    ...results.permissions,
  ];

  // In strict mode, warnings are also blocking
  if (options.strict) {
    blockingIssues.push(...results.warnings);
  }

  return blockingIssues.length === 0 && results.errors.length === 0;
}

/**
 * Get blocking issues
 */
function getBlockingIssues(): BlockingIssue[] {
  const minSeverityLevel = SEVERITY_LEVELS[options.severity] || SEVERITY_LEVELS[options.severity.toLowerCase()] || 0;

  const blockingIssues: BlockingIssue[] = [
    ...results.vulnerabilities.filter((v) => (SEVERITY_LEVELS[v.severity] ?? 0) >= minSeverityLevel),
    ...results.secrets,
    ...results.permissions,
  ];

  if (options.strict) {
    blockingIssues.push(...results.warnings);
  }

  return blockingIssues;
}

/**
 * Format results
 */
function formatResults(): string {
  const lines: string[] = [];

  // Header
  lines.push('='.repeat(80));
  lines.push('🔒 SECURITY GATE ENFORCEMENT RESULTS');
  lines.push('='.repeat(80));
  lines.push('');

  // Configuration
  lines.push(`📊 Configuration:`);
  lines.push(`   Severity threshold: ${options.severity}`);
  lines.push(`   Strict mode: ${options.strict ? 'Enabled' : 'Disabled'}`);
  lines.push('');

  // Summary
  const totalIssues =
    results.vulnerabilities.length +
    results.secrets.length +
    results.permissions.length +
    results.warnings.length +
    results.errors.length;

  lines.push(`📋 Summary:`);
  lines.push(`   Vulnerabilities: ${results.vulnerabilities.length}`);
  lines.push(`   Secrets: ${results.secrets.length}`);
  lines.push(`   Permissions: ${results.permissions.length}`);
  lines.push(`   Warnings: ${results.warnings.length}`);
  lines.push(`   Errors: ${results.errors.length}`);
  lines.push(`   Total: ${totalIssues}`);
  lines.push('');

  // Details
  if (results.vulnerabilities.length > 0) {
    lines.push('⚠️  Vulnerabilities:');
    lines.push('-'.repeat(80));
    results.vulnerabilities.forEach((vuln) => {
      lines.push(`   📦 ${vuln.package}@${vuln.version}`);
      lines.push(`      Severity: ${vuln.severity.toUpperCase()}`);
      lines.push(`      Fix Available: ${vuln.fixAvailable ? '✅ Yes' : '❌ No'}`);
      lines.push('');
    });
  }

  if (results.secrets.length > 0) {
    lines.push('⚠️  Secrets Detected:');
    lines.push('-'.repeat(80));
    results.secrets.forEach((secret) => {
      lines.push(`   📁 ${secret.file}`);
      lines.push(`      Pattern: ${secret.pattern || 'Unknown'}`);
      lines.push('');
    });
  }

  if (results.permissions.length > 0) {
    lines.push('⚠️  Permission Issues:');
    lines.push('-'.repeat(80));
    results.permissions.forEach((perm) => {
      lines.push(`   📁 ${perm.file}`);
      lines.push(`      Issue: ${perm.issue}`);
      lines.push('');
    });
  }

  if (results.warnings.length > 0 && options.strict) {
    lines.push('ℹ️  Warnings (blocking in strict mode):');
    lines.push('-'.repeat(80));
    results.warnings.forEach((warning) => {
      lines.push(`   📁 ${warning.file}`);
      lines.push(`      Issue: ${warning.issue}`);
      lines.push('');
    });
  }

  if (results.errors.length > 0) {
    lines.push('❌ Errors:');
    lines.push('-'.repeat(80));
    results.errors.forEach((error) => {
      lines.push(`   Type: ${error.type}`);
      lines.push(`   Message: ${error.message}`);
      lines.push('');
    });
  }

  // Final status
  lines.push('='.repeat(80));

  if (securityGatesPassed()) {
    lines.push('✅ ALL SECURITY GATES PASSED');
    lines.push('   Merge can proceed.');
  } else {
    lines.push('❌ SECURITY GATES FAILED');
    lines.push('   Merge is BLOCKED until issues are resolved.');
    lines.push('');
    lines.push('   Blocking issues:');
    const blocking = getBlockingIssues();
    blocking.forEach((issue) => {
      const severity = issue.severity || 'unknown';
      lines.push(`      - [${severity.toUpperCase()}] ${issue.file || issue.package || issue.issue}`);
    });
    lines.push('');
    lines.push('   Recommended actions:');
    lines.push('      1. Fix vulnerabilities with npm audit fix');
    lines.push('      2. Remove or redact secrets from code');
    lines.push('      3. Fix file permissions');
    lines.push('      4. Remove sensitive files from git');
  }

  lines.push('='.repeat(80));

  return lines.join('\n');
}

/**
 * Format as JSON
 */
function formatJSON(): string {
  const blockingIssues = getBlockingIssues();

  return JSON.stringify(
    {
      metadata: {
        severity: options.severity,
        strict: options.strict,
        passed: securityGatesPassed(),
      },
      summary: {
        vulnerabilities: results.vulnerabilities.length,
        secrets: results.secrets.length,
        permissions: results.permissions.length,
        warnings: results.warnings.length,
        errors: results.errors.length,
      },
      vulnerabilities: results.vulnerabilities,
      secrets: results.secrets,
      permissions: results.permissions,
      warnings: results.warnings,
      errors: results.errors,
      blockingIssues: blockingIssues,
    },
    null,
    2,
  );
}

/**
 * Main function
 */
function main() {
  switch (command) {
    case 'check':
    case 'scan': {
      console.log('🔒 Running security gate enforcement...\n');

      // Run all security checks
      runNpmAudit();
      scanForSecrets();
      checkPermissions();
      checkSensitiveFiles();

      const passed = securityGatesPassed();
      const output = formatResults();

      if (options.json) {
        console.log(formatJSON());
      } else {
        console.log(output);
      }

      process.exit(passed ? 0 : 1);
      break;
    }

    case 'validate': {
      console.log('🔍 Validating security configuration...\n');

      // Check if security files exist
      const securityFiles = [
        '.github/workflows/quality-gates.yml',
        'scripts/security-scan.ts',
        'scripts/security-gate-enforce.ts',
      ];

      let allExist = true;
      securityFiles.forEach((file) => {
        if (fs.existsSync(file)) {
          console.log(`✅ ${file} exists`);
        } else {
          console.log(`❌ ${file} missing`);
          allExist = false;
        }
      });

      // Check if security workflow is configured
      try {
        const workflowContent = fs.readFileSync('.github/workflows/quality-gates.yml', 'utf8');
        if (workflowContent.includes('security-scan')) {
          console.log('✅ Security scan is configured in workflow');
        } else {
          console.log('⚠️  Security scan is not configured in workflow');
        }
      } catch {
        console.log('⚠️  Could not check workflow configuration');
      }

      console.log('');
      if (allExist) {
        console.log('✅ Security configuration is valid.');
        process.exit(0);
      } else {
        console.log('❌ Security configuration is incomplete.');
        process.exit(1);
      }
      break;
    }

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.error('   Use --help for usage information.');
      process.exit(2);
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runNpmAudit,
    scanForSecrets,
    checkPermissions,
    checkSensitiveFiles,
    securityGatesPassed,
    getBlockingIssues,
    formatResults,
    formatJSON,
    getResults: () => ({ ...results }),
    resetResults: () => {
      results.vulnerabilities = [];
      results.secrets = [];
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
