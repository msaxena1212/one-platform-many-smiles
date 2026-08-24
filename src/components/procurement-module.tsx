import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, FileCheck2, PackageCheck, Receipt, ShoppingCart, Truck, RefreshCw, Plus, Send, Landmark, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { getProcurementLifecycleSummary, PurchaseOrdersApi, VendorQuotesApi, GoodsReceiptsApi, PayableInvoicesApi, PurchasesApi } from '@/lib/procurement/supabase-procurement';
import { convertSelectedQuoteToPurchaseOrder } from '@/lib/procurement/conversions';
import { submitProcurementApproval, decideProcurementApproval } from '@/lib/procurement/approvals';
import { postGrn, postPayableInvoice, postLandedCost } from '@/lib/procurement/postingService';
import { capitalizePurchase } from '@/lib/procurement/capitalizationService';
import { createPurchaseRequest, createShipment, createGateInward, createGrnFromPo, createPayableInvoice, createPayableInvoiceFromGrn, createLandedCost, createPurchaseFromGrn, inviteVendorToRfx, listProcurementVendors, selectVendorQuote, type ProcurementVendor } from '@/lib/procurement/operations';
import { runThreeWayMatch, validateProcurementLifecycle, finalizePurchase } from '@/lib/procurement/lifecycle';
import { getProcurementAuditLog, reconcilePurchaseOrder, type ProcurementAuditRow, type ProcurementReconciliation } from '@/lib/procurement/reconciliation';
import { getProcurementReleaseReadiness, runProcurementSchemaSmokeCheck, type ProcurementReleaseReadiness, type ProcurementSchemaSmokeCheck } from '@/lib/procurement/release';
import { getProcurementUatDashboard, validateProcurementUat, type ProcurementUatDashboard, type ProcurementUatResult } from '@/lib/procurement/uat';
import { getProcurementExceptionQueue, resolveProcurementException, type ProcurementException, type ProcurementExceptionQueue } from '@/lib/procurement/exceptions';
import { getProcurementAnalytics, type ProcurementAnalytics } from '@/lib/procurement/analytics';
import { getProcurementApprovalIntelligence, type ProcurementApprovalIntelligence } from '@/lib/procurement/approvalIntelligence';
import { getProcurementRiskIntelligence, type ProcurementRiskIntelligence } from '@/lib/procurement/riskIntelligence';
import { getProcurementAnomalyIntelligence, type ProcurementAnomalyIntelligence } from '@/lib/procurement/anomalyIntelligence';
import { getProcurementSupplierPerformance, type ProcurementSupplierPerformance } from '@/lib/procurement/supplierPerformance';
import { getProcurementGovernance, type ProcurementGovernance } from '@/lib/procurement/governance';
import { createProcurementDelegation, createProcurementPolicyRule, createProcurementPolicyVersion, getProcurementPolicySnapshot, type ProcurementPolicySnapshot } from '@/lib/procurement/policy';
import { decideProcurementApprovalStage, escalateDueProcurementApprovals, getProcurementApprovalQueue, submitProcurementApprovalRequest, type ApprovalQueue } from '@/lib/procurement/approvalOrchestration';
import { generateProcurementApprovalNotifications, getProcurementApprovalInbox, markAllProcurementApprovalNotificationsRead, markProcurementApprovalNotificationRead, type ApprovalInbox } from '@/lib/procurement/approvalInbox';
import { getProcurementActionCenter, refreshProcurementActionCenter, updateProcurementActionItem, type ProcurementActionCenter, type ProcurementActionItem } from '@/lib/procurement/actionCenter';

const stages = [
  ['proc_purchase_requests','Purchase Requests',ClipboardList],['proc_rfx','RFX',FileCheck2],['proc_vendor_quotes','Vendor Quotes',ShoppingCart],['proc_purchase_orders','Purchase Orders',ShoppingCart],['proc_shipments','Shipments / Import',Truck],['proc_goods_receipts','GRN',PackageCheck],['proc_landed_costs','Landed Cost',Receipt],['proc_payable_invoices','Payable Invoices',Receipt],['proc_purchases','Purchase / Capitalization',Landmark],
] as const;

type Line = { description: string; itemType: 'CAPEX'|'OPEX'|'INVENTORY'; quantity: number; unitRate: number; };
const blankLine = (): Line => ({ description: '', itemType: 'CAPEX', quantity: 1, unitRate: 0 });

function ErrorBox({ error }: { error: string | null }) { return error ? <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div> : null; }

