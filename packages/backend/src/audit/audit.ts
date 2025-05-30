import { execSync } from 'child_process';
import { AuditResult, AuditConfig, AuditFinding, AuditSeverity } from './types';
import path from 'path';
import fs from 'fs';

export async function auditContract(
  sourceCode: string,
  config: AuditConfig,
  tempDir = '/tmp/audit'
): Promise<AuditResult> {
  // Create temp directory for analysis
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const contractPath = path.join(tempDir, 'contract.sol');
  fs.writeFileSync(contractPath, sourceCode);

  // Run security tools
  const slitherResults = runSlither(contractPath);
  const mythrilResults = runMythril(contractPath);

  const allFindings = [
    ...slitherResults,
    ...mythrilResults
  ];

  const summary = {
    critical: allFindings.filter(f => f.severity === 'critical').length,
    high: allFindings.filter(f => f.severity === 'high').length,
    medium: allFindings.filter(f => f.severity === 'medium').length,
    low: allFindings.filter(f => f.severity === 'low').length,
    info: allFindings.filter(f => f.severity === 'info').length
  };

  const passed = !config.failOn.some(severity => 
    allFindings.some(finding => 
      finding.severity === severity && 
      !config.skip?.includes(finding.id)
    )
  );

  return {
    findings: allFindings,
    passed,
    summary
  };
}

function runSlither(contractPath: string): AuditFinding[] {
  try {
    const output = execSync(`slither ${contractPath} --json -`, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore']
    });

    const results = JSON.parse(output);
    return results.results.detectors.map((detector: any) => ({
      id: `slither-${detector.check}`,
      title: detector.check,
      description: detector.description,
      severity: mapSlitherSeverity(detector.impact),
      recommendation: detector.recommendation,
      codeSnippet: detector.elements?.map((e: any) => e.source_mapping).join('\n')
    }));
  } catch (error) {
    console.error('Slither analysis failed:', error);
    return [];
  }
}

function runMythril(contractPath: string): AuditFinding[] {
  try {
    const output = execSync(`myth analyze ${contractPath} --max-depth 10 --execution-timeout 60 --json`, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore']
    });

    const results = JSON.parse(output);
    return results.issues.map((issue: any) => ({
      id: `mythril-${issue.title}`,
      title: issue.title,
      description: issue.description,
      severity: mapMythrilSeverity(issue.severity),
      recommendation: issue.recommendation || 'See description for mitigation',
      codeSnippet: issue.debug?.code
    }));
  } catch (error) {
    console.error('Mythril analysis failed:', error);
    return [];
  }
}

function mapSlitherSeverity(impact: string): AuditSeverity {
  switch (impact.toLowerCase()) {
    case 'high': return AuditSeverity.HIGH;
    case 'medium': return AuditSeverity.MEDIUM;
    case 'low': return AuditSeverity.LOW;
    default: return AuditSeverity.INFO;
  }
}

function mapMythrilSeverity(severity: string): AuditSeverity {
  switch (severity.toLowerCase()) {
    case 'high': return AuditSeverity.HIGH;
    case 'medium': return AuditSeverity.MEDIUM;
    case 'low': return AuditSeverity.LOW;
    default: return AuditSeverity.INFO;
  }
}

export function formatAuditReport(result: AuditResult): string {
  let report = `\n📊 Security Audit Report:\n`;
  report += `  Tools used: Slither, Mythril\n`;
  report += `  Critical: ${result.summary.critical}\n`;
  report += `  High: ${result.summary.high}\n`;
  report += `  Medium: ${result.summary.medium}\n`;
  report += `  Low: ${result.summary.low}\n\n`;

  if (result.findings.length > 0) {
    result.findings.forEach(finding => {
      report += `[${finding.severity.toUpperCase()}] ${finding.title}\n`;
      report += `  Tool: ${finding.id.split('-')[0]}\n`;
      report += `  Description: ${finding.description}\n`;
      if (finding.codeSnippet) {
        report += `  Location:\n${finding.codeSnippet}\n`;
      }
      report += `  Recommendation: ${finding.recommendation}\n\n`;
    });
  }

  report += `\n✅ Audit ${result.passed ? 'passed' : 'failed'}\n`;
  return report;
}
