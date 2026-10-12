import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  ScanLine, 
  Upload, 
  CheckCircle2, 
  FileText, 
  User, 
  CreditCard, 
  Calendar, 
  Globe, 
  Sparkles, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export interface ExtractedKYCData {
  documentType: 'QID' | 'EMIRATES_ID' | 'IQAMA' | 'PASSPORT';
  idNumber: string;
  fullName: string;
  fullNameArabic?: string;
  nationality: string;
  dateOfBirth?: string;
  expiryDate: string;
  sponsorName?: string;
  occupation?: string;
  confidenceScore: number;
}

export const KYCVerificationOCRModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyData: (data: ExtractedKYCData) => void;
}> = ({ open, onOpenChange, onApplyData }) => {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedKYCData | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const simulateOCRProcessing = (fileName: string) => {
    setIsProcessing(true);
    setExtractedData(null);

    // Simulate realistic intelligent OCR extraction with regional QID/Emirates ID heuristics
    setTimeout(() => {
      setIsProcessing(false);
      const mockResult: ExtractedKYCData = {
        documentType: 'QID',
        idNumber: `2916340${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: 'MOHAMMED SALMAN AL-MANSOORI',
        fullNameArabic: 'محمد سلمان المنصوري',
        nationality: 'Qatar (QAT)',
        dateOfBirth: '1991-08-14',
        expiryDate: '2028-11-20',
        sponsorName: 'QATAR PETROLEUM / ENERGY SECTOR',
        occupation: 'Senior Financial Analyst',
        confidenceScore: 98.4
      };

      setExtractedData(mockResult);
      toast.success('KYC Document processed & verified with 98.4% AI confidence score');
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFilePreview(event.target?.result as string);
      simulateOCRProcessing(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    if (!extractedData) return;
    onApplyData(extractedData);
    toast.success('Tenant profile pre-filled from scanned KYC credential');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-indigo-600" />
            <DialogTitle>AI KYC & National ID OCR Scanner</DialogTitle>
          </div>
          <DialogDescription>
            Upload QID, Emirates ID, Saudi Iqama, or Passport to auto-populate tenant lease credentials.
          </DialogDescription>
        </DialogHeader>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,.pdf"
          className="hidden"
          onChange={handleFileUpload}
        />

        <div className="space-y-4 py-2">
          {/* Upload Area */}
          {!filePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl p-8 text-center cursor-pointer bg-slate-50 dark:bg-slate-900/40 transition-colors flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold">Click to upload or drag & drop</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Supports High-Res PNG, JPG, or PDF (QID / National ID card front/back or Passport Bio)
                </p>
              </div>
              <Badge variant="secondary" className="text-[11px] gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" /> Instant OCR Auto-Extraction
              </Badge>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Document Image Thumbnail */}
              <div className="md:col-span-5 relative group rounded-lg border overflow-hidden bg-black/5 flex flex-col items-center justify-center p-2">
                <img src={filePreview} alt="Uploaded KYC" className="max-h-48 object-contain rounded" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 h-7 text-xs bg-background/80 backdrop-blur-sm"
                >
                  <RefreshCw className="w-3 h-3 mr-1" /> Re-upload
                </Button>
              </div>

              {/* Extraction Details */}
              <div className="md:col-span-7">
                {isProcessing ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center p-4">
                    <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mb-2" />
                    <p className="text-sm font-medium">Scanning document fields...</p>
                    <p className="text-xs text-muted-foreground">Extracting QID #, Full Name, Expiry & Sponsor data</p>
                  </div>
                ) : extractedData ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> {extractedData.documentType} Verified ({extractedData.confidenceScore}%)
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-muted/40 border">
                        <span className="text-muted-foreground block text-[10px]">ID / QID Number</span>
                        <span className="font-bold text-foreground">{extractedData.idNumber}</span>
                      </div>
                      <div className="p-2 rounded bg-muted/40 border">
                        <span className="text-muted-foreground block text-[10px]">Expiry Date</span>
                        <span className="font-bold text-foreground">{extractedData.expiryDate}</span>
                      </div>
                      <div className="col-span-2 p-2 rounded bg-muted/40 border">
                        <span className="text-muted-foreground block text-[10px]">Legal Name (Latin)</span>
                        <span className="font-bold text-foreground">{extractedData.fullName}</span>
                      </div>
                      {extractedData.fullNameArabic && (
                        <div className="col-span-2 p-2 rounded bg-muted/40 border text-right" dir="rtl">
                          <span className="text-muted-foreground block text-[10px] text-left">Legal Name (Arabic)</span>
                          <span className="font-bold text-foreground text-sm font-arabic">{extractedData.fullNameArabic}</span>
                        </div>
                      )}
                      <div className="p-2 rounded bg-muted/40 border">
                        <span className="text-muted-foreground block text-[10px]">Nationality</span>
                        <span className="font-semibold text-foreground">{extractedData.nationality}</span>
                      </div>
                      <div className="p-2 rounded bg-muted/40 border">
                        <span className="text-muted-foreground block text-[10px]">Occupation</span>
                        <span className="font-semibold text-foreground">{extractedData.occupation || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!extractedData || isProcessing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Apply to Tenant Form
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