export function ProcurementModule() {
  const [summary,setSummary]=useState<Record<string,number>>({}); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);
  const [vendors,setVendors]=useState<ProcurementVendor[]>([]); const [pos,setPos]=useState<any[]>([]); const [quotes,setQuotes]=useState<any[]>([]); const [grns,setGrns]=useState<any[]>([]); const [invoices,setInvoices]=useState<any[]>([]); const [purchases,setPurchases]=useState<any[]>([]);
  const [prLines,setPrLines]=useState<Line[]>([blankLine()]); const [prPriority,setPrPriority]=useState('NORMAL'); const [prRequiredDate,setPrRequiredDate]=useState(''); const [prRemarks,setPrRemarks]=useState('');
  const [selectedQuote,setSelectedQuote]=useState(''); const [rfxId,setRfxId]=useState(''); const [rfxVendor,setRfxVendor]=useState('');
  const [poId,setPoId]=useState(''); const [shipmentForm,setShipmentForm]=useState({blAwbNo:'',originCountry:'',originPort:'',destinationPort:'',incoterm:'',eta:'',etd:'',goodsInTransitAmount:'0'});
  const [grnPoId,setGrnPoId]=useState(''); const [invoiceVendor,setInvoiceVendor]=useState(''); const [invoicePoId,setInvoicePoId]=useState(''); const [invoiceGrnId,setInvoiceGrnId]=useState(''); const [invoiceSubtotal,setInvoiceSubtotal]=useState('0'); const [invoiceTax,setInvoiceTax]=useState('0'); const [invoiceDiscount,setInvoiceDiscount]=useState('0'); const [invoiceDesc,setInvoiceDesc]=useState('');
  const [lcPoId,setLcPoId]=useState(''); const [lcGrnId,setLcGrnId]=useState(''); const [lcType,setLcType]=useState('FREIGHT'); const [lcAmount,setLcAmount]=useState('0'); const [lcVendor,setLcVendor]=useState('');
  const [gateShipmentId,setGateShipmentId]=useState(''); const [gatePoId,setGatePoId]=useState(''); const [vehicleNo,setVehicleNo]=useState('');
  const [lifecyclePoId,setLifecyclePoId]=useState(''); const [lifecycleResult,setLifecycleResult]=useState<any>(null);
  const [reconcilePoId,setReconcilePoId]=useState(''); const [reconciliation,setReconciliation]=useState<ProcurementReconciliation|null>(null); const [auditRows,setAuditRows]=useState<ProcurementAuditRow[]>([]); const [releaseReadiness,setReleaseReadiness]=useState<ProcurementReleaseReadiness|null>(null); const [schemaSmoke,setSchemaSmoke]=useState<ProcurementSchemaSmokeCheck|null>(null);
  const [uatDashboard,setUatDashboard]=useState<ProcurementUatDashboard|null>(null); const [uatPoId,setUatPoId]=useState(''); const [uatResult,setUatResult]=useState<ProcurementUatResult|null>(null);
  const [exceptionQueue,setExceptionQueue]=useState<ProcurementExceptionQueue|null>(null); const [selectedException,setSelectedException]=useState<ProcurementException|null>(null); const [exceptionNotes,setExceptionNotes]=useState('');
  const [analytics,setAnalytics]=useState<ProcurementAnalytics|null>(null); const [analyticsDays,setAnalyticsDays]=useState('90');
  const [approvalIntelligence,setApprovalIntelligence]=useState<ProcurementApprovalIntelligence|null>(null); const [supplierPerformance,setSupplierPerformance]=useState<ProcurementSupplierPerformance|null>(null); const [supplierDays,setSupplierDays]=useState('365'); const [supplierConcentration,setSupplierConcentration]=useState('30'); const [riskIntelligence,setRiskIntelligence]=useState<ProcurementRiskIntelligence|null>(null); const [anomalyIntelligence,setAnomalyIntelligence]=useState<ProcurementAnomalyIntelligence|null>(null); const [anomalyDays,setAnomalyDays]=useState('90'); const [anomalyThreshold,setAnomalyThreshold]=useState('100000'); const [riskDays,setRiskDays]=useState('90'); const [riskThreshold,setRiskThreshold]=useState('100000'); const [approvalIntelligenceDays,setApprovalIntelligenceDays]=useState('90'); const [approvalHighValue,setApprovalHighValue]=useState('100000');
  const [actionCenter,setActionCenter]=useState<ProcurementActionCenter|null>(null); const [actionDays,setActionDays]=useState('30'); const [actionDueHours,setActionDueHours]=useState('24'); const [selectedAction,setSelectedAction]=useState<ProcurementActionItem|null>(null); const [actionNotes,setActionNotes]=useState(''); const [actionEvidence,setActionEvidence]=useState(''); const [actionOwner,setActionOwner]=useState('');
  const [governance,setGovernance]=useState<ProcurementGovernance|null>(null); const [governanceDays,setGovernanceDays]=useState('90'); const [governanceThreshold,setGovernanceThreshold]=useState('100000'); const [governanceConcentration,setGovernanceConcentration]=useState('50');
  const [policySnapshot,setPolicySnapshot]=useState<ProcurementPolicySnapshot|null>(null); const [policyCode,setPolicyCode]=useState('PROCUREMENT_DOA'); const [policyVersion,setPolicyVersion]=useState('2'); const [policyMode,setPolicyMode]=useState<'REPORT_ONLY'|'ENFORCE'>('ENFORCE'); const [policyNotes,setPolicyNotes]=useState('');
  const [rulePolicyId,setRulePolicyId]=useState(''); const [ruleMin,setRuleMin]=useState('0'); const [ruleMax,setRuleMax]=useState('100000'); const [ruleRole,setRuleRole]=useState('FINANCE'); const [ruleSla,setRuleSla]=useState('48'); const [ruleEscalation,setRuleEscalation]=useState('ADMIN');
  const [delegSourceRole,setDelegSourceRole]=useState('FINANCE'); const [delegTargetRole,setDelegTargetRole]=useState('ADMIN'); const [delegMax,setDelegMax]=useState('100000'); const [delegFrom,setDelegFrom]=useState(new Date().toISOString().slice(0,16)); const [delegTo,setDelegTo]=useState(new Date(Date.now()+7*86400000).toISOString().slice(0,16)); const [delegReason,setDelegReason]=useState('Temporary procurement approval delegation');
  const [approvalQueue,setApprovalQueue]=useState<ApprovalQueue|null>(null); const [approvalLoading,setApprovalLoading]=useState(false);
  const [approvalInbox,setApprovalInbox]=useState<ApprovalInbox|null>(null); const [inboxLoading,setInboxLoading]=useState(false);

  const load=async()=>{setLoading(true);setError(null);try{const [s,v,p,q,g,i,pu]=await Promise.all([getProcurementLifecycleSummary(),listProcurementVendors(),PurchaseOrdersApi.list(),VendorQuotesApi.list(),GoodsReceiptsApi.list(),PayableInvoicesApi.list(),PurchasesApi.list()]);setSummary(s);setVendors(v);setPos(p);setQuotes(q);setGrns(g);setInvoices(i);setPurchases(pu);}catch(e:any){setError(e?.message??String(e));}finally{setLoading(false);}};
  useEffect(()=>{void load();},[]);
  const totalDocuments=useMemo(()=>Object.values(summary).reduce((a,b)=>a+b,0),[summary]);
  const vendorLabel=(v:ProcurementVendor)=>String(v.name??v.vendor_name??v.company_name??v.legal_name??`Vendor #${v.id}`);
  const run=async(fn:()=>Promise<unknown>, message:string)=>{try{await fn();toast.success(message);await load();}catch(e:any){setError(e?.message??String(e));toast.error(e?.message ?? String(e));}};

  const createPr=()=>run(async()=>createPurchaseRequest({priority:prPriority,requiredDate:prRequiredDate||null,remarks:prRemarks,lines:prLines.filter(l=>l.description.trim()).map(l=>({...l,quantity:Number(l.quantity),unitRate:Number(l.unitRate)}))}),'Purchase Request created.');
  const createShip=()=>run(async()=>createShipment({purchaseOrderId:poId,...shipmentForm,goodsInTransitAmount:Number(shipmentForm.goodsInTransitAmount)}),'Shipment created.');
  const createGate=()=>run(async()=>createGateInward({shipmentId:gateShipmentId,purchaseOrderId:gatePoId,vehicleNo}),'Gate inward created.');
  const createGrn=()=>run(async()=>createGrnFromPo({purchaseOrderId:grnPoId}),'GRN created from PO.');
  const createInv=()=>run(async()=>{
    if (!invoiceGrnId) throw new Error('Select a GRN. Procurement AP invoices require a PO + GRN for three-way matching.');
    return createPayableInvoiceFromGrn({goodsReceiptId:invoiceGrnId,taxRate:Number(invoiceTax)>0&&Number(invoiceSubtotal)>0?(Number(invoiceTax)/Number(invoiceSubtotal))*100:0,discountAmount:Number(invoiceDiscount),remarks:invoiceDesc});
  },'Payable invoice created from GRN.');
  const createLc=()=>run(async()=>createLandedCost({purchaseOrderId:lcPoId||null,goodsReceiptId:lcGrnId||null,costType:lcType,vendorId:lcVendor?Number(lcVendor):null,amount:Number(lcAmount),allocationBasis:'VALUE'}),'Landed cost created.');
  const createPurchase=()=>run(async()=>createPurchaseFromGrn({purchaseOrderId:grnPoId,goodsReceiptId:grns.find(g=>g.purchase_order_id===grnPoId)?.id??'',payableInvoiceId:invoices.find(i=>i.purchase_order_id===grnPoId)?.id??null}),'Purchase created from GRN.');

  return <div className="space-y-6">
    <div className="flex items-start justify-between gap-4"><div><h1 className="text-2xl font-bold tracking-tight">Procurement Control Tower</h1><p className="text-sm text-muted-foreground mt-1">Operational procurement + finance integration: PR → RFX → Quote → PO → Logistics → GRN → Landed Cost → AP → Purchase</p></div><Button variant="outline" size="sm" onClick={()=>void load()} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading?'animate-spin':''}`}/>Refresh</Button></div>
    <ErrorBox error={error}/>
    <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">{stages.map(([key,label,Icon])=><Card key={key}><CardContent className="p-4"><Icon className="h-5 w-5 mb-2 text-primary"/><div className="text-sm font-medium">{label}</div><div className="mt-1 text-2xl font-bold">{loading?'—':summary[key]??0}</div></CardContent></Card>)}</div>
    <Card><CardContent className="p-4 grid gap-3 md:grid-cols-3"><div><p className="text-xs text-muted-foreground">Procurement records</p><p className="text-2xl font-bold">{loading?'—':totalDocuments}</p></div><div><p className="text-xs text-muted-foreground">Vendors available</p><p className="text-2xl font-bold">{vendors.length}</p></div><div><p className="text-xs text-muted-foreground">Accounting</p><p className="text-sm font-semibold mt-1">Atomic posting enabled</p></div></CardContent></Card>

    <Tabs defaultValue="pr" className="w-full"><TabsList className="flex h-auto flex-wrap justify-start gap-1"><TabsTrigger value="pr">Purchase Request</TabsTrigger><TabsTrigger value="sourcing">Sourcing</TabsTrigger><TabsTrigger value="logistics">Logistics</TabsTrigger><TabsTrigger value="receiving">GRN</TabsTrigger><TabsTrigger value="finance">Finance</TabsTrigger><TabsTrigger value="approvals">Approvals</TabsTrigger><TabsTrigger value="control">Control & Audit</TabsTrigger><TabsTrigger value="command">Command Center</TabsTrigger><TabsTrigger value="exceptions">Exception Resolution</TabsTrigger><TabsTrigger value="analytics">Management Analytics</TabsTrigger><TabsTrigger value="approval-intelligence">Approval Intelligence</TabsTrigger><TabsTrigger value="risk-intelligence">Risk Intelligence</TabsTrigger><TabsTrigger value="anomaly-intelligence">Anomaly Intelligence</TabsTrigger><TabsTrigger value="supplier-performance">Supplier Performance</TabsTrigger><TabsTrigger value="action-center">Action Center</TabsTrigger><TabsTrigger value="governance">Governance & Compliance</TabsTrigger><TabsTrigger value="policy">Policy & DoA</TabsTrigger></TabsList>
      <TabsContent value="pr"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5"/>Create Purchase Request</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 md:grid-cols-3"><div><Label>Priority</Label><Select value={prPriority} onValueChange={setPrPriority}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{['LOW','NORMAL','HIGH','URGENT'].map(x=><SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div><div><Label>Required date</Label><Input type="date" value={prRequiredDate} onChange={e=>setPrRequiredDate(e.target.value)}/></div><div><Label>Remarks</Label><Input value={prRemarks} onChange={e=>setPrRemarks(e.target.value)} placeholder="Business justification"/></div></div>{prLines.map((l,i)=><div key={i} className="grid gap-2 md:grid-cols-5 rounded-lg border p-3"><div className="md:col-span-2"><Label>Description</Label><Input value={l.description} onChange={e=>setPrLines(a=>a.map((x,j)=>j===i?{...x,description:e.target.value}:x))}/></div><div><Label>Type</Label><Select value={l.itemType} onValueChange={v=>setPrLines(a=>a.map((x,j)=>j===i?{...x,itemType:v as Line['itemType']}:x))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{['CAPEX','OPEX','INVENTORY'].map(x=><SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div><div><Label>Qty</Label><Input type="number" min="0.001" value={l.quantity} onChange={e=>setPrLines(a=>a.map((x,j)=>j===i?{...x,quantity:Number(e.target.value)}:x))}/></div><div><Label>Unit rate</Label><Input type="number" min="0" value={l.unitRate} onChange={e=>setPrLines(a=>a.map((x,j)=>j===i?{...x,unitRate:Number(e.target.value)}:x))}/></div></div>)}<div className="flex gap-2"><Button variant="outline" onClick={()=>setPrLines(a=>[...a,blankLine()])}>Add line</Button><Button onClick={()=>void createPr()}>Create PR</Button></div></CardContent></Card></TabsContent>

      <TabsContent value="sourcing">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>RFX → Vendor Invitation</CardTitle></CardHeader><CardContent className="space-y-3">
            <Label>RFX</Label>
            <Select value={rfxId} onValueChange={setRfxId}><SelectTrigger><SelectValue placeholder="Select RFX" /></SelectTrigger><SelectContent><RfxPicker onSelect={setRfxId} /></SelectContent></Select>
            <Label>Vendor</Label>
            <Select value={rfxVendor} onValueChange={setRfxVendor}><SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger><SelectContent>{vendors.map(v=><SelectItem key={v.id} value={String(v.id)}>{vendorLabel(v)}</SelectItem>)}</SelectContent></Select>
            <Button disabled={!rfxId||!rfxVendor} onClick={()=>void run(()=>inviteVendorToRfx(rfxId,Number(rfxVendor)),'Vendor invited to RFX.')}>Invite Vendor</Button>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Quote Selection → PO</CardTitle></CardHeader><CardContent className="space-y-3">
            <Label>Vendor quote</Label>
            <Select value={selectedQuote} onValueChange={setSelectedQuote}><SelectTrigger><SelectValue placeholder="Select quote" /></SelectTrigger><SelectContent>{quotes.map(q=><SelectItem key={q.id} value={q.id}>{q.doc_number} · Vendor #{q.vendor_id} · {Number(q.total_amount||0).toFixed(2)}</SelectItem>)}</SelectContent></Select>
            <div className="flex gap-2"><Button disabled={!selectedQuote} onClick={()=>void run(()=>selectVendorQuote(selectedQuote),'Vendor quote selected.')}>Select Quote</Button><Button variant="outline" disabled={!selectedQuote} onClick={()=>void run(()=>convertSelectedQuoteToPurchaseOrder(selectedQuote),'Purchase order created from selected quote.')}>Convert to PO</Button></div>
          </CardContent></Card>
        </div>
      </TabsContent>

      <TabsContent value="logistics">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>Shipment / Import</CardTitle></CardHeader><CardContent className="space-y-3">
            <Label>Purchase Order</Label>
            <Select value={poId} onValueChange={setPoId}><SelectTrigger><SelectValue placeholder="Select PO" /></SelectTrigger><SelectContent>{pos.map(p=><SelectItem key={p.id} value={p.id}>{p.doc_number} · {Number(p.total_amount||0).toFixed(2)}</SelectItem>)}</SelectContent></Select>
            <div className="grid grid-cols-2 gap-2">{(['blAwbNo','originCountry','originPort','destinationPort','incoterm','goodsInTransitAmount'] as const).map(k=><div key={k}><Label>{k}</Label><Input value={shipmentForm[k]} onChange={e=>setShipmentForm(x=>({...x,[k]:e.target.value}))}/></div>)}</div>
            <div className="grid grid-cols-2 gap-2"><div><Label>ETD</Label><Input type="date" value={shipmentForm.etd} onChange={e=>setShipmentForm(x=>({...x,etd:e.target.value}))}/></div><div><Label>ETA</Label><Input type="date" value={shipmentForm.eta} onChange={e=>setShipmentForm(x=>({...x,eta:e.target.value}))}/></div></div>
            <Button disabled={!poId} onClick={()=>void createShip()}>Create Shipment</Button>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Gate Inward</CardTitle></CardHeader><CardContent className="space-y-3">
            <Label>Shipment ID</Label><Input value={gateShipmentId} onChange={e=>setGateShipmentId(e.target.value)} placeholder="Shipment UUID"/>
            <Label>Purchase Order ID</Label><Input value={gatePoId} onChange={e=>setGatePoId(e.target.value)} placeholder="PO UUID"/>
            <Label>Vehicle No.</Label><Input value={vehicleNo} onChange={e=>setVehicleNo(e.target.value)}/>
            <Button disabled={!gateShipmentId||!gatePoId} onClick={()=>void createGate()}>Record Gate Inward</Button>
          </CardContent></Card>
        </div>
      </TabsContent>

      <TabsContent value="receiving"><Card><CardHeader><CardTitle>PO → GRN</CardTitle></CardHeader><CardContent className="space-y-3"><Label>Purchase Order</Label><Select value={grnPoId} onValueChange={setGrnPoId}><SelectTrigger><SelectValue placeholder="Select PO"/></SelectTrigger><SelectContent>{pos.map(p=><SelectItem key={p.id} value={p.id}>{p.doc_number} · {Number(p.total_amount||0).toFixed(2)}</SelectItem>)}</SelectContent></Select><div className="flex flex-wrap gap-2"><Button disabled={!grnPoId} onClick={()=>void createGrn()}>Create GRN</Button><Button variant="outline" disabled={!grnPoId||!grns.find(g=>g.purchase_order_id===grnPoId)} onClick={()=>void run(()=>submitProcurementApproval('GRN',grns.find(g=>g.purchase_order_id===grnPoId).id),'GRN submitted for approval.')}>Submit GRN</Button><Button variant="outline" disabled={!grnPoId||!grns.find(g=>g.purchase_order_id===grnPoId)} onClick={()=>void run(()=>postGrn(grns.find(g=>g.purchase_order_id===grnPoId).id),'GRN posted to GR/IR and CWIP/Inventory.')}>Post GRN</Button></div><div className="mt-4 space-y-2">{grns.slice(0,8).map(g=><div key={g.id} className="flex items-center justify-between rounded-md border p-3 text-sm"><span>{g.doc_number} · PO {String(g.purchase_order_id).slice(0,8)}</span><Badge variant={g.posting_status==='POSTED'?'default':'secondary'}>{g.posting_status}</Badge></div>)}</div></CardContent></Card></TabsContent>

      <TabsContent value="finance">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card><CardHeader><CardTitle>Payable Invoice</CardTitle></CardHeader><CardContent className="space-y-3">
            <Label>Vendor</Label><Select value={invoiceVendor} onValueChange={setInvoiceVendor}><SelectTrigger><SelectValue placeholder="Select vendor"/></SelectTrigger><SelectContent>{vendors.map(v=><SelectItem key={v.id} value={String(v.id)}>{vendorLabel(v)}</SelectItem>)}</SelectContent></Select>
            <Label>PO (optional)</Label><Select value={invoicePoId} onValueChange={setInvoicePoId}><SelectTrigger><SelectValue placeholder="Select PO"/></SelectTrigger><SelectContent>{pos.map(p=><SelectItem key={p.id} value={p.id}>{p.doc_number}</SelectItem>)}</SelectContent></Select>
            <Label>GRN (optional)</Label><Select value={invoiceGrnId} onValueChange={setInvoiceGrnId}><SelectTrigger><SelectValue placeholder="Select GRN"/></SelectTrigger><SelectContent>{grns.map(g=><SelectItem key={g.id} value={g.id}>{g.doc_number}</SelectItem>)}</SelectContent></Select>
            <Input type="number" placeholder="Subtotal" value={invoiceSubtotal} onChange={e=>setInvoiceSubtotal(e.target.value)}/><Input type="number" placeholder="Tax" value={invoiceTax} onChange={e=>setInvoiceTax(e.target.value)}/><Input type="number" placeholder="Discount" value={invoiceDiscount} onChange={e=>setInvoiceDiscount(e.target.value)}/>
            <Textarea placeholder="Invoice line description" value={invoiceDesc} onChange={e=>setInvoiceDesc(e.target.value)}/><Button disabled={!invoiceGrnId||Number(invoiceSubtotal)<=0} onClick={()=>void createInv()}>Create Invoice from GRN</Button>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Landed Cost</CardTitle></CardHeader><CardContent className="space-y-3">
            <Select value={lcType} onValueChange={setLcType}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{['FREIGHT','CUSTOMS','DUTY','CLEARING','INSURANCE','OTHER'].map(x=><SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select>
            <Select value={lcPoId} onValueChange={setLcPoId}><SelectTrigger><SelectValue placeholder="Purchase Order"/></SelectTrigger><SelectContent>{pos.map(p=><SelectItem key={p.id} value={p.id}>{p.doc_number}</SelectItem>)}</SelectContent></Select>
            <Select value={lcGrnId} onValueChange={setLcGrnId}><SelectTrigger><SelectValue placeholder="GRN"/></SelectTrigger><SelectContent>{grns.map(g=><SelectItem key={g.id} value={g.id}>{g.doc_number}</SelectItem>)}</SelectContent></Select>
            <Select value={lcVendor} onValueChange={setLcVendor}><SelectTrigger><SelectValue placeholder="Vendor (optional)"/></SelectTrigger><SelectContent>{vendors.map(v=><SelectItem key={v.id} value={String(v.id)}>{vendorLabel(v)}</SelectItem>)}</SelectContent></Select>
            <Input type="number" min="0" value={lcAmount} onChange={e=>setLcAmount(e.target.value)}/><Button disabled={Number(lcAmount)<=0} onClick={()=>void createLc()}>Create Landed Cost</Button>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Lifecycle Controls</CardTitle></CardHeader><CardContent className="space-y-3">
            <Select value={lifecyclePoId} onValueChange={setLifecyclePoId}><SelectTrigger><SelectValue placeholder="Select PO for lifecycle validation"/></SelectTrigger><SelectContent>{pos.map(p=><SelectItem key={p.id} value={p.id}>{p.doc_number}</SelectItem>)}</SelectContent></Select>
            <Button className="w-full" variant="outline" disabled={!lifecyclePoId} onClick={()=>void run(async()=>{const result=await validateProcurementLifecycle(lifecyclePoId);setLifecycleResult(result);return result;},'Procurement lifecycle validated.')}>Validate PO Lifecycle</Button>
            <Button className="w-full" variant="outline" disabled={!invoices.length} onClick={()=>void run(()=>runThreeWayMatch(invoices.find(i=>i.posting_status!=='POSTED')?.id ?? invoices[0].id),'Three-way match completed.')}>Run 3-Way Match</Button>
            <Button className="w-full" variant="outline" disabled={!purchases.length} onClick={()=>void run(()=>finalizePurchase(purchases.find(p=>p.status!=='APPROVED')?.id ?? purchases[0].id),'Purchase finalized and marked ready for capitalization.')}>Finalize Purchase</Button>
            {lifecycleResult && <div className="rounded-md border p-3 text-xs space-y-1"><div>PR approved: <b>{String(lifecycleResult.pr_approved)}</b></div><div>Quote selected: <b>{String(lifecycleResult.quote_selected)}</b></div><div>PO approved: <b>{String(lifecycleResult.po_approved)}</b></div><div>GRN posted: <b>{String(lifecycleResult.grn_posted)}</b></div><div>3-way match: <b>{String(lifecycleResult.three_way_match_passed)}</b></div><div>Ready for capitalization: <b>{String(lifecycleResult.ready_for_capitalization)}</b></div></div>}
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Accounting Actions</CardTitle></CardHeader><CardContent className="space-y-3">
            <Button className="w-full" variant="outline" disabled={!invoices.length} onClick={()=>void run(()=>submitProcurementApproval('INVOICE',invoices.find(i=>i.status==='DRAFT')?.id ?? invoices[0].id),'Invoice submitted for approval.')}>Submit AP Invoice</Button><Button className="w-full" disabled={!invoices.length} onClick={()=>void run(()=>postPayableInvoice(invoices.find(i=>i.posting_status!=='POSTED')?.id ?? invoices[0].id),'Payable invoice posted to AP.') }><Send className="mr-2 h-4 w-4"/>Post AP Invoice</Button>
            <Button className="w-full" variant="outline" disabled={!grnPoId||!grns.find(g=>g.purchase_order_id===grnPoId)} onClick={()=>void run(()=>createPurchaseFromGrn({purchaseOrderId:grnPoId,goodsReceiptId:grns.find(g=>g.purchase_order_id===grnPoId).id}),'Purchase created from GRN.')}>Create Purchase</Button>
            <Button className="w-full" variant="outline" disabled={!purchases.length} onClick={()=>void run(()=>capitalizePurchase(purchases.find(p=>p.posting_status!=='POSTED')?.id ?? purchases[0].id),'Purchase capitalization posted to the General Ledger.')}>Capitalize Purchase</Button>
          </CardContent></Card>
        </div>
        <div className="mt-4 grid gap-2">{invoices.slice(0,8).map(i=><div key={i.id} className="flex justify-between border rounded-md p-3 text-sm"><span>{i.doc_number} · {Number(i.total_amount||0).toFixed(2)}</span><Badge>{i.posting_status}</Badge></div>)}</div>
      </TabsContent>

      <TabsContent value="control">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>PO Reconciliation</CardTitle></CardHeader><CardContent className="space-y-3">
            <Select value={reconcilePoId} onValueChange={setReconcilePoId}><SelectTrigger><SelectValue placeholder="Select Purchase Order"/></SelectTrigger><SelectContent>{pos.map(p=><SelectItem key={p.id} value={p.id}>{p.doc_number}</SelectItem>)}</SelectContent></Select>
            <Button className="w-full" disabled={!reconcilePoId} onClick={()=>void run(async()=>{const r=await reconcilePurchaseOrder(reconcilePoId);setReconciliation(r);setAuditRows(await getProcurementAuditLog('proc_purchase_orders',reconcilePoId,50));return r;},'Purchase order reconciliation completed.')}>Run Reconciliation</Button><Button className="w-full" variant="outline" disabled={!reconcilePoId} onClick={()=>void run(async()=>{const r=await getProcurementReleaseReadiness(reconcilePoId);setReleaseReadiness(r);return r;},'Release readiness checked.')}>Check Release Readiness</Button><Button className="w-full" variant="ghost" onClick={()=>void run(async()=>{const r=await runProcurementSchemaSmokeCheck();setSchemaSmoke(r);return r;},'Procurement schema smoke check completed.')}>Run Schema Smoke Check</Button>
            {releaseReadiness && <div className="rounded-md border p-3 text-sm space-y-2"><div className="flex justify-between"><span>Release readiness</span><Badge variant={releaseReadiness.ready?'default':'destructive'}>{releaseReadiness.ready?'READY':'BLOCKED'}</Badge></div>{releaseReadiness.issues.length>0&&<div className="rounded-md bg-destructive/5 border border-destructive/20 p-2 text-destructive">{releaseReadiness.issues.map((x,i)=><div key={i}>• {x}</div>)}</div>}</div>}{schemaSmoke && <div className="rounded-md border p-3 text-xs"><div className="font-medium">Schema smoke: {schemaSmoke.ready?'READY':'INCOMPLETE'}</div><div>Checked {schemaSmoke.checked_table_count} procurement tables.</div>{schemaSmoke.missing_tables.length>0&&<div className="text-destructive">Missing: {schemaSmoke.missing_tables.join(', ')}</div>}</div>}{reconciliation && <div className="rounded-md border p-3 text-sm space-y-2"><div className="flex justify-between"><span>Status</span><Badge variant={reconciliation.reconciled?'default':'destructive'}>{reconciliation.reconciled?'RECONCILED':'EXCEPTIONS'}</Badge></div><div>PO: <b>{Number(reconciliation.po_amount).toFixed(2)}</b></div><div>GRN: <b>{Number(reconciliation.grn_amount).toFixed(2)}</b></div><div>AP subtotal: <b>{Number(reconciliation.invoice_subtotal).toFixed(2)}</b></div><div>Landed cost posted / allocated: <b>{Number(reconciliation.posted_landed_cost).toFixed(2)} / {Number(reconciliation.allocated_landed_cost).toFixed(2)}</b></div><div>Purchase: <b>{Number(reconciliation.purchase_amount).toFixed(2)}</b></div><div>Accounting events: <b>{reconciliation.posted_accounting_event_count}/{reconciliation.accounting_event_count} posted</b></div>{reconciliation.issues.length>0&&<div className="rounded-md bg-destructive/5 border border-destructive/20 p-2 text-destructive">{reconciliation.issues.map((x,i)=><div key={i}>• {x}</div>)}</div>}</div>}
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Purchase Order Audit Trail</CardTitle></CardHeader><CardContent>{auditRows.length===0?<p className="text-sm text-muted-foreground">Run reconciliation to load audit history.</p>:<div className="space-y-2 max-h-96 overflow-auto">{auditRows.map(a=><div key={a.id} className="rounded-md border p-2 text-xs"><div className="flex justify-between"><Badge variant="outline">{a.action}</Badge><span>{new Date(a.created_at).toLocaleString()}</span></div><div className="mt-1 text-muted-foreground">Changed: {a.changed_fields?.join(', ') || '—'}</div></div>)}</div>}</CardContent></Card>
        </div>
      </TabsContent>

      <TabsContent value="command">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4"/>UAT checked</div><div className="mt-1 text-2xl font-bold">{uatDashboard?.purchase_orders_checked ?? '—'}</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4"/>UAT passed</div><div className="mt-1 text-2xl font-bold">{uatDashboard?.passed_purchase_orders ?? '—'}</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><AlertTriangle className="h-4 w-4"/>UAT exceptions</div><div className="mt-1 text-2xl font-bold">{uatDashboard?.failed_purchase_orders ?? '—'}</div></CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Overall control status</div><div className="mt-2"><Badge variant={uatDashboard?.all_passed ? 'default' : uatDashboard ? 'destructive' : 'secondary'}>{uatDashboard ? (uatDashboard.all_passed ? 'ALL PASSED' : 'EXCEPTIONS') : 'NOT RUN'}</Badge></div></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5"/>Procurement Command Center</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={()=>void run(async()=>{const r=await getProcurementUatDashboard(25);setUatDashboard(r);return r;},'Procurement UAT dashboard refreshed.')}>Run E2E UAT</Button>
                <Button variant="outline" disabled={!uatPoId} onClick={()=>void run(async()=>{const r=await validateProcurementUat(uatPoId);setUatResult(r);return r;},'Purchase order UAT completed.')}>Validate Selected PO</Button>
                <Select value={uatPoId} onValueChange={setUatPoId}><SelectTrigger className="w-[260px]"><SelectValue placeholder="Select PO for detailed UAT"/></SelectTrigger><SelectContent>{pos.map(p=><SelectItem key={p.id} value={p.id}>{p.doc_number}</SelectItem>)}</SelectContent></Select>
              </div>
              {uatDashboard && <div className="rounded-md border overflow-hidden">
                <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-2 bg-muted/50 px-3 py-2 text-xs font-medium"><span>Purchase Order</span><span>Status</span><span>Passed</span><span>Failed</span></div>
                {uatDashboard.results.map(r=><div key={r.po_id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-2 border-t px-3 py-3 text-sm"><span className="font-medium">{r.po_number}</span><span><Badge variant={r.passed?'default':'destructive'}>{r.passed?'PASS':'FAIL'}</Badge></span><span>{r.passed_count}</span><span>{r.failed_count}</span></div>)}
                {uatDashboard.results.length===0 && <div className="p-4 text-sm text-muted-foreground">No active purchase orders available for UAT.</div>}
              </div>}
              {uatResult && <div className="rounded-md border p-4 space-y-3">
                <div className="flex items-center justify-between"><div><div className="font-semibold">{uatResult.po_number}</div><div className="text-xs text-muted-foreground">{uatResult.passed_count}/{uatResult.test_count} controls passed</div></div><Badge variant={uatResult.passed?'default':'destructive'}>{uatResult.passed?'PASS':'FAIL'}</Badge></div>
                <div className="grid gap-2 md:grid-cols-2">{uatResult.tests.map(t=><div key={t.id} className="rounded-md border p-3 text-sm"><div className="flex items-center justify-between gap-2"><span className="font-medium">{t.id}</span><Badge variant={t.passed?'default':'destructive'}>{t.passed?'PASS':'FAIL'}</Badge></div><div className="mt-1 text-xs text-muted-foreground">{t.detail}</div></div>)}</div>
              </div>}
            </CardContent>
          </Card>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card><CardHeader><CardTitle>Approval exceptions</CardTitle></CardHeader><CardContent className="text-sm"><div className="text-2xl font-bold">{[...pos,...quotes,...grns,...invoices].filter(x=>x.status==='SUBMITTED').length}</div><p className="text-xs text-muted-foreground mt-1">Submitted documents awaiting approval</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Unposted GRNs</CardTitle></CardHeader><CardContent className="text-sm"><div className="text-2xl font-bold">{grns.filter(x=>x.posting_status!=='POSTED').length}</div><p className="text-xs text-muted-foreground mt-1">Receiving documents not posted</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Unposted AP</CardTitle></CardHeader><CardContent className="text-sm"><div className="text-2xl font-bold">{invoices.filter(x=>x.posting_status!=='POSTED').length}</div><p className="text-xs text-muted-foreground mt-1">Payable invoices not posted</p></CardContent></Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="analytics">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5"/>Procurement Management Analytics</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-2">
                <div><Label>Reporting period</Label><Select value={analyticsDays} onValueChange={setAnalyticsDays}><SelectTrigger className="w-[150px]"><SelectValue/></SelectTrigger><SelectContent>{['30','90','180','365'].map(x=><SelectItem key={x} value={x}>{x} days</SelectItem>)}</SelectContent></Select></div>
                <Button onClick={()=>void run(async()=>{const r=await getProcurementAnalytics(Number(analyticsDays),20);setAnalytics(r);return r;},'Management analytics refreshed.')}>Refresh Analytics</Button>
                <span className="text-xs text-muted-foreground">Read-only reporting. SLA thresholds are reporting benchmarks, not transaction controls.</span>
              </div>
              {analytics ? <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-8">
                  {[["Spend",Number(analytics.kpis.total_spend).toLocaleString(undefined,{maximumFractionDigits:2})],["POs",analytics.kpis.po_count],["Open POs",analytics.kpis.open_po_count],["Overdue POs",analytics.kpis.overdue_po_count],["GRNs",analytics.kpis.grn_count],["AP Invoices",analytics.kpis.invoice_count],["Open Exceptions",analytics.kpis.open_exception_count],["Avg Exception Age",`${Number(analytics.exception_age.avg_open_exception_age_days).toFixed(1)}d`]].map(([label,value])=><Card key={String(label)}><CardContent className="p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-xl font-bold">{value}</div></CardContent></Card>)}
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                  <Card><CardHeader><CardTitle className="text-base">Cycle Time</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">{[["PR → PO",analytics.cycle_times.avg_pr_to_po_days,analytics.sla.pr_to_po_days],["PO → GRN",analytics.cycle_times.avg_po_to_grn_days,analytics.sla.po_to_grn_days],["PO → AP",analytics.cycle_times.avg_po_to_ap_days,analytics.sla.po_to_ap_days]].map(([label,value,sla])=><div key={String(label)} className="flex items-center justify-between"><span>{label}</span><span className="font-semibold">{Number(value).toFixed(1)}d <span className="text-xs text-muted-foreground">/ SLA {sla}d</span></span></div>)}</CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-base">Monthly Spend</CardTitle></CardHeader><CardContent className="space-y-2">{analytics.spend_by_month.length ? analytics.spend_by_month.map(x=><div key={x.month} className="flex items-center justify-between text-sm"><span>{x.month}</span><span className="font-medium">{Number(x.spend).toLocaleString(undefined,{maximumFractionDigits:2})}</span></div>) : <p className="text-sm text-muted-foreground">No spend in the selected period.</p>}</CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-base">Vendor Performance</CardTitle></CardHeader><CardContent className="space-y-2">{analytics.vendor_performance.length ? analytics.vendor_performance.slice(0,8).map(x=><div key={x.vendor_id} className="rounded border p-2 text-sm"><div className="flex justify-between"><span className="font-medium">Vendor #{x.vendor_id}</span><span>{Number(x.spend).toLocaleString(undefined,{maximumFractionDigits:0})}</span></div><div className="text-xs text-muted-foreground">{x.po_count} POs · {x.completed_po_count} completed · {x.overdue_po_count} overdue</div></div>) : <p className="text-sm text-muted-foreground">No vendor activity.</p>}</CardContent></Card>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card><CardHeader><CardTitle className="text-base">Overdue Purchase Orders</CardTitle></CardHeader><CardContent>{analytics.overdue_purchase_orders.length ? <div className="space-y-2">{analytics.overdue_purchase_orders.map(x=><div key={x.po_id} className="flex items-center justify-between rounded border p-3 text-sm"><div><div className="font-medium">{x.po_number}</div><div className="text-xs text-muted-foreground">Vendor #{x.vendor_id} · Due {x.expected_delivery_date}</div></div><Badge variant="destructive">{x.days_overdue}d overdue</Badge></div>)}</div> : <p className="text-sm text-muted-foreground">No overdue purchase orders.</p>}</CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-base">Exception Aging</CardTitle></CardHeader><CardContent>{analytics.open_exceptions.length ? <div className="space-y-2">{analytics.open_exceptions.map(x=><div key={x.exception_key} className="flex items-center justify-between rounded border p-3 text-sm"><div><div className="font-medium">{x.source_number} · {x.control_id}</div><div className="text-xs text-muted-foreground">{x.severity} · {x.status}</div></div><Badge variant={x.age_days >= analytics.sla.exception_resolution_days ? 'destructive':'secondary'}>{Number(x.age_days).toFixed(1)}d</Badge></div>)}</div> : <p className="text-sm text-muted-foreground">No open exceptions in the selected period.</p>}</CardContent></Card>
                </div>
              </div> : <div className="rounded-md border p-5 text-sm text-muted-foreground">Run analytics to load management KPIs, cycle times, vendor performance, SLA breaches and exception aging.</div>}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="approval-intelligence">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5"/>Approval Intelligence & SLA Health</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-2">
                <div><Label>Reporting period</Label><Select value={approvalIntelligenceDays} onValueChange={setApprovalIntelligenceDays}><SelectTrigger className="w-[150px]"><SelectValue/></SelectTrigger><SelectContent>{['30','90','180','365'].map(x=><SelectItem key={x} value={x}>{x} days</SelectItem>)}</SelectContent></Select></div>
                <div><Label>High-value threshold</Label><Input type="number" min="0" value={approvalHighValue} onChange={e=>setApprovalHighValue(e.target.value)} className="w-[180px]"/></div>
                <Button onClick={()=>void run(async()=>{const r=await getProcurementApprovalIntelligence(Number(approvalIntelligenceDays),20,Number(approvalHighValue));setApprovalIntelligence(r);return r;},'Approval intelligence refreshed.')}>Refresh Intelligence</Button>
                <span className="text-xs text-muted-foreground">Read-only management intelligence over approval workflow, SLA, escalation and delegation performance.</span>
              </div>
              {approvalIntelligence ? <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-8">
                  {[['Health Score',`${approvalIntelligence.health_score}/100`],['Pending',approvalIntelligence.kpis.pending_requests],['Overdue Stages',approvalIntelligence.kpis.overdue_stages],['Due ≤24h',approvalIntelligence.kpis.due_24h_stages],['SLA Compliance',`${Number(approvalIntelligence.performance.sla_compliance_percent).toFixed(1)}%`],['Rejection Rate',`${Number(approvalIntelligence.performance.rejection_rate_percent).toFixed(1)}%`],['Escalation Rate',`${Number(approvalIntelligence.performance.escalation_rate_percent).toFixed(1)}%`],['Delegation Use',`${Number(approvalIntelligence.performance.delegation_utilization_percent).toFixed(1)}%`]].map(([label,value])=><Card key={String(label)}><CardContent className="p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-xl font-bold">{value}</div></CardContent></Card>)}
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                  <Card><CardHeader><CardTitle className="text-base">Approval Performance</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between"><span>Avg stage completion</span><b>{Number(approvalIntelligence.performance.avg_stage_completion_hours).toFixed(1)}h</b></div><div className="flex justify-between"><span>Avg request cycle</span><b>{Number(approvalIntelligence.performance.avg_request_cycle_days).toFixed(1)}d</b></div><div className="flex justify-between"><span>Approved requests</span><b>{approvalIntelligence.kpis.approved_requests}</b></div><div className="flex justify-between"><span>Rejected requests</span><b>{approvalIntelligence.kpis.rejected_requests}</b></div></CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-base">Approval Aging</CardTitle></CardHeader><CardContent className="space-y-2">{approvalIntelligence.aging.map(x=><div key={x.bucket} className="flex items-center justify-between text-sm"><span>{x.bucket}</span><Badge variant={x.bucket==='7d+'&&x.count>0?'destructive':'secondary'}>{x.count}</Badge></div>)}</CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-base">Monthly Trend</CardTitle></CardHeader><CardContent className="space-y-2">{approvalIntelligence.monthly_trends.length ? approvalIntelligence.monthly_trends.map(x=><div key={x.period} className="rounded border p-2 text-sm"><div className="flex justify-between"><span className="font-medium">{x.period}</span><span>{x.request_count} requests</span></div><div className="text-xs text-muted-foreground">{x.approved_count} approved · {x.rejected_count} rejected · {Number(x.avg_cycle_days).toFixed(1)}d avg cycle</div></div>) : <p className="text-sm text-muted-foreground">No approval activity in the selected period.</p>}</CardContent></Card>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card><CardHeader><CardTitle className="text-base">Workload by Role</CardTitle></CardHeader><CardContent className="space-y-2">{approvalIntelligence.workload_by_role.length ? approvalIntelligence.workload_by_role.map(x=><div key={x.role} className="rounded border p-3 text-sm"><div className="flex justify-between"><span className="font-medium">{x.role}</span><Badge variant={x.overdue_count>0?'destructive':'secondary'}>{x.pending_count} pending</Badge></div><div className="text-xs text-muted-foreground mt-1">{x.overdue_count} overdue · {x.completed_stage_count} completed · {x.avg_completion_hours==null?'—':`${Number(x.avg_completion_hours).toFixed(1)}h avg`}</div></div>) : <p className="text-sm text-muted-foreground">No approval workload data.</p>}</CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-base">Bottlenecks</CardTitle></CardHeader><CardContent className="space-y-2">{approvalIntelligence.bottlenecks.length ? approvalIntelligence.bottlenecks.slice(0,8).map(x=><div key={x.role} className="rounded border p-3 text-sm"><div className="flex justify-between"><span className="font-medium">{x.role}</span><Badge variant={(x.sla_breach_count??0)>0?'destructive':'secondary'}>{x.sla_breach_count} SLA breaches</Badge></div><div className="text-xs text-muted-foreground mt-1">{Number(x.avg_cycle_hours??0).toFixed(1)}h avg cycle · {Number(x.avg_variance_hours??0).toFixed(1)}h vs SLA · {x.approved_stage_count} stages</div></div>) : <p className="text-sm text-muted-foreground">No bottleneck data.</p>}</CardContent></Card>
                </div>
                <Card><CardHeader><CardTitle className="text-base">High-Value Approvals</CardTitle></CardHeader><CardContent>{approvalIntelligence.high_value_requests.length ? <div className="space-y-2">{approvalIntelligence.high_value_requests.map(x=><div key={x.request_id} className="flex flex-wrap items-center justify-between gap-3 rounded border p-3 text-sm"><div><div className="font-medium">{x.document_type} · {String(x.document_id)}</div><div className="text-xs text-muted-foreground">{Number(x.total_amount).toLocaleString(undefined,{maximumFractionDigits:2})} · {x.stage_count} stages · {x.approved_stage_count} approved · {x.escalated_stage_count} escalated</div></div><Badge variant={x.status==='REJECTED'?'destructive':x.status==='APPROVED'?'secondary':'outline'}>{x.status}</Badge></div>)}</div> : <p className="text-sm text-muted-foreground">No high-value approval requests match the threshold.</p>}</CardContent></Card>
                <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">Phase 17 adds management-level approval health scoring, SLA compliance, approval cycle time, rejection and escalation rates, delegation utilization, role workload, bottleneck detection, aging buckets, monthly trends and high-value approval monitoring. It is read-only and does not mutate procurement transactions.</div>
              </div> : <div className="rounded-md border p-5 text-sm text-muted-foreground">Refresh intelligence to load approval health, SLA performance, workload, bottlenecks and high-value approval monitoring.</div>}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="risk-intelligence">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5"/>Procurement Risk Intelligence</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-2">
                <div><Label>Reporting period</Label><Select value={riskDays} onValueChange={setRiskDays}><SelectTrigger className="w-[150px]"><SelectValue/></SelectTrigger><SelectContent>{['30','90','180','365'].map(x=><SelectItem key={x} value={x}>{x} days</SelectItem>)}</SelectContent></Select></div>
                <div><Label>High-value threshold</Label><Input type="number" min="0" value={riskThreshold} onChange={e=>setRiskThreshold(e.target.value)} className="w-[180px]"/></div>
                <Button onClick={()=>void run(async()=>{const r=await getProcurementRiskIntelligence(Number(riskDays),25,Number(riskThreshold));setRiskIntelligence(r);return r;},'Risk intelligence refreshed.')}>Refresh Risk Intelligence</Button>
                <span className="text-xs text-muted-foreground">Explainable, read-only control signals for approval bypass, segregation of duties, SLA breaches and concentration risk.</span>
              </div>
              {riskIntelligence ? <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-8">
                  {[['Risk Score',`${riskIntelligence.risk_score}/100`],['Risk Level',riskIntelligence.risk_level],['Approval Requests',riskIntelligence.kpis.approval_requests],['High Value',riskIntelligence.kpis.high_value_requests],['SoD Events',riskIntelligence.kpis.sod_events],['Bypass',riskIntelligence.kpis.bypass_events],['SLA Breaches',riskIntelligence.kpis.sla_breaches],['Delegated',riskIntelligence.kpis.delegated_approvals]].map(([label,value])=><Card key={String(label)}><CardContent className="p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-xl font-bold">{value}</div></CardContent></Card>)}
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card><CardHeader><CardTitle className="text-base">Risk Signals</CardTitle></CardHeader><CardContent className="space-y-2">{riskIntelligence.signals.length ? riskIntelligence.signals.map(x=><div key={x.code} className="rounded border p-3 text-sm"><div className="flex items-center justify-between gap-2"><div className="font-medium">{x.title}</div><Badge variant={x.severity==='CRITICAL'||x.severity==='HIGH'?'destructive':'secondary'}>{x.severity} · {x.count}</Badge></div><div className="mt-1 text-xs text-muted-foreground">{x.description}</div></div>) : <p className="text-sm text-muted-foreground">No material risk signals detected.</p>}</CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-base">Control Recommendations</CardTitle></CardHeader><CardContent className="space-y-2">{riskIntelligence.recommendations.map((x,i)=><div key={i} className="rounded border p-3 text-sm">{x}</div>)}</CardContent></Card>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card><CardHeader><CardTitle className="text-base">Role Risk Hotspots</CardTitle></CardHeader><CardContent className="space-y-2">{riskIntelligence.role_hotspots.length ? riskIntelligence.role_hotspots.map(x=><div key={x.role} className="rounded border p-3 text-sm"><div className="flex justify-between"><span className="font-medium">{x.role}</span><Badge variant={x.risk_points>=10?'destructive':'secondary'}>{x.risk_points} risk pts</Badge></div><div className="text-xs text-muted-foreground mt-1">{x.open_stages} open · {x.escalated_stages} escalated · {x.sla_breaches} SLA breaches · {x.sod_events} SoD events</div></div>) : <p className="text-sm text-muted-foreground">No role hotspots detected.</p>}</CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-base">Approved PO Value Concentration</CardTitle></CardHeader><CardContent className="space-y-2">{riskIntelligence.vendor_concentration.length ? riskIntelligence.vendor_concentration.map(x=><div key={String(x.vendor_id)} className="rounded border p-3 text-sm"><div className="flex justify-between"><span className="font-medium">Vendor #{x.vendor_id}</span><span>{Number(x.value_share_percent).toFixed(1)}%</span></div><div className="text-xs text-muted-foreground mt-1">{x.approved_po_count} approved POs · {Number(x.total_amount).toLocaleString(undefined,{maximumFractionDigits:2})} total approved value</div></div>) : <p className="text-sm text-muted-foreground">No approved PO concentration data.</p>}</CardContent></Card>
                </div>
                <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">Phase 18 provides live, explainable control signals. A risk signal is an investigation prompt, not proof of misconduct. Final compliance decisions should be based on the underlying approval records and organisation policy.</div>
              </div> : <div className="rounded-md border p-5 text-sm text-muted-foreground">Refresh risk intelligence to load control signals, risk hotspots and management recommendations.</div>}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="anomaly-intelligence">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5"/>Procurement Anomaly Intelligence</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-2">
                <div><Label>Reporting period</Label><Select value={anomalyDays} onValueChange={setAnomalyDays}><SelectTrigger className="w-[150px]"><SelectValue/></SelectTrigger><SelectContent>{['30','90','180','365'].map(x=><SelectItem key={x} value={x}>{x} days</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Threshold</Label><Input type="number" min="0" value={anomalyThreshold} onChange={e=>setAnomalyThreshold(e.target.value)} className="w-[180px]"/></div>
                <Button onClick={()=>void run(async()=>{const r=await getProcurementAnomalyIntelligence(Number(anomalyDays),50,Number(anomalyThreshold));setAnomalyIntelligence(r);return r;},'Anomaly intelligence refreshed.')}>Refresh Anomaly Intelligence</Button>
                <span className="text-xs text-muted-foreground">Deterministic, explainable signals for duplicate, split, price, unusual-value, frequency and after-hours patterns.</span>
              </div>
              {anomalyIntelligence ? <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-8">
                  {[['Anomaly Score',`${anomalyIntelligence.anomaly_score}/100`],['Level',anomalyIntelligence.anomaly_level],['Anomalies',anomalyIntelligence.kpis.anomalies],['Critical',anomalyIntelligence.kpis.critical],['High',anomalyIntelligence.kpis.high],['Duplicate',anomalyIntelligence.kpis.duplicate_po],['Split PO',anomalyIntelligence.kpis.split_po],['Price Variance',anomalyIntelligence.kpis.price_variance]].map(([label,value])=><Card key={String(label)}><CardContent className="p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-xl font-bold">{value}</div></CardContent></Card>)}
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card><CardHeader><CardTitle className="text-base">Detected Cases</CardTitle></CardHeader><CardContent className="space-y-2">{anomalyIntelligence.cases.length ? anomalyIntelligence.cases.map(x=><div key={`${x.code}-${x.reference_id}`} className="rounded border p-3 text-sm"><div className="flex items-center justify-between gap-2"><div className="font-medium">{x.reference_number} · {x.code}</div><Badge variant={x.severity==='CRITICAL'||x.severity==='HIGH'?'destructive':'secondary'}>{x.severity}</Badge></div><div className="mt-1 text-xs text-muted-foreground">{x.reason}{x.total_amount!=null ? ` · Amount ${Number(x.total_amount).toLocaleString(undefined,{maximumFractionDigits:2})}` : ''}</div></div>) : <p className="text-sm text-muted-foreground">No material anomaly cases detected.</p>}</CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-base">Control Recommendations</CardTitle></CardHeader><CardContent className="space-y-2">{anomalyIntelligence.recommendations.map((x,i)=><div key={i} className="rounded border p-3 text-sm">{x}</div>)}</CardContent></Card>
                </div>
                <Card><CardHeader><CardTitle className="text-base">Detection Methodology</CardTitle></CardHeader><CardContent className="space-y-2">{anomalyIntelligence.methodology.map((x,i)=><div key={i} className="rounded border p-3 text-sm text-muted-foreground">{x}</div>)}</CardContent></Card>
                <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">Phase 19 uses deterministic control heuristics over procurement records. An anomaly is an investigation prompt, not proof of fraud or misconduct. After-hours detection uses 08:00–20:00 UTC and should be aligned with the organisation's approved timezone and emergency-procurement policy.</div>
              </div> : <div className="rounded-md border p-5 text-sm text-muted-foreground">Refresh anomaly intelligence to load procurement anomaly cases, scores and control recommendations.</div>}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="supplier-performance">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5"/>Supplier Performance & Spend Intelligence</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-2">
                <div><Label>Reporting period</Label><Select value={supplierDays} onValueChange={setSupplierDays}><SelectTrigger className="w-[150px]"><SelectValue/></SelectTrigger><SelectContent>{['90','180','365','730'].map(x=><SelectItem key={x} value={x}>{x} days</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Concentration threshold %</Label><Input type="number" min="1" max="100" value={supplierConcentration} onChange={e=>setSupplierConcentration(e.target.value)} className="w-[190px]"/></div>
                <Button onClick={()=>void run(async()=>{const r=await getProcurementSupplierPerformance(Number(supplierDays),25,Number(supplierConcentration));setSupplierPerformance(r);return r;},'Supplier performance refreshed.')}>Refresh Supplier Performance</Button>
                <span className="text-xs text-muted-foreground">Read-only supplier scorecards covering spend, award rate, OTIF delivery, quality acceptance, payables and concentration.</span>
              </div>
              {supplierPerformance ? <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-7">
                  {[['Approved Spend',Number(supplierPerformance.kpis.total_spend).toLocaleString(undefined,{maximumFractionDigits:2})],['Suppliers',supplierPerformance.kpis.supplier_count],['Approved POs',supplierPerformance.kpis.approved_pos],['Award Rate',`${supplierPerformance.kpis.quote_award_rate}%`],['OTIF',`${supplierPerformance.kpis.otif_rate}%`],['Quality Acceptance',`${supplierPerformance.kpis.quality_acceptance_rate}%`],['Outstanding AP',Number(supplierPerformance.kpis.outstanding_payables).toLocaleString(undefined,{maximumFractionDigits:2})]].map(([label,value])=><Card key={String(label)}><CardContent className="p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-xl font-bold">{value}</div></CardContent></Card>)}
                </div>
                <Card><CardHeader><CardTitle className="text-base">Supplier Scorecards</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-2">Supplier</th><th className="p-2">Spend</th><th className="p-2">POs</th><th className="p-2">Award</th><th className="p-2">OTIF</th><th className="p-2">Quality</th><th className="p-2">Score</th><th className="p-2">Concentration</th></tr></thead><tbody>{supplierPerformance.suppliers.map(x=><tr key={x.vendor_id} className="border-b"><td className="p-2"><div className="font-medium">{x.vendor_name ?? `Vendor #${x.vendor_id}`}</div><div className="text-xs text-muted-foreground">{x.vendor_code ?? ''}</div></td><td className="p-2">{Number(x.spend).toLocaleString(undefined,{maximumFractionDigits:2})}</td><td className="p-2">{x.po_count}</td><td className="p-2">{x.award_rate}%</td><td className="p-2">{x.otif_rate}%</td><td className="p-2">{x.acceptance_rate}%</td><td className="p-2 font-semibold">{x.performance_score}</td><td className="p-2"><Badge variant={x.concentration_flag?'destructive':'secondary'}>{x.spend_share}%</Badge></td></tr>)}</tbody></table></div></CardContent></Card>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card><CardHeader><CardTitle className="text-base">Spend Concentration</CardTitle></CardHeader><CardContent className="space-y-2">{supplierPerformance.concentration.map(x=><div key={x.vendor_id} className="flex items-center justify-between rounded border p-3 text-sm"><span>{x.vendor_name ?? `Vendor #${x.vendor_id}`}</span><Badge variant={x.concentration_flag?'destructive':'secondary'}>{x.spend_share}%</Badge></div>)}</CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-base">Methodology</CardTitle></CardHeader><CardContent className="space-y-2">{supplierPerformance.methodology.map((x,i)=><div key={i} className="rounded border p-3 text-sm text-muted-foreground">{x}</div>)}</CardContent></Card>
                </div>
              </div> : <div className="rounded-md border p-5 text-sm text-muted-foreground">Refresh supplier performance to load vendor scorecards and spend concentration.</div>}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="exceptions">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5"/>Exception Resolution</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={()=>void run(async()=>{const r=await getProcurementExceptionQueue(50);setExceptionQueue(r);if(!selectedException&&r.exceptions.length)setSelectedException(r.exceptions[0]);return r;},'Exception queue refreshed.')}>Refresh Exception Queue</Button>
                <Badge variant={exceptionQueue?.exceptions.filter(x=>x.status!=='RESOLVED').length ? 'destructive' : 'default'}>{exceptionQueue ? `${exceptionQueue.exceptions.filter(x=>x.status!=='RESOLVED').length} open` : 'Not loaded'}</Badge>
                <span className="text-xs text-muted-foreground">Resolution records are operational dispositions; failed source controls must still be corrected and revalidated.</span>
              </div>
              {exceptionQueue && <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
                <div className="rounded-md border overflow-hidden">
                  <div className="grid grid-cols-[1.1fr_.8fr_.9fr_1.4fr] gap-2 bg-muted/50 px-3 py-2 text-xs font-medium"><span>PO</span><span>Severity</span><span>Status</span><span>Control / Exception</span></div>
                  <div className="max-h-[520px] overflow-auto">
                    {exceptionQueue.exceptions.map(ex=><button type="button" key={ex.exception_key} onClick={()=>{setSelectedException(ex);setExceptionNotes(ex.resolution_notes||'')}} className={`grid w-full grid-cols-[1.1fr_.8fr_.9fr_1.4fr] gap-2 border-t px-3 py-3 text-left text-sm ${selectedException?.exception_key===ex.exception_key?'bg-muted/50':''}`}>
                      <span className="font-medium">{ex.source_number}</span><span><Badge variant={ex.severity==='CRITICAL'?'destructive':ex.severity==='HIGH'?'destructive':'secondary'}>{ex.severity}</Badge></span><span><Badge variant={ex.status==='RESOLVED'?'default':ex.status==='IN_PROGRESS'?'secondary':'destructive'}>{ex.status}</Badge></span><span><div className="font-medium">{ex.control_id}</div><div className="text-xs text-muted-foreground line-clamp-2">{ex.detail}</div></span>
                    </button>)}
                    {exceptionQueue.exceptions.length===0 && <div className="p-5 text-sm text-muted-foreground">No current UAT exceptions were detected.</div>}
                  </div>
                </div>
                {selectedException ? <Card className="h-fit"><CardHeader><CardTitle className="text-base">Resolve {selectedException.control_id}</CardTitle></CardHeader><CardContent className="space-y-3">
                  <div className="text-sm"><div className="font-medium">{selectedException.source_number}</div><div className="text-xs text-muted-foreground">{selectedException.detail}</div></div>
                  <div className="grid grid-cols-2 gap-2 text-xs"><div>Severity<br/><b>{selectedException.severity}</b></div><div>Current status<br/><b>{selectedException.status}</b></div></div>
                  <Textarea value={exceptionNotes} onChange={e=>setExceptionNotes(e.target.value)} placeholder="Document root cause, corrective action or approval reference..." />
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" disabled={selectedException.status==='RESOLVED'} onClick={()=>void run(async()=>{const r=await resolveProcurementException({exceptionKey:selectedException.exception_key,status:'IN_PROGRESS',resolutionNotes:exceptionNotes});const q=await getProcurementExceptionQueue(50);setExceptionQueue(q);setSelectedException(q.exceptions.find(x=>x.exception_key===selectedException.exception_key)||null);return r;},'Exception marked in progress.')}>Mark In Progress</Button>
                    <Button disabled={selectedException.status==='RESOLVED'} onClick={()=>void run(async()=>{if(!exceptionNotes.trim())throw new Error('Resolution notes are required.');const r=await resolveProcurementException({exceptionKey:selectedException.exception_key,status:'RESOLVED',resolutionNotes:exceptionNotes});const q=await getProcurementExceptionQueue(50);setExceptionQueue(q);setSelectedException(q.exceptions.find(x=>x.exception_key===selectedException.exception_key)||null);return r;},'Exception marked resolved.')}>Resolve Exception</Button>
                    {selectedException.status==='RESOLVED' && <Button variant="outline" onClick={()=>void run(async()=>{const r=await resolveProcurementException({exceptionKey:selectedException.exception_key,status:'REOPENED',resolutionNotes:exceptionNotes});const q=await getProcurementExceptionQueue(50);setExceptionQueue(q);setSelectedException(q.exceptions.find(x=>x.exception_key===selectedException.exception_key)||null);return r;},'Exception reopened.')}>Reopen</Button>}
                  </div>
                  <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">Resolving this record does not approve, post, reconcile, capitalize, or otherwise alter the PO. After correcting the source transaction, run E2E UAT again.</div>
                </CardContent></Card> : <div className="rounded-md border p-5 text-sm text-muted-foreground">Select an exception to manage its operational resolution.</div>}
              </div>}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="approvals"><div className="space-y-4">
        <Card><CardHeader><CardTitle>Multi-Step Procurement Approval Orchestration</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2"><Button onClick={()=>void run(async()=>{const q=await getProcurementApprovalQueue(100);setApprovalQueue(q);return q;},'Approval queue refreshed.')}>Refresh Approval Queue</Button><Button variant="outline" onClick={()=>void run(()=>escalateDueProcurementApprovals(100),'Due approval stages escalated.')}>Run SLA Escalation</Button></div>
          <div className="rounded-md border p-3 text-xs text-muted-foreground">Phase 15 approvals execute sequential policy stages. A PO cannot transition to APPROVED while an ENFORCE policy has an incomplete approval request. Rejections close the request; resubmission creates a new approval workflow.</div>
          <Card><CardHeader><CardTitle>Approval Inbox</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={()=>void run(async()=>{setInboxLoading(true);try{return await getProcurementApprovalInbox(100).then(setApprovalInbox);}finally{setInboxLoading(false);}},'Approval inbox refreshed.')} disabled={inboxLoading}>{inboxLoading?'Refreshing...':'Refresh Inbox'}</Button>
              <Button variant="outline" onClick={()=>void run(async()=>{const r=await generateProcurementApprovalNotifications(100);const q=await getProcurementApprovalInbox(100);setApprovalInbox(q);return r;},'Operational notifications generated.')}>Generate Operational Notifications</Button>
              <Button variant="outline" disabled={!approvalInbox?.summary.unread_notifications} onClick={()=>void run(async()=>{const n=await markAllProcurementApprovalNotificationsRead();const q=await getProcurementApprovalInbox(100);setApprovalInbox(q);return n;},'All approval notifications marked read.')}>Mark All Read</Button>
            </div>
            {approvalInbox && <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Pending My Role</div><div className="text-2xl font-bold">{approvalInbox.summary.pending_count}</div></CardContent></Card>
                <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Overdue</div><div className="text-2xl font-bold text-destructive">{approvalInbox.summary.overdue_count}</div></CardContent></Card>
                <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Due Within 24h</div><div className="text-2xl font-bold">{approvalInbox.summary.due_24h_count}</div></CardContent></Card>
                <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Unread Notifications</div><div className="text-2xl font-bold">{approvalInbox.summary.unread_notifications}</div></CardContent></Card>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card><CardHeader><CardTitle className="text-base">My Approval Worklist</CardTitle></CardHeader><CardContent className="space-y-2">{approvalInbox.stages.length ? approvalInbox.stages.map((x:any)=><div key={String(x.id)} className="rounded-md border p-3"><div className="flex items-center justify-between gap-2"><div className="font-medium">PO · {String(x.doc_number??x.document_id)} · Stage {x.sequence_no}</div><Badge variant={x.sla_state==='OVERDUE'||x.status==='ESCALATED'?'destructive':x.sla_state==='DUE_SOON'?'secondary':'outline'}>{x.status==='ESCALATED'?'ESCALATED':x.sla_state}</Badge></div><div className="mt-1 text-xs text-muted-foreground">{x.assigned_role} · due {String(x.due_at).slice(0,19)} · age {Number(x.age_hours??0).toFixed(1)}h{x.delegated_for_actor?' · delegated to you':''}</div><div className="mt-2 flex gap-2"><Button size="sm" onClick={()=>void run(async()=>{const r=await decideProcurementApprovalStage(String(x.id),'APPROVED','Approved from my approval inbox.');const q=await getProcurementApprovalInbox(100);setApprovalInbox(q);return r;},'Approval stage approved.')}>Approve</Button><Button size="sm" variant="outline" onClick={()=>void run(async()=>{const r=await decideProcurementApprovalStage(String(x.id),'REJECTED','Rejected from my approval inbox.');const q=await getProcurementApprovalInbox(100);setApprovalInbox(q);return r;},'Approval request rejected.')}>Reject</Button></div></div>) : <p className="text-sm text-muted-foreground">No approval stages are assigned to your role or active delegation.</p>}</CardContent></Card>
                <Card><CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader><CardContent className="space-y-2">{approvalInbox.notifications.length ? approvalInbox.notifications.slice(0,20).map((x:any)=><div key={String(x.id)} className={"rounded-md border p-3 "+(x.read_at?'opacity-60':'bg-muted/30')}><div className="flex items-center justify-between gap-2"><div className="font-medium">{x.title}</div><Badge variant={x.severity==='CRITICAL'?'destructive':x.severity==='WARNING'?'secondary':'outline'}>{x.notification_type}</Badge></div><div className="mt-1 text-sm">{x.message}</div><div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>{String(x.created_at).slice(0,19)}{x.doc_number?` · ${x.doc_number}`:''}</span>{!x.read_at&&<Button size="sm" variant="ghost" onClick={()=>void run(async()=>{await markProcurementApprovalNotificationRead(String(x.id));const q=await getProcurementApprovalInbox(100);setApprovalInbox(q);return q;},'Notification marked read.')}>Mark Read</Button>}</div></div>) : <p className="text-sm text-muted-foreground">No procurement approval notifications.</p>}</CardContent></Card>
              </div>
            </>}
            <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">Phase 16 adds role-aware inbox routing, direct user notifications, active delegation visibility, SLA aging, due-soon alerts, escalation alerts and read-state tracking. Notification generation is idempotent within the operational window.</div>
          </CardContent></Card>
          {approvalQueue && <div className="space-y-4">
            <Card><CardHeader><CardTitle className="text-base">Active Approval Stages</CardTitle></CardHeader><CardContent className="space-y-2">{approvalQueue.stages.length ? approvalQueue.stages.map((x:any)=><div key={String(x.id)} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"><div><div className="font-medium">PO · {String(x.doc_number??x.document_id)} · Stage {x.sequence_no}</div><div className="text-xs text-muted-foreground">{x.assigned_role} · due {String(x.due_at).slice(0,19)} · {Number(x.total_amount??0).toFixed(2)}</div><Badge variant={x.status==='ESCALATED'?'destructive':'secondary'}>{x.status}</Badge></div><div className="flex gap-2"><Button size="sm" onClick={()=>void run(async()=>decideProcurementApprovalStage(String(x.id),'APPROVED','Approved from procurement orchestration queue.'),'Approval stage approved.')}>Approve Stage</Button><Button size="sm" variant="outline" onClick={()=>void run(async()=>decideProcurementApprovalStage(String(x.id),'REJECTED','Rejected from procurement orchestration queue.'),'Approval request rejected.')}>Reject</Button></div></div>) : <p className="text-sm text-muted-foreground">No active multi-step approval stages.</p>}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Approval Requests</CardTitle></CardHeader><CardContent className="space-y-2">{approvalQueue.requests.length ? approvalQueue.requests.map((x:any)=><div key={String(x.id)} className="rounded-md border p-3"><div className="font-medium">{String(x.doc_number??x.document_id)} · {String(x.status)}</div><div className="text-xs text-muted-foreground">Submitted {String(x.submitted_at).slice(0,19)} · Amount {Number(x.total_amount??0).toFixed(2)}</div></div>) : <p className="text-sm text-muted-foreground">No pending approval requests.</p>}</CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Approval History</CardTitle></CardHeader><CardContent className="space-y-2">{approvalQueue.history.slice(0,20).map((x:any)=><div key={String(x.id)} className="rounded border p-2 text-sm"><div className="font-medium">{x.action} · {String(x.created_at).slice(0,19)}</div><div className="text-xs text-muted-foreground">{x.remarks??'No remarks'}</div></div>)}</CardContent></Card>
          </div>}
          </CardContent></Card>
        <Card><CardHeader><CardTitle>Submit PO for Orchestrated Approval</CardTitle></CardHeader><CardContent className="flex flex-wrap items-end gap-2"><div className="min-w-[280px]"><Label>Purchase Order</Label><Select value={poId} onValueChange={setPoId}><SelectTrigger><SelectValue placeholder="Select a PO"/></SelectTrigger><SelectContent>{pos.filter(x=>!['APPROVED','CLOSED','CANCELLED'].includes(String(x.status))).map(x=><SelectItem key={x.id} value={x.id}>{x.doc_number} · {Number(x.total_amount??0).toFixed(2)} · {x.status}</SelectItem>)}</SelectContent></Select></div><Button onClick={()=>void run(async()=>{if(!poId) throw new Error('Select a purchase order.');const r=await submitProcurementApprovalRequest('PO',poId);const q=await getProcurementApprovalQueue(100);setApprovalQueue(q);return r;},'PO submitted to multi-step approval.')}>Submit for Approval</Button></CardContent></Card>
        <Card><CardHeader><CardTitle>Legacy Document Approval Queue</CardTitle></CardHeader><CardContent className="space-y-2">{[...pos.map(x=>({type:'PO',x})),...quotes.map(x=>({type:'QUOTE',x})),...grns.map(x=>({type:'GRN',x})),...invoices.map(x=>({type:'INVOICE',x}))].filter(({x})=>x.status==='SUBMITTED').slice(0,20).map(({type,x})=><div key={x.id} className="flex items-center justify-between gap-3 rounded-md border p-3"><div><div className="font-medium">{type} · {x.doc_number}</div><div className="text-xs text-muted-foreground">{x.total_amount ? Number(x.total_amount).toFixed(2):''}</div></div><div className="flex gap-2"><Button size="sm" onClick={()=>void run(()=>decideProcurementApproval(type as any,x.id,'APPROVED'),'Document approved.')}>Approve</Button><Button size="sm" variant="outline" onClick={()=>void run(()=>decideProcurementApproval(type as any,x.id,'REJECTED','Rejected from procurement console.'),'Document rejected.')}>Reject</Button></div></div>)}{![...pos,...quotes,...grns,...invoices].some(x=>x.status==='SUBMITTED')&&<p className="text-sm text-muted-foreground">No submitted legacy procurement documents are waiting for approval.</p>}</CardContent></Card>
      </div></TabsContent>

      <TabsContent value="policy">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5"/>Procurement Policy & Delegation of Authority</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 items-end">
                <div><Label>Policy code</Label><Input value={policyCode} onChange={e=>setPolicyCode(e.target.value)} /></div>
                <div><Label>Version</Label><Input type="number" min="1" value={policyVersion} onChange={e=>setPolicyVersion(e.target.value)} /></div>
                <div><Label>Mode</Label><Select value={policyMode} onValueChange={v=>setPolicyMode(v as 'REPORT_ONLY'|'ENFORCE')}><SelectTrigger className="w-[150px]"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="ENFORCE">ENFORCE</SelectItem><SelectItem value="REPORT_ONLY">REPORT_ONLY</SelectItem></SelectContent></Select></div>
                <div className="min-w-[260px]"><Label>Notes</Label><Input value={policyNotes} onChange={e=>setPolicyNotes(e.target.value)} /></div>
                <Button onClick={()=>void run(async()=>{const p=await createProcurementPolicyVersion({policyCode,versionNo:Number(policyVersion),enforcementMode:policyMode,notes:policyNotes});setRulePolicyId(p.id);const s=await getProcurementPolicySnapshot();setPolicySnapshot(s);return p;},'Draft policy version created.')}>Create Draft Version</Button>
                <Button variant="outline" onClick={()=>void run(async()=>{const s=await getProcurementPolicySnapshot();setPolicySnapshot(s);return s;},'Policy snapshot refreshed.')}>Refresh Policy</Button>
              </div>
              <div className="rounded-md border p-3 text-xs text-muted-foreground">Policy versions are immutable governance records in practice: create a new version rather than rewriting an effective policy. Only administrative roles can create or change policy configuration.</div>
              {policySnapshot && <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Active Policies</div><div className="text-2xl font-bold mt-1">{policySnapshot.active_policies.length}</div></CardContent></Card>
                  <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Approval Rules</div><div className="text-2xl font-bold mt-1">{policySnapshot.rules.length}</div></CardContent></Card>
                  <Card><CardContent className="p-3"><div className="text-xs text-muted-foreground">Active Delegations</div><div className="text-2xl font-bold mt-1">{policySnapshot.delegations.length}</div></CardContent></Card>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card><CardHeader><CardTitle className="text-base">Approval Rule</CardTitle></CardHeader><CardContent className="space-y-3">
                    <div><Label>Policy version ID</Label><Input value={rulePolicyId} onChange={e=>setRulePolicyId(e.target.value)} placeholder="Use the created draft version ID" /></div>
                    <div className="grid grid-cols-2 gap-2"><div><Label>Minimum amount</Label><Input type="number" min="0" value={ruleMin} onChange={e=>setRuleMin(e.target.value)} /></div><div><Label>Maximum amount</Label><Input type="number" min="0" value={ruleMax} onChange={e=>setRuleMax(e.target.value)} placeholder="Blank = no upper limit" /></div></div>
                    <div className="grid grid-cols-2 gap-2"><div><Label>Required role</Label><Input value={ruleRole} onChange={e=>setRuleRole(e.target.value)} /></div><div><Label>SLA hours</Label><Input type="number" min="1" value={ruleSla} onChange={e=>setRuleSla(e.target.value)} /></div></div>
                    <div><Label>Escalation role</Label><Input value={ruleEscalation} onChange={e=>setRuleEscalation(e.target.value)} /></div>
                    <Button onClick={()=>void run(async()=>createProcurementPolicyRule({policyVersionId:rulePolicyId,minAmount:Number(ruleMin),maxAmount:ruleMax.trim()?Number(ruleMax):null,requiredRole:ruleRole.trim(),slaHours:Number(ruleSla),escalationRole:ruleEscalation.trim()||null}),'Approval rule created.')}>Add Approval Rule</Button>
                  </CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-base">Role Delegation</CardTitle></CardHeader><CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2"><div><Label>Source role</Label><Input value={delegSourceRole} onChange={e=>setDelegSourceRole(e.target.value)} /></div><div><Label>Delegate role</Label><Input value={delegTargetRole} onChange={e=>setDelegTargetRole(e.target.value)} /></div></div>
                    <div><Label>Maximum delegated amount</Label><Input type="number" min="0" value={delegMax} onChange={e=>setDelegMax(e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-2"><div><Label>Effective from</Label><Input type="datetime-local" value={delegFrom} onChange={e=>setDelegFrom(e.target.value)} /></div><div><Label>Effective to</Label><Input type="datetime-local" value={delegTo} onChange={e=>setDelegTo(e.target.value)} /></div></div>
                    <div><Label>Reason</Label><Input value={delegReason} onChange={e=>setDelegReason(e.target.value)} /></div>
                    <Button onClick={()=>void run(async()=>createProcurementDelegation({policyVersionId:rulePolicyId||null,sourceRole:delegSourceRole.trim()||null,delegateRole:delegTargetRole.trim()||null,maxAmount:Number(delegMax),effectiveFrom:new Date(delegFrom).toISOString(),effectiveTo:new Date(delegTo).toISOString(),reason:delegReason}),'Delegation created.')}>Create Delegation</Button>
                  </CardContent></Card>
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                  <Card><CardHeader><CardTitle className="text-base">Active Policy Versions</CardTitle></CardHeader><CardContent className="space-y-2">{policySnapshot.active_policies.map((x:any)=><div key={String(x.id)} className="rounded border p-2 text-sm"><div className="font-medium">{x.policy_code} · v{x.version_no}</div><div className="text-xs text-muted-foreground">{x.enforcement_mode} · effective {String(x.effective_from).slice(0,19)}</div></div>)}</CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-base">Configured Rules</CardTitle></CardHeader><CardContent className="space-y-2">{policySnapshot.rules.slice(0,10).map((x:any)=><div key={String(x.id)} className="rounded border p-2 text-sm"><div className="font-medium">{x.document_type} · {x.required_role}</div><div className="text-xs text-muted-foreground">{x.min_amount} – {x.max_amount ?? '∞'} · SLA {x.sla_hours}h</div></div>)}</CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-base">Delegations</CardTitle></CardHeader><CardContent className="space-y-2">{policySnapshot.delegations.slice(0,10).map((x:any)=><div key={String(x.id)} className="rounded border p-2 text-sm"><div className="font-medium">{x.source_role ?? 'User'} → {x.delegate_role ?? 'User'}</div><div className="text-xs text-muted-foreground">Up to {x.max_amount ?? '∞'} · expires {String(x.effective_to).slice(0,19)}</div></div>)}</CardContent></Card>
                </div>
              </div>}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="action-center">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5"/>Procurement Action Center & Continuous Monitoring</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-2">
            <div><Label>Signal period</Label><Select value={actionDays} onValueChange={setActionDays}><SelectTrigger className="w-[140px]"><SelectValue/></SelectTrigger><SelectContent>{['7','30','90','365'].map(x=><SelectItem key={x} value={x}>{x} days</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Due-soon window</Label><Select value={actionDueHours} onValueChange={setActionDueHours}><SelectTrigger className="w-[150px]"><SelectValue/></SelectTrigger><SelectContent>{['12','24','48','72'].map(x=><SelectItem key={x} value={x}>{x} hours</SelectItem>)}</SelectContent></Select></div>
            <Button onClick={()=>void run(async()=>{await refreshProcurementActionCenter(Number(actionDays),Number(actionDueHours),100);const r=await getProcurementActionCenter(100);setActionCenter(r);return r;},'Action Center refreshed.')}>Refresh Action Center</Button>
            <span className="text-xs text-muted-foreground">Signals become accountable work items. Resolution never changes the source procurement or accounting record.</span>
          </div>
          {actionCenter ? <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">{[['Open',actionCenter.kpis.open_count],['Acknowledged',actionCenter.kpis.acknowledged_count],['In Progress',actionCenter.kpis.in_progress_count],['Overdue',actionCenter.kpis.overdue_count],['Critical',actionCenter.kpis.critical_count],['Unassigned',actionCenter.kpis.unassigned_count]].map(([label,value])=><Card key={String(label)}><CardContent className="p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-xl font-bold">{value}</div></CardContent></Card>)}</div>
            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <Card><CardHeader><CardTitle className="text-base">Prioritized Work Queue</CardTitle></CardHeader><CardContent className="space-y-2">{actionCenter.items.length ? actionCenter.items.map(x=><button key={x.id} type="button" onClick={()=>{setSelectedAction(x);setActionNotes(x.resolution_notes??'');setActionEvidence(x.evidence_reference??'');setActionOwner(x.owner_user_id??'');}} className="w-full rounded border p-3 text-left hover:bg-muted/30"><div className="flex flex-wrap items-center justify-between gap-2"><div className="font-medium">{x.title}</div><div className="flex gap-2"><Badge variant={x.severity==='CRITICAL'||x.severity==='HIGH'?'destructive':'secondary'}>{x.severity}</Badge><Badge variant="outline">{x.status}</Badge></div></div><div className="mt-1 text-xs text-muted-foreground">{x.source_reference ?? x.source_type} · {x.action_code}</div><div className="mt-1 text-sm">{x.description}</div><div className="mt-2 text-xs text-muted-foreground">Due: {x.due_at ? new Date(x.due_at).toLocaleString() : '—'} · Owner: {x.owner_user_id ?? 'Unassigned'}</div></button>) : <p className="text-sm text-muted-foreground">No action items. Refresh the Action Center to discover current signals.</p>}</CardContent></Card>
              <Card><CardHeader><CardTitle className="text-base">Disposition</CardTitle></CardHeader><CardContent>{selectedAction ? <div className="space-y-3"><div><div className="font-medium">{selectedAction.title}</div><div className="text-xs text-muted-foreground mt-1">{selectedAction.signal_key}</div></div><div><Label>Status</Label><Select value={selectedAction.status} onValueChange={v=>setSelectedAction({...selectedAction,status:v as ProcurementActionItem['status']})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{['OPEN','ACKNOWLEDGED','IN_PROGRESS','RESOLVED','CLOSED','REOPENED'].map(x=><SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select></div><div><Label>Owner user ID</Label><Input value={actionOwner} onChange={e=>setActionOwner(e.target.value)} placeholder="Optional auth user UUID"/></div><div><Label>Evidence reference</Label><Input value={actionEvidence} onChange={e=>setActionEvidence(e.target.value)} placeholder="Document, ticket, evidence URL or reference"/></div><div><Label>Resolution / investigation notes</Label><Textarea value={actionNotes} onChange={e=>setActionNotes(e.target.value)} placeholder="Record what was reviewed and what was decided."/></div><Button onClick={()=>void run(async()=>{await updateProcurementActionItem({actionId:selectedAction.id,status:selectedAction.status,ownerUserId:actionOwner.trim()||null,resolutionNotes:actionNotes,evidenceReference:actionEvidence});const r=await getProcurementActionCenter(100);setActionCenter(r);setSelectedAction(null);return r;},'Action disposition saved.')}>Save Disposition</Button><div className="rounded border bg-muted/30 p-3 text-xs text-muted-foreground">Operational control only: this action item does not approve, reject, alter, post, reconcile or close the underlying procurement transaction.</div></div> : <p className="text-sm text-muted-foreground">Select a work item to acknowledge, assign, investigate, resolve or close it.</p>}</CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle className="text-base">Continuous Monitoring Boundary</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Phase 21 turns Phase 17–20 intelligence and unresolved control exceptions into accountable work. Signals are refreshed on demand and can later be scheduled. Evidence, ownership, status and resolution notes are retained for auditability; source transactions remain governed by their existing workflows.</CardContent></Card>
          </div> : <p className="text-sm text-muted-foreground">Refresh the Action Center to build the operational queue from current approval SLA, anomaly, supplier concentration and exception signals.</p>}
        </CardContent></Card>
      </TabsContent>

      <TabsContent value="governance">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5"/>Procurement Governance & Compliance</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div><Label>Reporting period (days)</Label><Input type="number" min="1" value={governanceDays} onChange={e=>setGovernanceDays(e.target.value)}/></div>
            <div><Label>PO approval review threshold</Label><Input type="number" min="0" value={governanceThreshold} onChange={e=>setGovernanceThreshold(e.target.value)}/></div>
            <div><Label>Vendor concentration threshold %</Label><Input type="number" min="1" max="100" value={governanceConcentration} onChange={e=>setGovernanceConcentration(e.target.value)}/></div>
            <div className="flex items-end"><Button onClick={()=>void run(async()=>{const r=await getProcurementGovernance(Number(governanceDays)||90,Number(governanceThreshold)||0,Number(governanceConcentration)||50,25);setGovernance(r);return r;},'Governance dashboard refreshed.')}>Run Governance Review</Button></div>
          </div>
          {!governance ? <p className="text-sm text-muted-foreground">Run the governance review to inspect audit integrity, approval policy signals, segregation-of-duties flags and vendor concentration.</p> : <>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">{[["Audit Events",governance.governance_kpis.audit_events],["Actorless Audit",governance.governance_kpis.actorless_audit_events],["Delete Actions",governance.governance_kpis.delete_actions],["SOD Flags",governance.governance_kpis.sod_same_actor_flags],["Policy Violations",governance.governance_kpis.policy_violation_count]].map(([label,value])=><Card key={String(label)}><CardContent className="p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-xl font-bold">{value}</div></CardContent></Card>)}</div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card><CardHeader><CardTitle className="text-base">Policy Violations</CardTitle></CardHeader><CardContent className="space-y-2">{governance.policy_violations.length ? governance.policy_violations.map(x=><div key={x.policy_id} className="flex items-start justify-between gap-3 rounded border p-3"><div><div className="font-medium">{x.policy_id}</div><div className="text-xs text-muted-foreground">{x.detail}</div></div><Badge variant={x.severity==='CRITICAL'||x.severity==='HIGH'?'destructive':'secondary'}>{x.count}</Badge></div>) : <p className="text-sm text-muted-foreground">No policy violations detected in the selected period.</p>}</CardContent></Card>
              <Card><CardHeader><CardTitle className="text-base">High-Value PO Review</CardTitle></CardHeader><CardContent>{governance.high_value_purchase_orders.length ? <div className="space-y-2">{governance.high_value_purchase_orders.map(x=><div key={x.po_id} className="flex items-center justify-between rounded border p-3 text-sm"><div><div className="font-medium">{x.po_number} · Vendor #{x.vendor_id}</div><div className="text-xs text-muted-foreground">{x.status} · {Number(x.total_amount).toLocaleString(undefined,{maximumFractionDigits:2})}</div></div><Badge variant={x.approval_state_ok?'secondary':'destructive'}>{x.approval_state_ok?'OK':'REVIEW'}</Badge></div>)}</div> : <p className="text-sm text-muted-foreground">No high-value POs match the selected threshold.</p>}</CardContent></Card>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card><CardHeader><CardTitle className="text-base">Segregation of Duties</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{governance.governance_kpis.sod_same_actor_flags}</p><p className="text-xs text-muted-foreground mt-1">Cases where the same audited actor created a PO and later changed it to APPROVED. This is a review signal, not an automatic rejection.</p></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-base">Vendor Concentration</CardTitle></CardHeader><CardContent>{governance.vendor_concentration.length ? <div className="space-y-2">{governance.vendor_concentration.slice(0,10).map(x=><div key={x.vendor_id} className="flex items-center justify-between rounded border p-3 text-sm"><span>Vendor #{x.vendor_id} · {x.po_count} POs</span><Badge variant={x.concentration_flag?'destructive':'secondary'}>{Number(x.spend_pct).toFixed(1)}%</Badge></div>)}</div> : <p className="text-sm text-muted-foreground">No vendor spend found.</p>}</CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle className="text-base">Governance Boundary</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Policy parameters are reporting thresholds only. This phase does not approve, reject, repair, post, reconcile, override or mutate procurement/accounting transactions. Findings require the existing controlled workflow and audit trail.</CardContent></Card>
          </>}
        </CardContent></Card>
      </TabsContent>
    </Tabs>
  </div>;
}

function RfxPicker({ onSelect }: { onSelect: (id: string) => void }) {
  const [rfxs,setRfxs]=useState<any[]>([]);
  useEffect(()=>{void supabase.from('proc_rfx').select('*').order('created_at',{ascending:false}).then(({data})=>setRfxs(data??[]));},[]);
  return <>{rfxs.map(r=><SelectItem key={r.id} value={r.id}>{r.doc_number} · {r.rfx_type}</SelectItem>)}</>;
}
