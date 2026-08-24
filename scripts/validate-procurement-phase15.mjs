import fs from 'node:fs';
const migration='supabase/migrations/20260824060000_procurement_phase15_approval_orchestration.sql';
const service='src/lib/procurement/approvalOrchestration.ts';
const ui='src/components/procurement-module.tsx';
const checks=[
 [fs.existsSync(migration),'phase15 migration'],[fs.existsSync(service),'orchestration service'],[fs.existsSync(ui),'procurement UI'],
 [fs.readFileSync(migration,'utf8').includes('proc_approval_requests'),'approval request table'],
 [fs.readFileSync(migration,'utf8').includes('proc_approval_stages'),'approval stage table'],
 [fs.readFileSync(migration,'utf8').includes('proc_approval_actions'),'approval history table'],
 [fs.readFileSync(migration,'utf8').includes('proc_submit_approval_request'),'submission RPC'],
 [fs.readFileSync(migration,'utf8').includes('proc_approve_stage'),'stage decision RPC'],
 [fs.readFileSync(migration,'utf8').includes('proc_escalate_due_approvals'),'escalation RPC'],
 [fs.readFileSync(migration,'utf8').includes('proc_approval_queue'),'approval queue RPC'],
 [fs.readFileSync(migration,'utf8').includes('PROCUREMENT_APPROVAL_POLICY_BLOCKED: multi-step approval is not complete'),'final approval enforcement'],
 [fs.readFileSync(migration,'utf8').includes("status IN ('PENDING','APPROVED','REJECTED','CANCELLED')"),'request lifecycle'],
 [fs.readFileSync(migration,'utf8').includes("status IN ('PENDING','APPROVED','REJECTED','ESCALATED','CANCELLED')"),'stage lifecycle'],
 [fs.readFileSync(migration,'utf8').includes('delegation'),'delegation-aware authorization'],
 [fs.readFileSync(service,'utf8').includes('decideProcurementApprovalStage'),'stage service'],
 [fs.readFileSync(ui,'utf8').includes('Multi-Step Procurement Approval Orchestration'),'orchestration UI'],
 [fs.readFileSync(ui,'utf8').includes('Run SLA Escalation'),'SLA escalation UI'],
 [fs.readFileSync(ui,'utf8').includes('Submit PO for Orchestrated Approval'),'PO submission UI'],
];
const failed=checks.filter(([ok])=>!ok); if(failed.length){console.error('PROCUREMENT_PHASE15_VALIDATION=FAILED');failed.forEach(([,n])=>console.error(`missing=${n}`));process.exit(1)}
console.log('PROCUREMENT_PHASE15_VALIDATION=PASSED');console.log(`checks=${checks.length}`);
