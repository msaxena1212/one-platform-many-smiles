/**
 * document-branding.ts
 * Manages organization branding assets (Header Image / Letterhead, Authorized Signature, Company Stamp, and Legal Document Templates)
 * for use in Receipts, Leases, Invoices, Payment Acknowledgements, Token Handover, and other documents.
 * Supports per-submodule banner overrides, sizing controls, custom titles, notes, disclaimers, and real-time Arabic translation.
 */

export interface SubmoduleDocBranding {
  documentTitle: string;
  documentSubtitle: string;
  bannerImageUrl: string | null;
  bannerHeight: number; // in pixels (e.g., 60 - 320)
  bannerWidthPercent: number; // 50% to 100% (or full bleed stretch)
  bannerFit: "contain" | "cover" | "fill" | "none";
  bannerStretch: boolean; // Full container stretch / edge-to-edge
  bannerBorderRadius: number; // 0 to 20px
  showBanner: boolean;
  showSignature: boolean;
  signatureScale: number; // 50 to 160 percent
  showStamp: boolean;
  stampScale: number; // 50 to 160 percent
  signatoryNameOverride: string;
  signatoryTitleOverride: string;
  notes: string;
  termsAndConditions: string;
  footerNote: string;
  
  // Realtime translation & Bilingual support
  languageMode: "en" | "ar" | "bilingual";
  documentTitleAr?: string;
  documentSubtitleAr?: string;
  notesAr?: string;
  termsAndConditionsAr?: string;
  footerNoteAr?: string;
}

export interface DocumentBranding {
  companyName: string;
  legalEntityName: string;
  companyNameAr?: string;
  legalEntityNameAr?: string;
  crNumber: string;
  taxNumber: string;
  address: string;
  addressAr?: string;
  phone: string;
  email: string;
  website: string;
  headerImageUrl: string | null;
  globalBannerHeight: number;
  globalBannerWidthPercent: number;
  globalBannerFit: "contain" | "cover" | "fill" | "none";
  globalBannerStretch: boolean;
  globalBannerBorderRadius: number;
  footerText: string;
  signatureImageUrl: string | null;
  authorizedSignatoryName: string;
  authorizedSignatoryTitle: string;
  authorizedSignatoryNameAr?: string;
  authorizedSignatoryTitleAr?: string;
  stampImageUrl: string | null;
  
  // Master templates & per-submodule overrides
  receiptTerms: string;
  leaseTerms: string;
  acknowledgementTerms: string;
  handoverTerms: string;

  // Dedicated submodules
  submodules: {
    receiptVoucher: SubmoduleDocBranding;
    tokenHandover: SubmoduleDocBranding;
    acknowledgementReceipt: SubmoduleDocBranding;
    leaseAgreement: SubmoduleDocBranding;
  };

  updatedAt: string;
}

const BRANDING_STORAGE_KEY = "pms_organization_document_branding_v3";

const DEFAULT_RECEIPT_SUBMODULE: SubmoduleDocBranding = {
  documentTitle: "OFFICIAL RECEIPT VOUCHER",
  documentSubtitle: "Payment & Rent Collection Voucher",
  documentTitleAr: "سند قبض رسمي",
  documentSubtitleAr: "سند تحصيل الإيجار والدفعات المالية",
  bannerImageUrl: null,
  bannerHeight: 120,
  bannerWidthPercent: 100,
  bannerFit: "fill",
  bannerStretch: true,
  bannerBorderRadius: 0,
  showBanner: true,
  showSignature: true,
  signatureScale: 100,
  showStamp: true,
  stampScale: 100,
  signatoryNameOverride: "",
  signatoryTitleOverride: "",
  notes: "Received with thanks payment against unit lease & maintenance.",
  notesAr: "تم استلام المبلغ أعلاه مع الشكر لقاء الإيجار وخدمات الصيانة المعتمدة.",
  termsAndConditions: "This receipt is computer generated and acknowledged. Valid subject to realization of cheque / payment.",
  termsAndConditionsAr: "هذا الإيصال صادر إلكترونياً ويعد معتمداً بعد التحصيل الفعلي للشيك أو الدفعة البنكية.",
  footerNote: "Al Ameen Real Estate W.L.L • Registered in the State of Qatar • CR-90821-QA",
  footerNoteAr: "الامين للعقارات ذ.م.م • مسجلة في دولة قطر • سجل تجاري: CR-90821-QA",
  languageMode: "en",
};

