import { supabase } from '../supabase';
import { createAccountingEvent } from '../finance/accounting-event-engine';

export async function capitalizePurchase(purchaseId: string) {
  const { data: purchase, error } = await supabase.from('proc_purchases').select('*').eq('id', purchaseId).single();
  if (error) throw error;
  if (purchase.posting_status === 'POSTED') return purchase;

  const { data: lines, error: linesError } = await supabase.from('proc_purchase_lines').select('*').eq('purchase_id', purchaseId).eq('item_type', 'CAPEX');
  if (linesError) throw linesError;
  const amount = (lines ?? []).reduce((sum: number, line: any) => sum + Number(line.total_amount || 0), 0);
  if (amount <= 0) throw new Error('No CAPEX amount is available for capitalization.');

  const firstAssetCategory = (lines?.[0] as any)?.asset_category as string | null | undefined;
  const { data: assetAccount } = await supabase
    .from('fin_coa_accounts')
    .select('account_code, account_name')
    .eq('is_active', true)
    .or(`account_code.eq.${firstAssetCategory ?? ''},account_name.ilike.%${firstAssetCategory ?? ''}%`)
    .limit(1)
    .maybeSingle();
  const assetAccountCode = assetAccount?.account_code as string | undefined;
  if (!assetAccountCode) {
    throw new Error(`No active asset COA account is configured for category: ${firstAssetCategory ?? 'unknown'}.`);
  }

  const event = await createAccountingEvent({
    event_type: 'ADJUSTMENT',
    source_type: 'PURCHASE_CAPITALIZATION', source_id: purchase.id,
    reference_number: purchase.doc_number, description: 'Procurement purchase capitalization',
    idempotency_key: `PROC:CAP:${purchase.id}`,
    lines: [
      { account_code: assetAccountCode, debit: amount, credit: 0, description: 'Recognize acquired asset' },
      { account_code: '13400', debit: 0, credit: amount, description: 'Clear CWIP on capitalization' },
    ],
  });

  const { error: postingError } = await supabase.rpc('post_accounting_event_atomic', { p_event_id: event.id });
  if (postingError) throw postingError;

  // Asset creation itself remains owned by the existing Assets module; this phase posts the capitalization event.
  const { data: updated, error: updateError } = await supabase.from('proc_purchases').update({
    posting_status: 'POSTED', status: 'APPROVED', accounting_event_id: event.id, capitalized_amount: amount,
  }).eq('id', purchaseId).select().single();
  if (updateError) throw updateError;
  return updated;
}
