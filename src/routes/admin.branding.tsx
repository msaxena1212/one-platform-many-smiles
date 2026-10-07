import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  Trash2,
  Building2,
  PenTool,
  Stamp,
  ShieldCheck,
  Receipt,
  FileCheck,
  Save,
  RotateCcw,
  Sparkles,
  Download,
  Info,
  Sliders,
  Maximize2,
  Key,
  Layers,
  FileSpreadsheet,
  Check,
  Edit3,
  Languages,
  ArrowLeftRight,
  MoveHorizontal,
  Expand,
  Minimize,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getDocumentBranding,
  saveDocumentBranding,
  type DocumentBranding,
  type SubmoduleDocBranding,
} from "@/lib/document-branding";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/branding")({
  head: () => ({ meta: [{ title: "Document Branding Studio & Submodules — Admin" }] }),
  component: DocumentBrandingPage,
});

type SubmoduleKey = "receiptVoucher" | "tokenHandover" | "acknowledgementReceipt" | "leaseAgreement";

// Arabic translation dictionary for realtime instant translations
const ARABIC_DICTIONARY: Record<string, string> = {
  "OFFICIAL RECEIPT VOUCHER": "سند قبض رسمي معتمد",
  "Payment & Rent Collection Voucher": "سند تحصيل الإيجار والدفعات المالية",
  "TOKEN & KEY HANDOVER CERTIFICATE": "محضر تسليم المفاتيح وعربون الحجز",
  "Unit Handover & Security Token Confirmation": "إقرار استلام الوحدة السكنية وبطاقات الدخول",
  "PAYMENT & TOKEN ACKNOWLEDGEMENT RECEIPT": "إيصال إقرار واستلام دفعة الحجز",
  "Official Transaction & Security Booking Acknowledgment": "إقرار رسمي باستلام عربون حجز الوحدة العقارية",
  "RESIDENTIAL & COMMERCIAL LEASE AGREEMENT": "عقد إيجار سكني وتجاري موحد",
  "Tenancy Contract & Legal Terms": "عقد إيجار عقاري وشروط التعاقد القانونية",
  "Al Ameen Real Estate": "الامين للعقارات",
  "Al Ameen Real Estate W.L.L": "شركة الامين للعقارات ذ.م.م",
  "Grand Hamad Avenue, Building 42, Floor 7, Doha, State of Qatar": "شارع حمد الكبير، مبنى 42، الطابق 7، الدوحة، دولة قطر",
  "Jithin Abdul Latheef": "جيثين عبد اللطيف",
  "General Manager": "المدير العام",
  "Received with thanks payment against unit lease & maintenance.": "تم استلام المبلغ أعلاه مع الشكر والتقدير لقاء الإيجار وخدمات الصيانة.",
  "The tenant confirms receipt of property keys, access cards, and condition checklist.": "يقر المستأجر باستلام جميع مفاتيح العقار وبطاقات الدخول بحالة ممتازة وفق جدول المعاينة.",
  "Acknowledgment of received security deposit, token payment, and reservation clearance.": "إقرار باستلام مبلغ التأمين وعربون الحجز المبدئي لحين توقيع العقد النهائي.",
  "Standard Tenancy Contract entered between Lessor and Lessee.": "عقد إيجار رسمي موحد مبرم بين الطرف الأول (المؤجر) والطرف الثاني (المستأجر).",
  "This receipt is computer generated and acknowledged. Valid subject to realization of cheque / payment.": "هذا الإيصال صادر إلكترونياً ويعد معتمداً بعد التحصيل الفعلي للشيك أو الدفعة البنكية.",
  "The tenant accepts keys in good condition. All security tokens must be returned upon lease conclusion.": "يتحمل المستأجر مسؤولية المحافظة على المفاتيح والبطاقات وإعادتها عند انتهاء فترة التعاقد.",
  "Payment and token handover acknowledgement is issued under official company policies.": "يخضع إقرار الحجز واستلام العربون للسياسات واللوائح المعتمدة لدى الشركة.",
  "Terms and conditions are governed by Law No. 4 of 2008 concerning Property Leasing in the State of Qatar.": "تخضع جميع بنود هذا العقد لأحكام القانون رقم (4) لسنة 2008 بشأن إيجار العقارات في دولة قطر ولجنة فض المنازعات الإيجارية.",
  "Al Ameen Real Estate W.L.L • Registered in the State of Qatar • CR-90821-QA": "الامين للعقارات ذ.م.م • مسجلة في دولة قطر • سجل تجاري: CR-90821-QA",
};