const DEFAULT_TOKEN_SUBMODULE: SubmoduleDocBranding = {
  documentTitle: "TOKEN & KEY HANDOVER CERTIFICATE",
  documentSubtitle: "Unit Handover & Security Token Confirmation",
  documentTitleAr: "محضر تسليم المفاتيح وعربون الحجز",
  documentSubtitleAr: "إقرار استلام الوحدة والمفاتيح وبطاقات الدخول",
  bannerImageUrl: null,
  bannerHeight: 120,
  bannerWidthPercent: 100,
  bannerFit: "fill",
  bannerStretch: true,
  bannerBorderRadius: 0,
  showBanner: true,
  showSignature: true,
  signatureScale: 100,
  showStamp: true,
  stampScale: 100,
  signatoryNameOverride: "",
  signatoryTitleOverride: "",
  notes: "The tenant confirms receipt of property keys, access cards, and condition checklist.",
  notesAr: "يقر المستأجر باستلام جميع مفاتيح العقار وبطاقات الدخول بحالة ممتازة وفق جدول المعاينة.",
  termsAndConditions: "The tenant accepts keys in good condition. All security tokens must be returned upon lease conclusion.",
  termsAndConditionsAr: "يتحمل المستأجر مسؤولية المحافظة على المفاتيح والبطاقات وإعادتها عند انتهاء فترة التعاقد.",
  footerNote: "Official Handover Protocol • Al Ameen Real Estate W.L.L",
  footerNoteAr: "محضر التسليم الرسمي • الامين للعقارات ذ.م.م",
  languageMode: "en",
};

const DEFAULT_ACKNOWLEDGEMENT_SUBMODULE: SubmoduleDocBranding = {
  documentTitle: "PAYMENT & TOKEN ACKNOWLEDGEMENT RECEIPT",
  documentSubtitle: "Official Transaction & Security Booking Acknowledgment",
  documentTitleAr: "إيصال إقرار واستلام دفعة الحجز",
  documentSubtitleAr: "إقرار رسمي باستلام عربون حجز الوحدة العقارية",
  bannerImageUrl: null,
  bannerHeight: 120,
  bannerWidthPercent: 100,
  bannerFit: "fill",
  bannerStretch: true,
  bannerBorderRadius: 0,
  showBanner: true,
  showSignature: true,
  signatureScale: 100,
  showStamp: true,
  stampScale: 100,
  signatoryNameOverride: "",
  signatoryTitleOverride: "",
  notes: "Acknowledgment of received security deposit, token payment, and reservation clearance.",
  notesAr: "إقرار باستلام مبلغ التأمين وعربون الحجز المبدئي لحين توقيع العقد النهائي.",
  termsAndConditions: "Payment and token handover acknowledgement is issued under official company policies.",
  termsAndConditionsAr: "يخضع إقرار الحجز واستلام العربون للسياسات واللوائح المعتمدة لدى الشركة.",
  footerNote: "Transaction Acknowledgment • Subject to banking clearance",
  footerNoteAr: "إقرار معاملة مالية • مشروط بالتحصيل البنكي النهائي",
  languageMode: "en",
};

const DEFAULT_LEASE_SUBMODULE: SubmoduleDocBranding = {
  documentTitle: "RESIDENTIAL & COMMERCIAL LEASE AGREEMENT",
  documentSubtitle: "Tenancy Contract & Legal Terms",
  documentTitleAr: "عقد إيجار سكني وتجاري موحد",
  documentSubtitleAr: "عقد إيجار عقاري وشروط التعاقد القانونية",
  bannerImageUrl: null,
  bannerHeight: 130,
  bannerWidthPercent: 100,
  bannerFit: "fill",
  bannerStretch: true,
  bannerBorderRadius: 0,
  showBanner: true,
  showSignature: true,
  signatureScale: 100,
  showStamp: true,
  stampScale: 100,
  signatoryNameOverride: "",
  signatoryTitleOverride: "",
  notes: "Standard Tenancy Contract entered between Lessor and Lessee.",
  notesAr: "عقد إيجار رسمي مبرم بين الطرف الأول (المؤجر) والطرف الثاني (المستأجر).",
  termsAndConditions: "Terms and conditions are governed by Law No. 4 of 2008 concerning Property Leasing in the State of Qatar.",
  termsAndConditionsAr: "تخضع جميع بنود هذا العقد لأحكام القانون رقم (4) لسنة 2008 بشأن إيجار العقارات في دولة قطر ولجنة فض المنازعات الإيجارية.",
  footerNote: "Standard Tenancy Agreement • Registered with Rental Dispute Committee",
  footerNoteAr: "عقد إيجار موحد • معتمد لدى لجنة فض المنازعات الإيجارية في قطر",
  languageMode: "en",
};

