import { supabase } from '../supabase';

export type ApprovalInbox = {
  generated_at: string;
  actor_user_id: string;
  actor_role: string | null;
  summary: {
    pending_count: number;
    overdue_count: number;
    due_24h_count: number;
    unread_notifications: number;
  };
  stages: Array<Record<string, unknown>>;
  notifications: Array<Record<string, unknown>>;
};

export async function getProcurementApprovalInbox(limit = 100) {
  const { data, error } = await supabase.rpc('proc_approval_inbox', { p_limit: limit });
  if (error) throw error;
  return data as ApprovalInbox;
}

export async function generateProcurementApprovalNotifications(limit = 100) {
  const { data, error } = await supabase.rpc('proc_generate_approval_notifications', { p_limit: limit });
  if (error) throw error;
  return data as Record<string, unknown>;
}

export async function markProcurementApprovalNotificationRead(notificationId: string) {
  const { data, error } = await supabase.rpc('proc_mark_approval_notification_read', { p_notification_id: notificationId });
  if (error) throw error;
  return Boolean(data);
}

export async function markAllProcurementApprovalNotificationsRead() {
  const { data, error } = await supabase.rpc('proc_mark_all_approval_notifications_read');
  if (error) throw error;
  return Number(data ?? 0);
}
