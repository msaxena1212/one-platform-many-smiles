import { supabase } from '../supabase';

export async function nextProcurementDocumentNumber(docType: string, date = new Date()): Promise<string> {
  const fiscalYear = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  const { data, error } = await supabase.rpc('proc_next_document_number', {
    p_doc_type: docType,
    p_fiscal_year: fiscalYear,
  });
  if (error) throw error;
  if (!data) throw new Error(`Unable to generate ${docType} document number.`);
  return data as string;
}