const DEFAULT_BRANDING: DocumentBranding = {
  companyName: "Al Ameen Real Estate",
  legalEntityName: "Al Ameen Real Estate W.L.L",
  companyNameAr: "الامين للعقارات",
  legalEntityNameAr: "شركة الامين للعقارات ذ.م.م",
  crNumber: "CR-90821-QA",
  taxNumber: "TAX-300912-QA",
  address: "Grand Hamad Avenue, Building 42, Floor 7, Doha, State of Qatar",
  addressAr: "شارع حمد الكبير، مبنى 42، الطابق 7، الدوحة، دولة قطر",
  phone: "+974 4499 1234",
  email: "contact@alameen.qa",
  website: "www.alameen.qa",
  headerImageUrl: null,
  globalBannerHeight: 120,
  globalBannerWidthPercent: 100,
  globalBannerFit: "fill",
  globalBannerStretch: true,
  globalBannerBorderRadius: 0,
  footerText: "Al Ameen Real Estate W.L.L • Registered in the State of Qatar • CR-90821-QA",
  signatureImageUrl: null,
  authorizedSignatoryName: "Jithin Abdul Latheef",
  authorizedSignatoryTitle: "General Manager",
  authorizedSignatoryNameAr: "جيثين عبد اللطيف",
  authorizedSignatoryTitleAr: "المدير العام",
  stampImageUrl: null,
  receiptTerms: DEFAULT_RECEIPT_SUBMODULE.termsAndConditions,
  leaseTerms: DEFAULT_LEASE_SUBMODULE.termsAndConditions,
  acknowledgementTerms: DEFAULT_ACKNOWLEDGEMENT_SUBMODULE.termsAndConditions,
  handoverTerms: DEFAULT_TOKEN_SUBMODULE.termsAndConditions,
  submodules: {
    receiptVoucher: DEFAULT_RECEIPT_SUBMODULE,
    tokenHandover: DEFAULT_TOKEN_SUBMODULE,
    acknowledgementReceipt: DEFAULT_ACKNOWLEDGEMENT_SUBMODULE,
    leaseAgreement: DEFAULT_LEASE_SUBMODULE,
  },
  updatedAt: new Date().toISOString(),
};

export function getDocumentBranding(): DocumentBranding {
  if (typeof window === "undefined") return DEFAULT_BRANDING;
  try {
    const raw = localStorage.getItem(BRANDING_STORAGE_KEY) || localStorage.getItem("pms_organization_document_branding_v2") || localStorage.getItem("pms_organization_document_branding_v1");
    if (!raw) return DEFAULT_BRANDING;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_BRANDING,
      ...parsed,
      submodules: {
        receiptVoucher: { ...DEFAULT_RECEIPT_SUBMODULE, ...(parsed.submodules?.receiptVoucher || {}) },
        tokenHandover: { ...DEFAULT_TOKEN_SUBMODULE, ...(parsed.submodules?.tokenHandover || {}) },
        acknowledgementReceipt: { ...DEFAULT_ACKNOWLEDGEMENT_SUBMODULE, ...(parsed.submodules?.acknowledgementReceipt || {}) },
        leaseAgreement: { ...DEFAULT_LEASE_SUBMODULE, ...(parsed.submodules?.leaseAgreement || {}) },
      },
    };
  } catch {
    return DEFAULT_BRANDING;
  }
}

export function saveDocumentBranding(branding: Partial<DocumentBranding>): DocumentBranding {
  const current = getDocumentBranding();
  const updated: DocumentBranding = {
    ...current,
    ...branding,
    submodules: {
      ...current.submodules,
      ...(branding.submodules || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to persist branding settings to local storage:", e);
    }
  }

  return updated;
}
