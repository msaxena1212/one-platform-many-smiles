import {
  accessPolicies,
  complianceChecks,
  dataResidency,
  securityAuditLogs,
  type AccessPolicy,
  type ComplianceCheck,
  type DataResidency,
  type SecurityAuditLog,
} from "./mock-data";

export type AccessPolicyType = AccessPolicy;
export type ComplianceCheckType = ComplianceCheck;
export type DataResidencyType = DataResidency;
export type SecurityAuditLogType = SecurityAuditLog;

export async function fetchAccessPolicies() {
  return Promise.resolve(accessPolicies);
}

export async function fetchComplianceChecks() {
  return Promise.resolve(complianceChecks);
}

export async function fetchDataResidencyRules() {
  return Promise.resolve(dataResidency);
}

export async function fetchSecurityAuditLogs() {
  return Promise.resolve(securityAuditLogs);
}

export async function logSecurityEvent(event: Omit<SecurityAuditLog, 'id'>) {
  const nextEvent: SecurityAuditLog = {
    id: `alog-${Date.now()}`,
    ...event,
  };
  securityAuditLogs.unshift(nextEvent);
  return Promise.resolve(nextEvent);
}