// MyMemory free translation API (no key required, 5000 chars/day free tier)
async function translateTextToAr(text: string): Promise<string> {
  if (!text || !text.trim()) return "";
  // Check dictionary first for instant zero-latency result
  if (ARABIC_DICTIONARY[text.trim()]) return ARABIC_DICTIONARY[text.trim()];
  try {
    const encoded = encodeURIComponent(text.trim());
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encoded}&langpair=en|ar`
    );
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (translated && translated !== text && !translated.toLowerCase().startsWith("invalid")) {
      return translated;
    }
    return ARABIC_DICTIONARY[text] || text;
  } catch {
    return ARABIC_DICTIONARY[text] || text;
  }
}

function translateToAr(text: string): string {
  if (!text) return "";
  return ARABIC_DICTIONARY[text] || text;
}

function DocumentBrandingPage() {
  const [branding, setBranding] = useState<DocumentBranding>(getDocumentBranding());
  const [activeTab, setActiveTab] = useState<string>("global");
  const [previewDocType, setPreviewDocType] = useState<SubmoduleKey>("receiptVoucher");
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [translatingKey, setTranslatingKey] = useState<string | null>(null);
  // Track which individual fields are being translated (field-level spinner)
  const [translatingField, setTranslatingField] = useState<string | null>(null);

  // File upload input refs
  const globalHeaderFileInputRef = useRef<HTMLInputElement>(null);
  const globalSignatureFileInputRef = useRef<HTMLInputElement>(null);
  const globalStampFileInputRef = useRef<HTMLInputElement>(null);
  const submoduleBannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBranding(getDocumentBranding());
  }, []);

  // Per-field translate button handler
  const translateField = async (
    subKey: SubmoduleKey,
    srcField: keyof SubmoduleDocBranding,
    destField: keyof SubmoduleDocBranding
  ) => {
    const sub = branding.submodules[subKey];
    const text = sub[srcField] as string;
    if (!text) { toast.warning("Nothing to translate — source field is empty."); return; }
    const key = `${subKey}.${String(srcField)}`;
    setTranslatingField(key);
    try {
      const result = await translateTextToAr(text);
      updateSubmodule(subKey, { [destField]: result } as Partial<SubmoduleDocBranding>);
      toast.success("Translated to Arabic ✓");
    } catch {
      toast.error("Translation failed. Check your internet connection.");
    } finally {
      setTranslatingField(null);
    }
  };

  const handleGlobalFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "headerImageUrl" | "signatureImageUrl" | "stampImageUrl"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated = { ...branding, [field]: dataUrl };
      setBranding(updated);
      saveDocumentBranding({ [field]: dataUrl });
      toast.success(
        `${
          field === "headerImageUrl"
            ? "Global Header Letterhead"
            : field === "signatureImageUrl"
            ? "Global Authorized Signature"
            : "Global Company Stamp"
        } uploaded successfully!`
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSubmoduleBannerUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    subKey: SubmoduleKey
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, SVG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateSubmodule(subKey, { bannerImageUrl: dataUrl });
      toast.success(`Custom banner uploaded for ${getSubmoduleLabel(subKey)}!`);
    };
    reader.readAsDataURL(file);
  };

  const updateSubmodule = (subKey: SubmoduleKey, updates: Partial<SubmoduleDocBranding>) => {
    setBranding((prev) => {
      const next = {
        ...prev,
        submodules: {
          ...prev.submodules,
          [subKey]: {
            ...prev.submodules[subKey],
            ...updates,
          },
        },
      };
      saveDocumentBranding(next);
      return next;
    });
  };

  const triggerRealtimeTranslate = async (subKey: SubmoduleKey) => {
    setTranslatingKey(subKey);
    const sub = branding.submodules[subKey];
    try {
      const [title, subtitle, notes, terms, footer] = await Promise.all([
        translateTextToAr(sub.documentTitle),
        translateTextToAr(sub.documentSubtitle),
        translateTextToAr(sub.notes),
        translateTextToAr(sub.termsAndConditions),
        translateTextToAr(sub.footerNote),
      ]);
      updateSubmodule(subKey, {
        documentTitleAr: title,
        documentSubtitleAr: subtitle,
        notesAr: notes,
        termsAndConditionsAr: terms,
        footerNoteAr: footer,
        languageMode: "bilingual",
      });
      toast.success(`All fields translated to Arabic for ${getSubmoduleLabel(subKey)}!`);
    } catch {
      toast.error("Translation failed. Check your internet connection.");
    } finally {
      setTranslatingKey(null);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      saveDocumentBranding(branding);
      toast.success("Document branding & template settings saved successfully!");
    } catch (e: any) {
      toast.error("Failed to save settings: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all branding, banners, and legal terms back to factory default?")) {
      localStorage.removeItem("pms_organization_document_branding_v3");
      localStorage.removeItem("pms_organization_document_branding_v2");
      localStorage.removeItem("pms_organization_document_branding_v1");
      const defaults = getDocumentBranding();
      setBranding(defaults);
      toast.info("Branding configuration reset to default.");
    }
  };

  const getSubmoduleLabel = (key: SubmoduleKey) => {
    switch (key) {
      case "receiptVoucher": return "Receipt Voucher";
      case "tokenHandover": return "Token & Handover";
      case "acknowledgementReceipt": return "Acknowledgement Receipt";
      case "leaseAgreement": return "Lease Agreement";
    }
  };

  // Helper to render the live document preview
  const renderLiveDocument = (subKey: SubmoduleKey) => {
    const sub = branding.submodules[subKey];
    const bannerSrc = sub.bannerImageUrl || branding.headerImageUrl;
    const signatoryName = sub.signatoryNameOverride || branding.authorizedSignatoryName;
    const signatoryTitle = sub.signatoryTitleOverride || branding.authorizedSignatoryTitle;
    const lang = sub.languageMode || "en";
    const isRtl = lang === "ar";
    const isBilingual = lang === "bilingual";

    // Determine banner container style — eliminate side white space regardless of mode
    const bannerContainerStyle: React.CSSProperties = {
      width: "100%",
      height: `${sub.bannerHeight}px`,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      // No padding — image fills edge-to-edge even in non-stretch mode when width is 100%
      padding: 0,
    };
    const bannerImgStyle: React.CSSProperties = {
      // In stretch mode: always fill full width
      // In non-stretch mode: respect the user-set width percent
      width: sub.bannerStretch ? "100%" : `${sub.bannerWidthPercent}%`,
      height: "100%",
      objectFit: sub.bannerFit,
      objectPosition: "center",
      borderRadius: sub.bannerStretch ? 0 : `${sub.bannerBorderRadius}px`,
      display: "block",
      flexShrink: 0,
    };

    return (
      <div className={`bg-white text-slate-900 border border-slate-300 rounded-lg shadow-md p-0 overflow-hidden max-w-3xl mx-auto text-sm print:p-0 font-sans ${isRtl ? "text-right" : "text-left"}`}>
        {/* Document Header / Banner (Edge-to-Edge, No Side Gaps) */}
        {sub.showBanner && (
          <div className="w-full border-b border-slate-200">
            {bannerSrc ? (
              <div style={bannerContainerStyle}>
                <img
                  src={bannerSrc}
                  alt="Letterhead Banner"
                  style={bannerImgStyle}
                />
              </div>
            ) : (
              <div className="p-6 pb-4 flex justify-between items-start border-b-2 border-primary">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                      {branding.companyName || "Organization Name"}
                    </h2>
                  </div>
                  {isBilingual && branding.companyNameAr && (
                    <p className="text-xs font-semibold text-slate-700">{branding.companyNameAr}</p>
                  )}
                  <p className="text-xs text-slate-500">{branding.legalEntityName}</p>
                  <p className="text-xs text-slate-500">{branding.address}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span><strong>Phone:</strong> {branding.phone}</span>
                    <span><strong>Email:</strong> {branding.email}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500 space-y-0.5">
                  {branding.crNumber && <div><strong>CR No:</strong> {branding.crNumber}</div>}
                  {branding.taxNumber && <div><strong>Tax ID:</strong> {branding.taxNumber}</div>}
                  <div><strong>Issue Date:</strong> {new Date().toLocaleDateString("en-GB")}</div>
                  <div className="font-mono text-slate-700 font-semibold pt-1">DOC-2026-08492</div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Title Bar (with Realtime Bilingual / Arabic Rendering) */}
          <div className="text-center py-2 border-b border-slate-200 space-y-1">
            <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-900">
              {lang === "ar" ? sub.documentTitleAr || sub.documentTitle : sub.documentTitle}
            </h3>
            {isBilingual && sub.documentTitleAr && (
              <h4 className="text-sm font-bold text-slate-700">{sub.documentTitleAr}</h4>
            )}
            <p className="text-xs text-slate-500">
              {lang === "ar" ? sub.documentSubtitleAr || sub.documentSubtitle : sub.documentSubtitle}
            </p>
            {isBilingual && sub.documentSubtitleAr && (
              <p className="text-xs text-slate-500">{sub.documentSubtitleAr}</p>
            )}
          </div>

          {/* Content Body Based on Submodule */}
          {subKey === "receiptVoucher" && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded border border-slate-200">
                <div>
                  <p className="text-slate-500">{lang === "ar" ? "استلمنا من السيد:" : "Received From:"}</p>
                  <p className="font-semibold text-slate-900">Mohamed Al-Kuwari / محمد الكواري</p>
                  <p className="text-slate-500">QID: 29463401928 • Mobile: +974 5512 8899</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">{lang === "ar" ? "رقم سند القبض:" : "Receipt Voucher No:"}</p>
                  <p className="font-mono font-bold text-slate-900">RC-2026-0042</p>
                  <p className="text-slate-500">Mode: QPay / Cheque (شيك مصرفي)</p>
                </div>
              </div>

              <table className="w-full border-collapse border border-slate-200 text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="p-2 border border-slate-200">Description / البيان</th>
                    <th className="p-2 border border-slate-200">Unit / الوحدة</th>
                    <th className="p-2 border border-slate-200 text-right">Amount (QAR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-slate-200">Advance Rent (Month 1) / إيجار مقدم</td>
                    <td className="p-2 border border-slate-200">Pearl Marina Tower - Unit 402</td>
                    <td className="p-2 border border-slate-200 text-right font-medium">10,000.00</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-200">Security Deposit / تأمين مسترد</td>
                    <td className="p-2 border border-slate-200">Pearl Marina Tower - Unit 402</td>
                    <td className="p-2 border border-slate-200 text-right font-medium">5,000.00</td>
                  </tr>
                  <tr className="font-bold bg-slate-50 text-slate-900">
                    <td colSpan={2} className="p-2 border border-slate-200 text-right">TOTAL RECEIVED / المجموع المقبوض:</td>
                    <td className="p-2 border border-slate-200 text-right">QAR 15,000.00</td>
                  </tr>
                </tbody>
              </table>

              {sub.notes && (
                <div className="p-2.5 bg-emerald-50/50 border border-emerald-200 rounded text-emerald-950 space-y-1">
                  <p className="font-semibold">{lang === "ar" ? "ملاحظات السند:" : "Notes & Remarks:"}</p>
                  <p className="text-[11px] text-emerald-800">{sub.notes}</p>
                  {isBilingual && sub.notesAr && <p className="text-[11px] text-emerald-900 font-arabic">{sub.notesAr}</p>}
                </div>
              )}
            </div>
          )}

          {subKey === "tokenHandover" && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded border border-slate-200">
                <div>
                  <p className="text-slate-500">{lang === "ar" ? "المستلم (المستأجر):" : "Handed Over To (Lessee):"}</p>
                  <p className="font-semibold text-slate-900">Tariq Mansoor Al-Nuaimi / طارق منصور النعيمي</p>
                  <p className="text-slate-500">Unit: Lusail Marina Tower, Unit #1204</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Protocol No:</p>
                  <p className="font-mono font-bold text-slate-900">HO-2026-0911</p>
                  <p className="text-slate-500">Inspection: Passed (100% سليم)</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
                <p className="font-semibold text-slate-900">Handover Inventory Checklist / قائمة التسليم:</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Main Key (2 Sets / مفاتيح رئيسية)</div>
                  <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> RFID Access Fob (2 Tokens / بطاقات دخول)</div>
                  <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Parking Gate Card (1 Card / بطاقة مواقف)</div>
                  <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> AC Remote (3 Units / أجهزة تحكم مكيف)</div>
                </div>
              </div>

              {sub.notes && (
                <div className="p-2.5 bg-blue-50/50 border border-blue-200 rounded text-blue-950 space-y-1">
                  <p className="font-semibold">{lang === "ar" ? "بيان التسليم:" : "Handover Statement:"}</p>
                  <p className="text-[11px] text-blue-800">{sub.notes}</p>
                  {isBilingual && sub.notesAr && <p className="text-[11px] text-blue-900">{sub.notesAr}</p>}
                </div>
              )}
            </div>
          )}

          {subKey === "acknowledgementReceipt" && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded border border-slate-200">
                <div>
                  <p className="text-slate-500">{lang === "ar" ? "العميل الحاجز:" : "Booking / Holding Client:"}</p>
                  <p className="font-semibold text-slate-900">Dr. Abdullah Al-Sulaiti / د. عبدالله السليطي</p>
                  <p className="text-slate-500">Holding Unit: West Bay Diplomatic Tower - #801</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Acknowledgment Ref:</p>
                  <p className="font-mono font-bold text-slate-900">ACK-2026-3391</p>
                  <p className="text-slate-500">Validity: 7 Days / صلاحية 7 أيام</p>
                </div>
              </div>

              <div className="p-3 bg-amber-50/40 border border-amber-200 rounded space-y-1 text-slate-800">
                <p className="font-semibold text-amber-950">Token Booking Settlement / عربون الحجز المالي:</p>
                <p className="text-[11px]">Token amount received: <strong>QAR 5,000.00</strong> holding the property for final lease contract execution.</p>
              </div>

              {sub.notes && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 space-y-1">
                  <p className="font-semibold">{lang === "ar" ? "تفاصيل الإقرار:" : "Acknowledgement Details:"}</p>
                  <p className="text-[11px] text-slate-600">{sub.notes}</p>
                  {isBilingual && sub.notesAr && <p className="text-[11px] text-slate-800">{sub.notesAr}</p>}
                </div>
              )}
            </div>
          )}

          {subKey === "leaseAgreement" && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded border border-slate-200">
                <div>
                  <p className="text-slate-500">{lang === "ar" ? "الطرف الأول (المؤجر):" : "First Party (Lessor):"}</p>
                  <p className="font-semibold text-slate-900">{branding.companyName}</p>
                  {isBilingual && <p className="text-[11px] font-semibold text-slate-700">{branding.companyNameAr}</p>}
                  <p className="text-slate-500">{branding.crNumber} • {branding.address}</p>
                </div>
                <div>
                  <p className="text-slate-500">{lang === "ar" ? "الطرف الثاني (المستأجر):" : "Second Party (Lessee):"}</p>
                  <p className="font-semibold text-slate-900">Sheikh Fahad Bin Khalid Al-Thani / الشيخ فهد بن خالد آل ثاني</p>
                  <p className="text-slate-500">QID: 28863400192 • Doha, Qatar</p>
                </div>
              </div>

              <div className="space-y-2 p-3 bg-slate-50 rounded border border-slate-200">
                <p className="font-semibold text-slate-900">Contract Summary / ملخص العقد:</p>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-700">
                  <div><strong>Property / العقار:</strong> Tower 18, Unit 502</div>
                  <div><strong>Period / المدة:</strong> 12 Months Fixed</div>
                  <div><strong>Rent / القيمة:</strong> QAR 144,000.00 / Annual</div>
                </div>
              </div>

              {sub.notes && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 space-y-1">
                  <p className="font-semibold">{lang === "ar" ? "شروط خاصة:" : "Special Conditions:"}</p>
                  <p className="text-[11px] text-slate-600">{sub.notes}</p>
                  {isBilingual && sub.notesAr && <p className="text-[11px] text-slate-800">{sub.notesAr}</p>}
                </div>
              )}
            </div>
          )}

          {/* Legal Disclaimers & Clauses */}
          {sub.termsAndConditions && (
            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {lang === "ar" ? "الشروط والأحكام القانونية:" : "Terms & Conditions / Legal Governance:"}
              </p>
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1 text-[11px] text-slate-600 leading-relaxed">
                <p>{sub.termsAndConditions}</p>
                {isBilingual && sub.termsAndConditionsAr && (
                  <p className="text-slate-800 font-arabic pt-1 border-t border-slate-200">{sub.termsAndConditionsAr}</p>
                )}
              </div>
            </div>
          )}

          {/* Signatures & Seal Box */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
            <div className="text-left space-y-1">
              <p className="text-[11px] text-slate-500">{lang === "ar" ? "توقيع الطرف الثاني (المستأجر):" : "Lessee / Client Signature:"}</p>
              <div className="w-44 h-14 border-b border-dashed border-slate-400 flex items-end">
                <span className="text-[10px] text-slate-400 pb-1">Signed / معتمد رسمياً</span>
              </div>
              <p className="text-[11px] font-medium text-slate-800 pt-1">Authorized Client</p>
            </div>

            <div className="flex items-center gap-6">
              {/* Company Stamp */}
              {sub.showStamp && branding.stampImageUrl && (
                <div className="flex flex-col items-center">
                  <p className="text-[10px] text-slate-400 mb-1">Official Seal</p>
                  <img
                    src={branding.stampImageUrl}
                    alt="Official Stamp"
                    className="object-contain"
                    style={{ width: `${(sub.stampScale / 100) * 80}px`, height: `${(sub.stampScale / 100) * 80}px` }}
                  />
                </div>
              )}

              {/* Issuer Signature */}
              {sub.showSignature && (
                <div className="text-right space-y-1">
                  <p className="text-[11px] text-slate-500">For {branding.companyName}:</p>
                  <div className="w-48 h-14 border-b border-dashed border-slate-400 flex flex-col justify-end items-end">
                    {branding.signatureImageUrl ? (
                      <img
                        src={branding.signatureImageUrl}
                        alt="Signature"
                        className="object-contain max-h-12"
                        style={{ transform: `scale(${sub.signatureScale / 100})`, transformOrigin: "bottom right" }}
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 pb-1">Digital Authorized Signature</span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-slate-900 pt-1">{signatoryName}</p>
                  <p className="text-[10px] text-slate-500">{signatoryTitle}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Note */}
          {sub.footerNote && (
            <div className="pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-0.5">
              <p>{sub.footerNote}</p>
              {isBilingual && sub.footerNoteAr && <p className="text-slate-500">{sub.footerNoteAr}</p>}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <FileCheck className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Document Branding & Signature Studio
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Full-bleed banner stretch & dimension controls, realtime Arabic translator, and custom templates for Receipts, Handover, Acknowledgements, and Leases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewModalOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            <span>Full Screen Preview</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : "Save All Changes"}</span>
          </Button>
        </div>
      </div>

      {/* Main Submodule Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full max-w-4xl bg-muted/60 p-1">
          <TabsTrigger value="global" className="flex items-center gap-1.5 text-xs font-semibold">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            <span>Global Assets & Legal</span>
          </TabsTrigger>
          <TabsTrigger value="receiptVoucher" className="flex items-center gap-1.5 text-xs font-semibold">
            <Receipt className="h-3.5 w-3.5 text-emerald-500" />
            <span>Receipt Voucher</span>
          </TabsTrigger>
          <TabsTrigger value="tokenHandover" className="flex items-center gap-1.5 text-xs font-semibold">
            <Key className="h-3.5 w-3.5 text-blue-500" />
            <span>Token & Handover</span>
          </TabsTrigger>
          <TabsTrigger value="acknowledgementReceipt" className="flex items-center gap-1.5 text-xs font-semibold">
            <FileSpreadsheet className="h-3.5 w-3.5 text-amber-500" />
            <span>Acknowledgement</span>
          </TabsTrigger>
          <TabsTrigger value="leaseAgreement" className="flex items-center gap-1.5 text-xs font-semibold">
            <FileText className="h-3.5 w-3.5 text-purple-500" />
            <span>Lease Agreement</span>
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: GLOBAL BRANDING & SIGNATURE ASSETS ── */}
        <TabsContent value="global" className="space-y-6 pt-4">
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left: Uploads & Signatures */}
            <div className="lg:col-span-7 space-y-6">
              {/* Header Letterhead Upload */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      Global Header Letterhead / Banner
                    </span>
                    {branding.headerImageUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setBranding({ ...branding, headerImageUrl: null });
                          saveDocumentBranding({ headerImageUrl: null });
                          toast.info("Header image removed.");
                        }}
                        className="text-xs text-rose-500 hover:text-rose-600 h-8 px-2 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remove
                      </Button>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Primary corporate letterhead banner used by default across all documents.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {branding.headerImageUrl ? (
                    <div className="relative border rounded-lg p-2 bg-slate-50 dark:bg-slate-900/50">
                      <img
                        src={branding.headerImageUrl}
                        alt="Header Banner"
                        className="w-full max-h-36 object-contain rounded"
                      />
                      <div className="mt-3 flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Active Letterhead
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => globalHeaderFileInputRef.current?.click()}
                          className="text-xs cursor-pointer"
                        >
                          <Upload className="h-3.5 w-3.5 mr-1" />
                          Replace Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => globalHeaderFileInputRef.current?.click()}
                      className="border-2 border-dashed border-border/80 hover:border-primary/50 hover:bg-muted/40 transition-all rounded-xl p-8 text-center cursor-pointer space-y-2"
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">Click to upload header letterhead banner</p>
                        <p className="text-xs text-muted-foreground">Recommended: 1200 x 240 px (PNG, JPG, WebP up to 5MB)</p>
                      </div>
                    </div>
                  )}
                  {branding.headerImageUrl && (
                    <div className="space-y-4 pt-3 border-t">
                      {/* Global Edge-to-Edge Stretch Toggle */}
                      <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-lg flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Expand className="h-3.5 w-3.5 text-emerald-600" />
                            Global Edge-to-Edge Stretch (100% Width)
                          </Label>
                          <p className="text-[11px] text-muted-foreground">
                            Applies full bleed width to default header banners across all modules.
                          </p>
                        </div>
                        <Switch
                          checked={branding.globalBannerStretch !== false}
                          onCheckedChange={(val) => {
                            const updated = {
                              ...branding,
                              globalBannerStretch: val,
                              globalBannerFit: val ? ("fill" as const) : (branding.globalBannerFit || "contain"),
                            };
                            setBranding(updated);
                            saveDocumentBranding(updated);
                          }}
                        />
                      </div>

                      {/* Global Height & Width Dimension Sliders */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold flex items-center gap-1.5">
                              <Sliders className="h-3.5 w-3.5 text-primary" />
                              Global Banner Height: {branding.globalBannerHeight || 120}px
                            </Label>
                            <span className="text-[11px] text-muted-foreground font-mono">60px – 320px</span>
                          </div>
                          <Slider
                            value={[branding.globalBannerHeight || 120]}
                            min={60}
                            max={320}
                            step={5}
                            onValueChange={(val) => {
                              const updated = { ...branding, globalBannerHeight: val[0] };
                              setBranding(updated);
                              saveDocumentBranding(updated);
                            }}
                            className="cursor-pointer"
                          />
                        </div>

                        {/* Global Width Slider */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold flex items-center gap-1.5">
                              <MoveHorizontal className="h-3.5 w-3.5 text-primary" />
                              Global Banner Width: {branding.globalBannerStretch !== false ? "100% (Full-Bleed)" : `${branding.globalBannerWidthPercent || 100}%`}
                            </Label>
                            {branding.globalBannerStretch !== false ? (
                              <span className="text-[11px] text-emerald-600 font-semibold">Stretch ON</span>
                            ) : (
                              <span className="text-[11px] text-muted-foreground font-mono">50% – 100%</span>
                            )}
                          </div>
                          {branding.globalBannerStretch === false && (
                            <Slider
                              value={[branding.globalBannerWidthPercent || 100]}
                              min={50}
                              max={100}
                              step={1}
                              onValueChange={(val) => {
                                const updated = { ...branding, globalBannerWidthPercent: val[0] };
                                setBranding(updated);
                                saveDocumentBranding(updated);
                              }}
                              className="cursor-pointer"
                            />
                          )}
                        </div>

                        {/* Image Fit Selector */}
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Image Aspect Fit Mode</Label>
                          <div className="grid grid-cols-4 gap-2">
                            {(["fill", "cover", "contain", "none"] as const).map((fitMode) => (
                              <Button
                                key={fitMode}
                                variant={(branding.globalBannerFit || "fill") === fitMode ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  const updated = { ...branding, globalBannerFit: fitMode };
                                  setBranding(updated);
                                  saveDocumentBranding(updated);
                                }}
                                className="text-xs capitalize h-8 cursor-pointer"
                              >
                                {fitMode === "fill" ? "Stretch (Fill)" : fitMode === "cover" ? "Cover" : fitMode === "contain" ? "Contain" : "Original"}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <input
                    ref={globalHeaderFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleGlobalFileUpload(e, "headerImageUrl")}
                  />
                </CardContent>
              </Card>

              {/* Authorized Signature & Stamp */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Signature Upload */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <PenTool className="h-4 w-4 text-emerald-500" />
                        Authorized Signature
                      </span>
                      {branding.signatureImageUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setBranding({ ...branding, signatureImageUrl: null });
                            saveDocumentBranding({ signatureImageUrl: null });
                            toast.info("Signature image removed.");
                          }}
                          className="text-xs text-rose-500 h-6 px-1.5 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {branding.signatureImageUrl ? (
                      <div className="border rounded-lg p-2 bg-slate-50 dark:bg-slate-900/50 text-center">
                        <img
                          src={branding.signatureImageUrl}
                          alt="Signature"
                          className="h-20 max-w-full mx-auto object-contain"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => globalSignatureFileInputRef.current?.click()}
                          className="mt-2 text-xs w-full cursor-pointer"
                        >
                          Replace Signature
                        </Button>
                      </div>
                    ) : (
                      <div
                        onClick={() => globalSignatureFileInputRef.current?.click()}
                        className="border-2 border-dashed border-border/80 hover:border-emerald-500/50 hover:bg-emerald-50/10 transition-all rounded-lg p-6 text-center cursor-pointer space-y-1"
                      >
                        <PenTool className="h-6 w-6 text-emerald-500 mx-auto" />
                        <p className="text-xs font-semibold">Upload Signature</p>
                        <p className="text-[11px] text-muted-foreground">Transparent PNG recommended</p>
                      </div>
                    )}
                    <input
                      ref={globalSignatureFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleGlobalFileUpload(e, "signatureImageUrl")}
                    />

                    <div className="space-y-2 pt-2">
                      <div>
                        <Label className="text-xs">Signatory Full Name (English)</Label>
                        <Input
                          value={branding.authorizedSignatoryName}
                          onChange={(e) => setBranding({ ...branding, authorizedSignatoryName: e.target.value })}
                          placeholder="e.g. Jithin Abdul Latheef"
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Signatory Name (Arabic)</Label>
                        <Input
                          value={branding.authorizedSignatoryNameAr || ""}
                          onChange={(e) => setBranding({ ...branding, authorizedSignatoryNameAr: e.target.value })}
                          placeholder="جيثين عبد اللطيف"
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Designation / Title</Label>
                        <Input
                          value={branding.authorizedSignatoryTitle}
                          onChange={(e) => setBranding({ ...branding, authorizedSignatoryTitle: e.target.value })}
                          placeholder="e.g. General Manager"
                          className="h-8 text-xs mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stamp Upload */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Stamp className="h-4 w-4 text-purple-500" />
                        Official Stamp / Seal
                      </span>
                      {branding.stampImageUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setBranding({ ...branding, stampImageUrl: null });
                            saveDocumentBranding({ stampImageUrl: null });
                            toast.info("Stamp image removed.");
                          }}
                          className="text-xs text-rose-500 h-6 px-1.5 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {branding.stampImageUrl ? (
                      <div className="border rounded-lg p-2 bg-slate-50 dark:bg-slate-900/50 text-center">
                        <img
                          src={branding.stampImageUrl}
                          alt="Official Stamp"
                          className="h-20 max-w-full mx-auto object-contain"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => globalStampFileInputRef.current?.click()}
                          className="mt-2 text-xs w-full cursor-pointer"
                        >
                          Replace Stamp
                        </Button>
                      </div>
                    ) : (
                      <div
                        onClick={() => globalStampFileInputRef.current?.click()}
                        className="border-2 border-dashed border-border/80 hover:border-purple-500/50 hover:bg-purple-50/10 transition-all rounded-lg p-6 text-center cursor-pointer space-y-1"
                      >
                        <Stamp className="h-6 w-6 text-purple-500 mx-auto" />
                        <p className="text-xs font-semibold">Upload Stamp</p>
                        <p className="text-[11px] text-muted-foreground">Round or square seal (PNG)</p>
                      </div>
                    )}
                    <input
                      ref={globalStampFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleGlobalFileUpload(e, "stampImageUrl")}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right: Entity & Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    Entity & Issuer Information
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Printed as issuer header on all official receipts, contracts, and tax invoices.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Company Name (EN)</Label>
                      <Input
                        value={branding.companyName}
                        onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                        placeholder="Al Ameen Real Estate"
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Company Name (AR)</Label>
                      <Input
                        value={branding.companyNameAr || ""}
                        onChange={(e) => setBranding({ ...branding, companyNameAr: e.target.value })}
                        placeholder="الامين للعقارات"
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Legal Entity Name</Label>
                    <Input
                      value={branding.legalEntityName}
                      onChange={(e) => setBranding({ ...branding, legalEntityName: e.target.value })}
                      placeholder="Al Ameen Real Estate W.L.L"
                      className="h-8 text-xs mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Commercial Reg. (CR)</Label>
                      <Input
                        value={branding.crNumber}
                        onChange={(e) => setBranding({ ...branding, crNumber: e.target.value })}
                        placeholder="CR-90821-QA"
                        className="h-8 text-xs mt-1 font-mono"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Tax / TIN No.</Label>
                      <Input
                        value={branding.taxNumber}
                        onChange={(e) => setBranding({ ...branding, taxNumber: e.target.value })}
                        placeholder="TAX-300912-QA"
                        className="h-8 text-xs mt-1 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Registered Address (EN)</Label>
                    <Input
                      value={branding.address}
                      onChange={(e) => setBranding({ ...branding, address: e.target.value })}
                      placeholder="Grand Hamad Avenue, Building 42, Floor 7, Doha, Qatar"
                      className="h-8 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Registered Address (AR)</Label>
                    <Input
                      value={branding.addressAr || ""}
                      onChange={(e) => setBranding({ ...branding, addressAr: e.target.value })}
                      placeholder="شارع حمد الكبير، مبنى 42، الطابق 7، الدوحة، قطر"
                      className="h-8 text-xs mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Phone Number</Label>
                      <Input
                        value={branding.phone}
                        onChange={(e) => setBranding({ ...branding, phone: e.target.value })}
                        placeholder="+974 4499 1234"
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Email Address</Label>
                      <Input
                        value={branding.email}
                        onChange={(e) => setBranding({ ...branding, email: e.target.value })}
                        placeholder="contact@alameen.qa"
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Document Footer Note</Label>
                    <Input
                      value={branding.footerText}
                      onChange={(e) => setBranding({ ...branding, footerText: e.target.value })}
                      placeholder="Al Ameen Real Estate W.L.L • Registered in Qatar"
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── SUBMODULE EDITORS: 4 DEDICATED MODULES ── */}
        {(["receiptVoucher", "tokenHandover", "acknowledgementReceipt", "leaseAgreement"] as SubmoduleKey[]).map(
          (subKey) => {
            const sub = branding.submodules[subKey];
            return (
              <TabsContent key={subKey} value={subKey} className="space-y-6 pt-4">
                <div className="grid lg:grid-cols-12 gap-6">
                  {/* Left Column: Submodule Controls & Image Sizing */}
                  <div className="lg:col-span-6 space-y-5">
                    
                    {/* Header Banner Stretch, Dimensions & Sizing */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-emerald-500" />
                            {getSubmoduleLabel(subKey)} Header Banner & Stretch Controls
                          </span>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Show Banner</Label>
                            <Switch
                              checked={sub.showBanner}
                              onCheckedChange={(val) => updateSubmodule(subKey, { showBanner: val })}
                            />
                          </div>
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Eliminate side white spaces using Full-Bleed Stretch, adjust height, width % and image fit modes.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Banner Image Source */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            {sub.bannerImageUrl ? (
                              <div className="relative border rounded-lg p-2 bg-slate-50 dark:bg-slate-900/50">
                                <img
                                  src={sub.bannerImageUrl}
                                  alt="Custom Banner"
                                  className="w-full max-h-24 object-contain rounded"
                                />
                                <div className="mt-2 flex items-center justify-between">
                                  <Badge className="text-[10px] bg-emerald-500/15 text-emerald-600">
                                    Custom Submodule Banner
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateSubmodule(subKey, { bannerImageUrl: null })}
                                    className="text-xs text-rose-500 h-6 px-1.5 cursor-pointer"
                                  >
                                    <Trash2 className="h-3 w-3 mr-1" /> Use Global
                                  </Button>
                                </div>
                              </div>
                            ) : branding.headerImageUrl ? (
                              <div className="border rounded-lg p-2 bg-slate-50 dark:bg-slate-900/50">
                                <img
                                  src={branding.headerImageUrl}
                                  alt="Global Banner"
                                  className="w-full max-h-20 object-contain rounded opacity-80"
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  Using Global Letterhead Banner
                                </p>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">No global banner uploaded.</p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => submoduleBannerInputRef.current?.click()}
                              className="text-xs cursor-pointer"
                            >
                              <Upload className="h-3.5 w-3.5 mr-1" />
                              Custom Image
                            </Button>
                            <input
                              ref={submoduleBannerInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleSubmoduleBannerUpload(e, subKey)}
                            />
                          </div>
                        </div>

                        {/* Edge-to-Edge Stretch Toggle */}
                        <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-lg flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                              <Expand className="h-3.5 w-3.5 text-emerald-600" />
                              Edge-to-Edge Full-Bleed Stretch (No Side Margins)
                            </Label>
                            <p className="text-[11px] text-muted-foreground">
                              Stretches the banner image 100% across the top of the page with zero side padding.
                            </p>
                          </div>
                          <Switch
                            checked={sub.bannerStretch}
                            onCheckedChange={(val) => {
                              updateSubmodule(subKey, {
                                bannerStretch: val,
                                bannerFit: val ? "fill" : sub.bannerFit,
                              });
                            }}
                          />
                        </div>

                        {/* Height & Width Dimension Sliders */}
                        <div className="space-y-4 pt-2">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-semibold flex items-center gap-1.5">
                                <Sliders className="h-3.5 w-3.5 text-primary" />
                                Banner Height: {sub.bannerHeight}px
                              </Label>
                              <span className="text-[11px] text-muted-foreground font-mono">60px – 320px</span>
                            </div>
                            <Slider
                              value={[sub.bannerHeight]}
                              min={60}
                              max={320}
                              step={5}
                              onValueChange={(val) => updateSubmodule(subKey, { bannerHeight: val[0] })}
                              className="cursor-pointer"
                            />
                          </div>

                          {/* Width slider — always show so user can control how much of the width the image occupies */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-semibold flex items-center gap-1.5">
                                <MoveHorizontal className="h-3.5 w-3.5 text-primary" />
                                Banner Width: {sub.bannerStretch ? "100% (Full-Bleed)" : `${sub.bannerWidthPercent}%`}
                              </Label>
                              {sub.bannerStretch ? (
                                <span className="text-[11px] text-emerald-600 font-semibold">Stretch ON — full edge-to-edge</span>
                              ) : (
                                <span className="text-[11px] text-muted-foreground font-mono">50% – 100%</span>
                              )}
                            </div>
                            {!sub.bannerStretch && (
                              <Slider
                                value={[sub.bannerWidthPercent]}
                                min={50}
                                max={100}
                                step={1}
                                onValueChange={(val) => updateSubmodule(subKey, { bannerWidthPercent: val[0] })}
                                className="cursor-pointer"
                              />
                            )}
                            {sub.bannerStretch && (
                              <p className="text-[11px] text-muted-foreground">
                                Disable "Edge-to-Edge Stretch" above to adjust the width percentage manually.
                              </p>
                            )}
                          </div>

                          {/* Image Fit Selector */}
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Image Aspect Fit Mode</Label>
                            <div className="grid grid-cols-4 gap-2">
                              {(["fill", "cover", "contain", "none"] as const).map((fitMode) => (
                                <Button
                                  key={fitMode}
                                  variant={sub.bannerFit === fitMode ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => updateSubmodule(subKey, { bannerFit: fitMode })}
                                  className="text-xs capitalize h-8 cursor-pointer"
                                >
                                  {fitMode === "fill" ? "Stretch (Fill)" : fitMode === "cover" ? "Cover" : fitMode === "contain" ? "Contain" : "Original"}
                                </Button>
                              ))}
                            </div>
                            <p className="text-[11px] text-muted-foreground pt-0.5">
                              <strong>Fill</strong> = stretches to fill fully (no gaps). <strong>Cover</strong> = fills while preserving aspect ratio (may crop). <strong>Contain</strong> = shows full image with letterbox. <strong>Original</strong> = native size.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Realtime Translator & Bilingual Studio */}
                    <Card className="border-emerald-500/30">
                      <CardHeader className="pb-3 bg-emerald-500/5">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2 text-emerald-950 dark:text-emerald-300">
                            <Languages className="h-4 w-4 text-emerald-600" />
                            Realtime Text Translator & Bilingual Studio
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => triggerRealtimeTranslate(subKey)}
                            disabled={translatingKey === subKey}
                            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white h-7 px-2.5 cursor-pointer flex items-center gap-1 shadow-sm"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>{translatingKey === subKey ? "Translating all fields..." : "Translate All Fields →AR"}</span>
                          </Button>
                        </div>
                        <CardDescription className="text-xs">
                          Type any English text and click the <strong>→ AR</strong> button to translate it in real-time. Supports all document fields.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-3">
                        {/* Language Mode Toggle */}
                        <div>
                          <Label className="text-xs font-semibold mb-1.5 block">Document Language Mode</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {(["en", "ar", "bilingual"] as const).map((mode) => (
                              <Button
                                key={mode}
                                variant={sub.languageMode === mode ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateSubmodule(subKey, { languageMode: mode })}
                                className="text-xs h-8 cursor-pointer"
                              >
                                {mode === "en" ? "🇬🇧 English" : mode === "ar" ? "🇸🇦 Arabic" : "🌐 Bilingual"}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div className="text-[11px] text-muted-foreground bg-muted/50 p-2.5 rounded-lg flex items-start gap-2">
                          <Languages className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>Click <strong>→ AR</strong> next to any English field to translate it instantly using the realtime translation engine. Or click <strong>Translate All Fields</strong> to translate everything at once.</span>
                        </div>

                        {/* Title */}
                        <div className="space-y-2 pb-2 border-b">
                          <Label className="text-xs font-semibold text-slate-700">Document Title</Label>
                          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-start">
                            <div>
                              <Label className="text-[10px] text-muted-foreground mb-1 block">English</Label>
                              <Input
                                value={sub.documentTitle}
                                onChange={(e) => updateSubmodule(subKey, { documentTitle: e.target.value })}
                                className="h-8 text-xs"
                                placeholder="Document Title"
                              />
                            </div>
                            <div className="flex items-end pb-0.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => translateField(subKey, "documentTitle", "documentTitleAr")}
                                disabled={translatingField === `${subKey}.documentTitle`}
                                className="h-8 px-2 text-[10px] text-emerald-700 border-emerald-400 hover:bg-emerald-50 cursor-pointer whitespace-nowrap mt-5"
                              >
                                {translatingField === `${subKey}.documentTitle` ? "..." : "→ AR"}
                              </Button>
                            </div>
                            <div>
                              <Label className="text-[10px] text-muted-foreground mb-1 block">Arabic (العربية)</Label>
                              <Input
                                value={sub.documentTitleAr || ""}
                                onChange={(e) => updateSubmodule(subKey, { documentTitleAr: e.target.value })}
                                placeholder="العنوان بالعربية"
                                className="h-8 text-xs text-right"
                                dir="rtl"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Subtitle */}
                        <div className="space-y-2 pb-2 border-b">
                          <Label className="text-xs font-semibold text-slate-700">Document Subtitle</Label>
                          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-start">
                            <div>
                              <Label className="text-[10px] text-muted-foreground mb-1 block">English</Label>
                              <Input
                                value={sub.documentSubtitle}
                                onChange={(e) => updateSubmodule(subKey, { documentSubtitle: e.target.value })}
                                className="h-8 text-xs"
                                placeholder="Subtitle"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => translateField(subKey, "documentSubtitle", "documentSubtitleAr")}
                                disabled={translatingField === `${subKey}.documentSubtitle`}
                                className="h-8 px-2 text-[10px] text-emerald-700 border-emerald-400 hover:bg-emerald-50 cursor-pointer whitespace-nowrap mt-5"
                              >
                                {translatingField === `${subKey}.documentSubtitle` ? "..." : "→ AR"}
                              </Button>
                            </div>
                            <div>
                              <Label className="text-[10px] text-muted-foreground mb-1 block">Arabic (العربية)</Label>
                              <Input
                                value={sub.documentSubtitleAr || ""}
                                onChange={(e) => updateSubmodule(subKey, { documentSubtitleAr: e.target.value })}
                                placeholder="العنوان الفرعي بالعربية"
                                className="h-8 text-xs text-right"
                                dir="rtl"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2 pb-2 border-b">
                          <Label className="text-xs font-semibold text-slate-700">Notes / Remarks</Label>
                          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-start">
                            <div>
                              <Label className="text-[10px] text-muted-foreground mb-1 block">English</Label>
                              <Textarea
                                value={sub.notes}
                                onChange={(e) => updateSubmodule(subKey, { notes: e.target.value })}
                                className="text-xs h-16 resize-none"
                              />
                            </div>
                            <div className="flex items-center justify-center pt-5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => translateField(subKey, "notes", "notesAr")}
                                disabled={translatingField === `${subKey}.notes`}
                                className="h-8 px-2 text-[10px] text-emerald-700 border-emerald-400 hover:bg-emerald-50 cursor-pointer whitespace-nowrap"
                              >
                                {translatingField === `${subKey}.notes` ? "..." : "→ AR"}
                              </Button>
                            </div>
                            <div>
                              <Label className="text-[10px] text-muted-foreground mb-1 block">Arabic (العربية)</Label>
                              <Textarea
                                value={sub.notesAr || ""}
                                onChange={(e) => updateSubmodule(subKey, { notesAr: e.target.value })}
                                placeholder="ملاحظات بالعربية"
                                className="text-xs h-16 resize-none text-right"
                                dir="rtl"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Legal Terms */}
                        <div className="space-y-2 pb-2 border-b">
                          <Label className="text-xs font-semibold text-slate-700">Legal Terms & Conditions</Label>
                          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-start">
                            <div>
                              <Label className="text-[10px] text-muted-foreground mb-1 block">English</Label>
                              <Textarea
                                value={sub.termsAndConditions}
                                onChange={(e) => updateSubmodule(subKey, { termsAndConditions: e.target.value })}
                                className="text-xs h-20 resize-none"
                              />
                            </div>
                            <div className="flex items-center justify-center pt-5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => translateField(subKey, "termsAndConditions", "termsAndConditionsAr")}
                                disabled={translatingField === `${subKey}.termsAndConditions`}
                                className="h-8 px-2 text-[10px] text-emerald-700 border-emerald-400 hover:bg-emerald-50 cursor-pointer whitespace-nowrap"
                              >
                                {translatingField === `${subKey}.termsAndConditions` ? "..." : "→ AR"}
                              </Button>
                            </div>
                            <div>
                              <Label className="text-[10px] text-muted-foreground mb-1 block">Arabic (العربية)</Label>
                              <Textarea
                                value={sub.termsAndConditionsAr || ""}
                                onChange={(e) => updateSubmodule(subKey, { termsAndConditionsAr: e.target.value })}
                                placeholder="الشروط والأحكام بالعربية"
                                className="text-xs h-20 resize-none text-right"
                                dir="rtl"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Footer Note */}
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-slate-700">Footer Note</Label>
                          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-start">
                            <div>
                              <Label className="text-[10px] text-muted-foreground mb-1 block">English</Label>
                              <Input
                                value={sub.footerNote}
                                onChange={(e) => updateSubmodule(subKey, { footerNote: e.target.value })}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => translateField(subKey, "footerNote", "footerNoteAr")}
                                disabled={translatingField === `${subKey}.footerNote`}
                                className="h-8 px-2 text-[10px] text-emerald-700 border-emerald-400 hover:bg-emerald-50 cursor-pointer whitespace-nowrap mt-5"
                              >
                                {translatingField === `${subKey}.footerNote` ? "..." : "→ AR"}
                              </Button>
                            </div>
                            <div>
                              <Label className="text-[10px] text-muted-foreground mb-1 block">Arabic (العربية)</Label>
                              <Input
                                value={sub.footerNoteAr || ""}
                                onChange={(e) => updateSubmodule(subKey, { footerNoteAr: e.target.value })}
                                placeholder="تذييل الصفحة بالعربية"
                                className="h-8 text-xs text-right"
                                dir="rtl"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Signatures & Stamps Sizing Controls */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span>Signatures & Stamp Size Controls</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs flex items-center gap-2">
                              <span>Include Signature</span>
                              <Switch
                                checked={sub.showSignature}
                                onCheckedChange={(val) => updateSubmodule(subKey, { showSignature: val })}
                              />
                            </Label>
                            <span className="text-xs text-muted-foreground font-mono">{sub.signatureScale}% Size</span>
                          </div>
                          {sub.showSignature && (
                            <Slider
                              value={[sub.signatureScale]}
                              min={50}
                              max={160}
                              step={5}
                              onValueChange={(val) => updateSubmodule(subKey, { signatureScale: val[0] })}
                            />
                          )}
                        </div>

                        <div className="space-y-2 pt-2 border-t">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs flex items-center gap-2">
                              <span>Include Official Stamp</span>
                              <Switch
                                checked={sub.showStamp}
                                onCheckedChange={(val) => updateSubmodule(subKey, { showStamp: val })}
                              />
                            </Label>
                            <span className="text-xs text-muted-foreground font-mono">{sub.stampScale}% Size</span>
                          </div>
                          {sub.showStamp && (
                            <Slider
                              value={[sub.stampScale]}
                              min={50}
                              max={160}
                              step={5}
                              onValueChange={(val) => updateSubmodule(subKey, { stampScale: val[0] })}
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column: Live Interactive Document Preview */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                          Live Interactive Preview
                        </Badge>
                        <span className="text-xs text-muted-foreground">{getSubmoduleLabel(subKey)}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPreviewDocType(subKey);
                          setPreviewModalOpen(true);
                        }}
                        className="text-xs h-7 px-2 cursor-pointer"
                      >
                        <Maximize2 className="h-3 w-3 mr-1" /> Modal View
                      </Button>
                    </div>

                    <div className="border rounded-xl p-4 bg-slate-100 dark:bg-slate-900/60 overflow-x-auto shadow-inner">
                      {renderLiveDocument(subKey)}
                    </div>
                  </div>
                </div>
              </TabsContent>
            );
          }
        )}
      </Tabs>

      {/* Fullscreen Document Preview Modal */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-100 dark:bg-slate-950 p-6">
          <DialogHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-emerald-500" />
                Document Live Print & PDF Preview
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Tabs
                  value={previewDocType}
                  onValueChange={(val) => setPreviewDocType(val as SubmoduleKey)}
                >
                  <TabsList className="bg-slate-200 dark:bg-slate-800">
                    <TabsTrigger value="receiptVoucher" className="text-xs">Receipt</TabsTrigger>
                    <TabsTrigger value="tokenHandover" className="text-xs">Token & Key</TabsTrigger>
                    <TabsTrigger value="acknowledgementReceipt" className="text-xs">Acknowledgement</TabsTrigger>
                    <TabsTrigger value="leaseAgreement" className="text-xs">Lease</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            {renderLiveDocument(previewDocType)}
          </div>

          <DialogFooter className="border-t pt-3 flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Live layout rendering matching generated print and PDF downloads.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="cursor-pointer"
              >
                <Download className="h-4 w-4 mr-1" />
                Print / Save PDF
              </Button>
              <Button
                size="sm"
                onClick={() => setPreviewModalOpen(false)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
              >
                Done
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
