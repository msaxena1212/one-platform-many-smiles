import fs from 'node:fs';
const migration='supabase/migrations/20260824070000_procurement_phase16_approval_inbox_notifications.sql';
const service='src/lib/procurement/approvalInbox.ts';
const ui='src/components/procurement-module.tsx';
const checks=[
 [fs.existsSync(migration),'phase16 migration'],
 [fs.existsSync(service),'approval inbox service'],
 [fs.readFileSync(migration,'utf8').includes('proc_approval_notifications'),'notification table'],
 [fs.readFileSync(migration,'utf8').includes('proc_notify_stage'),'stage notification helper'],
 [fs.readFileSync(migration,'utf8').includes('proc_generate_approval_notifications'),'notification generation RPC'],
 [fs.readFileSync(migration,'utf8').includes('proc_approval_inbox'),'approver inbox RPC'],
 [fs.readFileSync(migration,'utf8').includes('proc_mark_approval_notification_read'),'read notification RPC'],
 [fs.readFileSync(migration,'utf8').includes('proc_mark_all_approval_notifications_read'),'mark all read RPC'],
 [fs.readFileSync(migration,'utf8').includes("'SLA_DUE_SOON'"),'SLA due-soon event'],
 [fs.readFileSync(migration,'utf8').includes("'ESCALATED'"),'escalation event'],
 [fs.readFileSync(migration,'utf8').includes('delegated_for_actor'),'delegation visibility'],
 [fs.readFileSync(migration,'utf8').includes('overdue_count'),'overdue KPI'],
 [fs.readFileSync(migration,'utf8').includes('due_24h_count'),'24-hour KPI'],
 [fs.readFileSync(migration,'utf8').includes('unread_notifications'),'unread KPI'],
 [fs.readFileSync(migration,'utf8').includes('age_hours'),'approval aging'],
 [fs.readFileSync(migration,'utf8').includes('proc_notify_stage(v_stage.id,\'ESCALATED\''),'escalation notification integration'],
 [fs.readFileSync(service,'utf8').includes('getProcurementApprovalInbox'),'inbox service'],
 [fs.readFileSync(service,'utf8').includes('markAllProcurementApprovalNotificationsRead'),'notification read service'],
 [fs.readFileSync(ui,'utf8').includes('Approval Inbox'),'approval inbox UI'],
 [fs.readFileSync(ui,'utf8').includes('Unread Notifications'),'notification KPI UI'],
 [fs.readFileSync(ui,'utf8').includes('Mark All Read'),'mark-all UI'],
 [fs.readFileSync(ui,'utf8').includes('Generate Operational Notifications'),'notification generation UI'],
];
const failed=checks.filter(([ok])=>!ok);
if(failed.length){console.error('PROCUREMENT_PHASE16_VALIDATION=FAILED');failed.forEach(([,n])=>console.error(`missing=${n}`));process.exit(1)}
console.log('PROCUREMENT_PHASE16_VALIDATION=PASSED');console.log(`checks=${checks.length}`);
